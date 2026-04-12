/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  SamakMarket — Agent WhatsApp v2                             ║
 * ║  Stack: Baileys + Groq (test) / Claude (prod) + MySQL        ║
 * ║                                                              ║
 * ║  npm install @whiskeysockets/baileys @hapi/boom              ║
 * ║  npm install groq-sdk @anthropic-ai/sdk qrcode-terminal pino ║
 * ║  npm install node-fetch                                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict';
require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} = require('@whiskeysockets/baileys');


const Groq      = require('groq-sdk');
const Anthropic = require('@anthropic-ai/sdk');
const qrcode    = require('qrcode-terminal');
const P         = require('pino');
const mysql     = require('mysql2/promise');
const fetch     = require('node-fetch');
const fs        = require('fs');

// ══════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════
const ENV = process.env.NODE_ENV || 'development'; // development = Groq, production = Claude

const CONFIG = {
  USE_GROQ:       ENV !== 'production',             // true = Groq (gratuit), false = Claude
  GROQ_KEY:       process.env.GROQ_API_KEY   || '',
  CLAUDE_KEY:     process.env.CLAUDE_API_KEY || '',
  GROQ_MODEL:     'llama-3.3-70b-versatile',                 // rapide + gratuit
  CLAUDE_MODEL:   'claude-sonnet-4-20250514',
  MAX_TOKENS:     180,                              // court = moins de tokens
  MAX_HISTORY:    6,                                // 3 échanges gardés
  TYPING_MS:      700,

  SESSION_DIR:    './wa-session',
  // Géoloc IP (gratuit, sans clé)
  GEOIP_URL:      'http://ip-api.com/json/',
  DB_HOST:        process.env.DB_HOST     || 'localhost',
  DB_PORT:        process.env.DB_PORT     || 3306,
  DB_USER:        process.env.DB_USER     || 'root',
  DB_PASS:        process.env.DB_PASSWORD || '',
  DB_NAME:        process.env.DB_NAME     || 'samakmarket',
};

console.log(`🤖 Mode: ${CONFIG.USE_GROQ ? 'GROQ (test)' : 'CLAUDE (prod)'}`);

// ── Clients LLM ──────────────────────────────────────────────────
const groq   = CONFIG.USE_GROQ ? new Groq({ apiKey: CONFIG.GROQ_KEY })     : null;
const claude = !CONFIG.USE_GROQ ? new Anthropic({ apiKey: CONFIG.CLAUDE_KEY }) : null;

// ── State ────────────────────────────────────────────────────────
const conversations = new Map(); // phone → [{role,content}]
const geoCache      = new Map(); // ip → geoData
let db;

// ══════════════════════════════════════════════════════════════════
// BASE DE DONNÉES
// ══════════════════════════════════════════════════════════════════
async function initDB() {
  db = await mysql.createPool({
    host: CONFIG.DB_HOST, port: CONFIG.DB_PORT,
    user: CONFIG.DB_USER, password: CONFIG.DB_PASS,
    database: CONFIG.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  // Table commandes WA
  await db.query(`
    CREATE TABLE IF NOT EXISTS wa_orders (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      phone         VARCHAR(30),
      pays          VARCHAR(50),
      ville         VARCHAR(100),
      langue        VARCHAR(10),
      produit       VARCHAR(100),
      quantite      DECIMAL(8,2),
      unite         VARCHAR(20) DEFAULT 'kg',
      prix_unitaire DECIMAL(10,2),
      total         DECIMAL(10,2),
      livraison     VARCHAR(200),
      promo_utilisee VARCHAR(50),
      status        VARCHAR(20) DEFAULT 'pending',
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX (phone), INDEX (status), INDEX (pays)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Table visiteurs WA (analytics)
  await db.query(`
    CREATE TABLE IF NOT EXISTS wa_visitors (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      phone      VARCHAR(30) UNIQUE,
      pays       VARCHAR(50),
      ville      VARCHAR(100),
      langue     VARCHAR(10),
      nb_msgs    INT DEFAULT 0,
      nb_orders  INT DEFAULT 0,
      first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (pays), INDEX (langue)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  console.log('✅ DB OK');
}

async function getProducts() {
  try {
    const [rows] = await db.query(
      'SELECT name, price, unit, category FROM products WHERE is_available=1 ORDER BY updated_at DESC LIMIT 15'
    );
    return rows;
  } catch {
    return [
      { name: 'Sardine fraîche',   price: 20,  unit: 'kg', category: 'sardine'  },
      { name: 'Crevettes royales', price: 80,  unit: 'kg', category: 'crevette' },
      { name: 'Calamar',           price: 70,  unit: 'kg', category: 'calamar'  },
      { name: 'Thon rouge',        price: 85,  unit: 'kg', category: 'thon'     },
      { name: 'Mérou',             price: 95,  unit: 'pièce', category: 'mérou' },
    ];
  }
}

async function saveOrder(data) {
  try {
    await db.query(
      `INSERT INTO wa_orders (phone,pays,ville,langue,produit,quantite,unite,prix_unitaire,total,livraison,promo_utilisee)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [data.phone, data.pays, data.ville, data.langue,
       data.produit, data.quantite, data.unite,
       data.prix_unitaire, data.total, data.livraison, data.promo || null]
    );
    await db.query(
      `INSERT INTO wa_visitors (phone,pays,ville,langue,nb_orders)
       VALUES (?,?,?,?,1)
       ON DUPLICATE KEY UPDATE nb_orders=nb_orders+1, last_seen=NOW()`,
      [data.phone, data.pays, data.ville, data.langue]
    );
  } catch (e) { console.warn('saveOrder:', e.message); }
}
async function trackVisitor(phone, geo, lang) {
  if (!phone || phone.length < 8) return  // ← ignore les IDs invalides
  try {
    await db.query(
      `INSERT INTO wa_visitors (phone, pays, ville, langue, nb_msgs, first_seen, last_seen)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         nb_msgs   = nb_msgs + 1,
         last_seen = NOW(),
         pays      = IF(pays IS NULL OR pays='', VALUES(pays), pays),
         ville     = IF(ville IS NULL OR ville='', VALUES(ville), ville)`,
      [phone, geo.pays, geo.ville, lang]
    )
    console.log(`📊 Visiteur enregistré: ${geo.flag} ${phone}`)
  } catch (e) {
    console.warn('trackVisitor:', e.message)
  }
  
}
// async function trackVisitor(phone, geo) {
//   try {
//     await db.query(
//       `INSERT INTO wa_visitors (phone,pays,ville,langue,nb_msgs)
//        VALUES (?,?,?,?,1)
//        ON DUPLICATE KEY UPDATE nb_msgs=nb_msgs+1, last_seen=NOW()`,
//       [phone, geo.pays, geo.ville, geo.langue]
//     );
//   } catch (e) { console.warn('trackVisitor:', e.message); }
// }

// ══════════════════════════════════════════════════════════════════
// GÉOLOCALISATION + LANGUE
// ══════════════════════════════════════════════════════════════════

// Détecte la langue depuis le contenu du message (darija/fr/ar/en)
function detectLangFromMsg(text) {
  const t = text.toLowerCase();
  const arabic = /[\u0600-\u06FF]/.test(text);
  const darijaKw = ['salam','bghit','3ndi','chhal','kayn','wakha','mzyan','iyeh','la','fin','ach','smak'];
  const frKw     = ['bonjour','salut','je veux','combien','disponible','livraison','commande'];
  const enKw     = ['hello','hi','want','how much','price','order','fish'];

  if (arabic) return 'ar';
  if (darijaKw.some(k => t.includes(k))) return 'darija';
  if (frKw.some(k => t.includes(k))) return 'fr';
  if (enKw.some(k => t.includes(k))) return 'en';
  return 'darija'; // défaut Maroc
}

// Géolocalisation par numéro de téléphone (indicatif pays)
function geoFromPhone(phone) {
  const num = phone.replace(/\D/g, '');
  if (num.startsWith('212') || num.startsWith('00212')) return { pays: 'Maroc',   ville: 'Maroc',   flag: '🇲🇦' };
  if (num.startsWith('33')  || num.startsWith('0033'))  return { pays: 'France',  ville: 'France',  flag: '🇫🇷' };
  if (num.startsWith('34'))                              return { pays: 'Espagne', ville: 'Espagne', flag: '🇪🇸' };
  if (num.startsWith('49'))                              return { pays: 'Allemagne',ville:'Allemagne',flag:'🇩🇪'};
  if (num.startsWith('32'))                              return { pays: 'Belgique',ville:'Belgique', flag: '🇧🇪' };
  if (num.startsWith('31'))                              return { pays: 'Pays-Bas',ville:'Pays-Bas', flag: '🇳🇱' };
  if (num.startsWith('1'))                               return { pays: 'USA/Canada',ville:'Amérique',flag:'🇺🇸'};
  return { pays: 'International', ville: '?', flag: '🌍' };
}

// ══════════════════════════════════════════════════════════════════
// PROMOTIONS (3 propositions dynamiques)
// ══════════════════════════════════════════════════════════════════
function getActivePromos(products) {
  const today = new Date();
  const jour  = today.getDay(); // 0=dim, 5=ven, 6=sam
  const heure = today.getHours();

  const promos = [];

  // Promo 1 — Weekend : -15% sardine
  if (jour === 5 || jour === 6 || jour === 0) {
    const sardine = products.find(p => p.category === 'sardine');
    if (sardine) {
      promos.push({
        code:    'WEEKEND15',
        label:   `Weekend 🎉 Sardine à ${Math.round(sardine.price * 0.85)}dh/kg (−15%)`,
        produit: 'sardine',
        remise:  0.15,
      });
    }
  }

  // Promo 2 — Matin frais (avant 10h) : livraison offerte
  if (heure < 10) {
    promos.push({
      code:  'MATIN_FRAIS',
      label: '🌅 Commande avant 10h → Livraison offerte!',
      type:  'livraison',
      remise: 0,
    });
  }

  // Promo 3 — Lot 3kg+ : -10% sur tout
  promos.push({
    code:  'LOT3KG',
    label: '📦 3kg ou plus → −10% sur votre commande',
    type:  'quantite',
    remise: 0.10,
    minQty: 3,
  });

  // Toujours 3 promos — complète si besoin
  if (promos.length < 3) {
    promos.push({
      code:  'FIDELE',
      label: '⭐ Client fidèle → 1kg offert à partir de 5kg',
      type:  'fidelite',
      remise: 0,
    });
  }

  return promos.slice(0, 3);
}

// ══════════════════════════════════════════════════════════════════
// PROMPT SYSTÈME — OPTIMISÉ (peu de tokens)
// ══════════════════════════════════════════════════════════════════
async function buildPrompt(geo, lang, products) {
  const promos = getActivePromos(products);

  const prodList = products.slice(0, 8).map(p =>
    `${p.name}:${p.price}dh/${p.unit}`
  ).join(', ');

  const promoList = promos.map((p,i) => `${i+1}. ${p.label} [${p.code}]`).join('\n');

  // Instructions adaptées à la langue
  const langInstr = {
    'darija': 'Réponds en Darija marocaine courte.',
    'ar':     'أجب بالعربية المغربية بإيجاز.',
    'fr':     'Réponds en français court et naturel.',
    'en':     'Reply in short English.',
  }[lang] || 'Réponds en Darija courte.';

  return `Agent commercial SamakMarket (poisson frais Maroc). ${langInstr}
Max 2 phrases. Jamais inventer prix. Jamais parler paiement.

PRODUITS: ${prodList}

PROMOS ACTIVES:
${promoList}

FLOW: besoin→produit→quantité→total(prix×qte)→livraison→résumé→confirmation
Si commande validée, réponds EXACTEMENT: COMMANDE:{"p":"sardine","q":2,"u":"kg","pu":20,"t":40,"l":"Tanger","promo":"LOT3KG"}
Propose 1 promo pertinente au bon moment. Client hésitant→rassure. Produit absent→propose alternative.`;
}

// ══════════════════════════════════════════════════════════════════
// APPEL LLM (Groq ou Claude)
// ══════════════════════════════════════════════════════════════════
async function callLLM(systemPrompt, messages) {
  if (CONFIG.USE_GROQ) {
    const res = await groq.chat.completions.create({
      model:      CONFIG.GROQ_MODEL,
      max_tokens: CONFIG.MAX_TOKENS,
      messages:   [{ role: 'system', content: systemPrompt }, ...messages],
    });
    return res.choices[0].message.content.trim();
  } else {
    const res = await claude.messages.create({
      model:      CONFIG.CLAUDE_MODEL,
      max_tokens: CONFIG.MAX_TOKENS,
      system:     systemPrompt,
      messages,
    });
    return res.content[0].text.trim();
  }
}

// ══════════════════════════════════════════════════════════════════
// AGENT PRINCIPAL
// ══════════════════════════════════════════════════════════════════
async function agentReply(phone, userMsg) {
  const geo      = geoFromPhone(phone);
  const lang     = detectLangFromMsg(userMsg);
  const products = await getProducts();
  const prompt   = await buildPrompt(geo, lang, products);

  // Historique
  if (!conversations.has(phone)) conversations.set(phone, []);
  const hist = conversations.get(phone);
  hist.push({ role: 'user', content: userMsg });
  const trimmed = hist.slice(-CONFIG.MAX_HISTORY);

  // Track visiteur
  await trackVisitor(phone, { pays: geo.pays, ville: geo.ville, langue: lang });

  let reply;
  try {
    reply = await callLLM(prompt, trimmed);
  } catch (e) {
    console.error('LLM error:', e.message);
    reply = lang === 'fr'
      ? 'Désolé, une erreur est survenue. Réessayez.'
      : 'Salam, kayn mochkil sgher 🙏 3awd jreb.';
  }

  hist.push({ role: 'assistant', content: reply });

  // Commande validée ?
  if (reply.includes('COMMANDE:')) {
    try {
      const json  = reply.split('COMMANDE:')[1].trim();
      const order = JSON.parse(json);
      await saveOrder({
        phone,
        pays:          geo.pays,
        ville:         geo.ville,
        langue:        lang,
        produit:       order.p,
        quantite:      order.q,
        unite:         order.u,
        prix_unitaire: order.pu,
        total:         order.t,
        livraison:     order.l,
        promo:         order.promo || null,
      });
      conversations.set(phone, []); // reset historique

      const thanks = {
        darija: `✅ Commande validée! Shokran ${geo.flag}\nSad tslek pêcheur daba. Bslama 🐟`,
        fr:     `✅ Commande confirmée! Merci ${geo.flag}\nLe pêcheur vous contacte bientôt. 🐟`,
        en:     `✅ Order confirmed! Thank you ${geo.flag}\nFisherman will contact you soon. 🐟`,
        ar:     `✅ تم تأكيد الطلب! شكراً ${geo.flag}\nسيتصل بك البائع قريباً 🐟`,
      };
      return thanks[lang] || thanks.darija;
    } catch (e) { console.warn('Order parse:', e.message); }
  }

  return reply;
}

// ══════════════════════════════════════════════════════════════════
// BAILEYS — CONNEXION WHATSAPP
// ══════════════════════════════════════════════════════════════════
async function startAgent() {
  if (!fs.existsSync(CONFIG.SESSION_DIR)) fs.mkdirSync(CONFIG.SESSION_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(CONFIG.SESSION_DIR);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
    },
    logger:             P({ level: 'silent' }),
    printQRInTerminal:  false,
    syncFullHistory:    false,
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n📱 Scanne le QR code:\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const reconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (reconnect) setTimeout(startAgent, 3000);
    }
    if (connection === 'open') console.log('\n✅ Agent SamakMarket actif 🐟\n');
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (msg.key.fromMe)                           continue;
      if (msg.key.remoteJid === 'status@broadcast') continue;
      if (msg.key.remoteJid.endsWith('@g.us'))      continue;

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption || '';

      if (!text.trim()) continue;

     // APRÈS msg.key.remoteJid
const jid = msg.key.remoteJid

const phone = extractPhone(msg)

// Log debug
console.log('DEBUG →', {
  jid:       msg.key.remoteJid,
  phone,
  pushName:  msg.pushName,
  msgKeys:   Object.keys(msg.message || {})
})

// Accepte lid_ aussi pour ne pas bloquer les messages
if (!phone) continue

const geo  = geoFromPhone(phone)
const lang = detectLangFromMsg(text)

// ← enregistre DÈS le premier message
await trackVisitor(phone, geo, lang)
console.log('jid:', jid)
console.log('participant:', msg.key.participant)
console.log('pushName:', msg.pushName)
console.log('remoteJid:', msg.key.remoteJid)
console.log(`📨 [${geo.flag} +${phone}]: ${text}`)

      await sock.readMessages([msg.key]);
      await sock.sendPresenceUpdate('composing', msg.key.remoteJid);
      await new Promise(r => setTimeout(r, CONFIG.TYPING_MS));

      const reply = await agentReply(phone, text);

      await sock.sendPresenceUpdate('paused', msg.key.remoteJid);
      await sock.sendMessage(msg.key.remoteJid, { text: reply });
      console.log(`📤 [${geo.flag}]: ${reply.slice(0, 80)}`);
    }
  });
  // Ajoute cette fonction dans whatsapp-agent.js
function extractPhone(msg) {
  const jid = msg.key.remoteJid || ''

  // Format normal
  if (jid.includes('@s.whatsapp.net')) {
    return jid.replace('@s.whatsapp.net', '').replace(/\D/g, '')
  }

  // Nouveau système @lid — cherche dans messageContextInfo
  const ctx = msg.message?.messageContextInfo
  if (ctx) {
    // deviceListMetadata contient parfois le numéro
    const senderLid = ctx?.deviceListMetadata?.senderLid
    const senderKeyHash = ctx?.deviceListMetadata?.senderKeyHash
    console.log('messageContextInfo:', JSON.stringify(ctx, null, 2))
  }

  // Fallback — garde le lid comme ID unique
  return jid.replace('@lid', '').replace(/\D/g, '')
}
}

// ══════════════════════════════════════════════════════════════════
// DÉMARRAGE
// ══════════════════════════════════════════════════════════════════
(async () => {
  console.log('🐟 SamakMarket WhatsApp Agent v2\n');
  await initDB();
  await startAgent();
})();

/*
══════════════════════════════════════════════════════════
VARIABLES .env à ajouter:

GROQ_API_KEY=gsk_xxxxx       ← https://console.groq.com (gratuit)
CLAUDE_API_KEY=sk-ant-xxxxx  ← pour prod
NODE_ENV=development          ← development=Groq, production=Claude

══════════════════════════════════════════════════════════
TABLES CRÉÉES AUTOMATIQUEMENT:
  wa_orders   → toutes les commandes avec pays/ville/langue/promo
  wa_visitors → analytics visiteurs WhatsApp

══════════════════════════════════════════════════════════
REQUÊTES ANALYTICS UTILES:

-- Commandes par pays
SELECT pays, COUNT(*) as nb, SUM(total) as ca FROM wa_orders GROUP BY pays;

-- Langues utilisées
SELECT langue, COUNT(*) as nb FROM wa_visitors GROUP BY langue;

-- Promos les plus utilisées
SELECT promo_utilisee, COUNT(*) as nb FROM wa_orders
WHERE promo_utilisee IS NOT NULL GROUP BY promo_utilisee;
══════════════════════════════════════════════════════════
*/
