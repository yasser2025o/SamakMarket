/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  SamakMarket — Agent WhatsApp v3                             ║
 * ║  Stack: whatsapp-web.js + Groq/Claude + MySQL                ║
 * ║                                                              ║
 * ║  INSTALLATION:                                               ║
 * ║  npm uninstall @whiskeysockets/baileys                       ║
 * ║  npm install whatsapp-web.js qrcode-terminal                 ║
 * ║  npm install groq-sdk @anthropic-ai/sdk                      ║
 * ║                                                              ║
 * ║  LANCER: node whatsapp-agent.js                              ║
 * ║  Scanner QR → ton numéro répond automatiquement              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict';
require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode  = require('qrcode-terminal');
const Groq    = require('groq-sdk');
const Anthropic = require('@anthropic-ai/sdk');
const mysql   = require('mysql2/promise');
const fs      = require('fs');

// ══════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════
const ENV = process.env.NODE_ENV || 'development';
const CFG = {
  USE_GROQ:     ENV !== 'production',
  GROQ_KEY:     process.env.GROQ_API_KEY   || '',
  CLAUDE_KEY:   process.env.CLAUDE_API_KEY || '',
  GROQ_MODEL:   'llama3-8b-8192',
  CLAUDE_MODEL: 'claude-sonnet-4-20250514',
  MAX_TOKENS:   180,
  MAX_HISTORY:  6,
  TYPING_MS:    800,
  DB_HOST:      process.env.DB_HOST     || 'localhost',
  DB_PORT:      process.env.DB_PORT     || 3306,
  DB_USER:      process.env.DB_USER     || 'root',
  DB_PASS:      process.env.DB_PASSWORD || '',
  DB_NAME:      process.env.DB_NAME     || 'samakmarket',
  AGENT_NUM:    '212647689006',
};

console.log(`🤖 Mode: ${CFG.USE_GROQ ? 'GROQ (test)' : 'CLAUDE (prod)'}`);

// ── LLM clients ──────────────────────────────────────────────────
const groq   = CFG.USE_GROQ  ? new Groq({ apiKey: CFG.GROQ_KEY })        : null;
const claude = !CFG.USE_GROQ ? new Anthropic({ apiKey: CFG.CLAUDE_KEY }) : null;

// ── State ────────────────────────────────────────────────────────
const conversations = new Map(); // phone → [{role,content}]
let db;

// ══════════════════════════════════════════════════════════════════
// BASE DE DONNÉES
// ══════════════════════════════════════════════════════════════════
async function initDB() {
  db = await mysql.createPool({
    host:     CFG.DB_HOST,
    port:     parseInt(CFG.DB_PORT),
    user:     CFG.DB_USER,
    password: CFG.DB_PASS,
    database: CFG.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  await db.query(`
    CREATE TABLE IF NOT EXISTS wa_orders (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      phone         VARCHAR(30),
      nom_contact   VARCHAR(100),
      pays          VARCHAR(50),
      ville         VARCHAR(100),
      langue        VARCHAR(10),
      produit       VARCHAR(100),
      preparation   VARCHAR(50),
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

  await db.query(`
    CREATE TABLE IF NOT EXISTS wa_visitors (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      phone      VARCHAR(30) UNIQUE,
      nom        VARCHAR(100),
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
      { name: 'Sardine fraîche',   price: 20,  unit: 'kg',    category: 'sardine'  },
      { name: 'Crevettes royales', price: 80,  unit: 'kg',    category: 'crevette' },
      { name: 'Calamar',           price: 70,  unit: 'kg',    category: 'calamar'  },
      { name: 'Thon rouge',        price: 85,  unit: 'kg',    category: 'thon'     },
      { name: 'Mérou',             price: 95,  unit: 'pièce', category: 'mérou'    },
    ];
  }
}

async function saveOrder(data) {
  try {
    await db.query(
      `INSERT INTO wa_orders
        (phone,nom_contact,pays,ville,langue,produit,preparation,quantite,unite,prix_unitaire,total,livraison,promo_utilisee)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [data.phone, data.nom, data.pays, data.ville, data.langue,
       data.produit, data.preparation || 'Entier',
       data.quantite, data.unite,
       data.prix_unitaire, data.total,
       data.livraison, data.promo || null]
    );
    await db.query(
      `INSERT INTO wa_visitors (phone,nom,pays,ville,langue,nb_orders)
       VALUES (?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE nb_orders=nb_orders+1, last_seen=NOW()`,
      [data.phone, data.nom, data.pays, data.ville, data.langue]
    );
    console.log(`📦 Commande sauvegardée: ${data.phone} → ${data.produit}`);
  } catch (e) { console.warn('saveOrder:', e.message); }
}

async function trackVisitor(phone, nom, geo, lang) {
  try {
    await db.query(
      `INSERT INTO wa_visitors (phone,nom,pays,ville,langue,nb_msgs)
       VALUES (?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE
         nb_msgs=nb_msgs+1,
         last_seen=NOW(),
         nom=IF(nom IS NULL OR nom='', VALUES(nom), nom)`,
      [phone, nom || null, geo.pays, geo.ville, lang]
    );
  } catch (e) { console.warn('trackVisitor:', e.message); }
}

// ══════════════════════════════════════════════════════════════════
// GÉO + LANGUE
// ══════════════════════════════════════════════════════════════════
function geoFromPhone(phone) {
  const n = phone.replace(/\D/g, '');
  if (n.startsWith('212'))  return { pays: 'Maroc',     ville: 'Maroc',     flag: '🇲🇦' };
  if (n.startsWith('33'))   return { pays: 'France',    ville: 'France',    flag: '🇫🇷' };
  if (n.startsWith('34'))   return { pays: 'Espagne',   ville: 'Espagne',   flag: '🇪🇸' };
  if (n.startsWith('32'))   return { pays: 'Belgique',  ville: 'Belgique',  flag: '🇧🇪' };
  if (n.startsWith('31'))   return { pays: 'Pays-Bas',  ville: 'Pays-Bas',  flag: '🇳🇱' };
  if (n.startsWith('49'))   return { pays: 'Allemagne', ville: 'Allemagne', flag: '🇩🇪' };
  if (n.startsWith('1'))    return { pays: 'USA/Canada',ville: 'Amérique',  flag: '🇺🇸' };
  if (n.startsWith('44'))   return { pays: 'UK',        ville: 'UK',        flag: '🇬🇧' };
  if (n.startsWith('39'))   return { pays: 'Italie',    ville: 'Italie',    flag: '🇮🇹' };
  return { pays: 'International', ville: '?', flag: '🌍' };
}

function detectLang(text) {
  const t = text.toLowerCase();
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  const darija = ['salam','bghit','3ndi','chhal','kayn','wakha','mzyan','ach','smak','fin','iyeh'];
  const fr     = ['bonjour','salut','je veux','combien','disponible','livraison'];
  const en     = ['hello','hi','want','how much','price','order'];
  if (darija.some(k => t.includes(k))) return 'darija';
  if (fr.some(k => t.includes(k)))     return 'fr';
  if (en.some(k => t.includes(k)))     return 'en';
  return 'darija';
}

// ══════════════════════════════════════════════════════════════════
// PROMOTIONS
// ══════════════════════════════════════════════════════════════════
function getPromos(products) {
  const jour  = new Date().getDay();
  const heure = new Date().getHours();
  const promos = [];

  if (jour === 5 || jour === 6 || jour === 0) {
    const s = products.find(p => p.category === 'sardine');
    if (s) promos.push({ code: 'WEEKEND15', label: `Weekend sardine ${Math.round(s.price*.85)}dh/kg (−15%)` });
  }
  if (heure < 10)
    promos.push({ code: 'MATIN_FRAIS', label: 'Commande avant 10h → livraison offerte' });

  promos.push({ code: 'LOT3KG', label: '3kg+ → −10% sur tout' });

  return promos.slice(0, 3);
}

// ══════════════════════════════════════════════════════════════════
// PROMPT SYSTÈME
// ══════════════════════════════════════════════════════════════════
async function buildPrompt(geo, lang) {
  const products = await getProducts();
  const promos   = getPromos(products);
  const prodList = products.slice(0, 8).map(p => `${p.name}:${p.price}dh/${p.unit}`).join(', ');
  const promoList = promos.map((p,i) => `${i+1}. ${p.label} [${p.code}]`).join('\n');

  const langInstr = {
    darija: 'Réponds en Darija marocaine courte.',
    ar:     'أجب بالعربية المغربية بإيجاز.',
    fr:     'Réponds en français court.',
    en:     'Reply in short English.',
  }[lang] || 'Réponds en Darija courte.';

  return `Agent SamakMarket (poisson frais Maroc). ${langInstr}
Max 2 phrases. Jamais inventer prix. Jamais parler paiement.
PRODUITS: ${prodList}
PROMOS:\n${promoList}
FLOW: besoin→produit→quantité→total(prix×qte)→préparation(entier/filet/darne/papillon/portion)→livraison→résumé→confirmation
Si commande validée, réponds EXACTEMENT:
COMMANDE:{"p":"sardine","q":2,"u":"kg","pu":20,"t":40,"prep":"filet","l":"Tanger","promo":"LOT3KG"}
Propose 1 promo pertinente. Client hésitant→rassure. Produit absent→propose alternative.`;
}

// ══════════════════════════════════════════════════════════════════
// LLM
// ══════════════════════════════════════════════════════════════════
async function callLLM(systemPrompt, messages) {
  if (CFG.USE_GROQ) {
    const res = await groq.chat.completions.create({
      model:      CFG.GROQ_MODEL,
      max_tokens: CFG.MAX_TOKENS,
      messages:   [{ role: 'system', content: systemPrompt }, ...messages],
    });
    return res.choices[0].message.content.trim();
  } else {
    const res = await claude.messages.create({
      model:      CFG.CLAUDE_MODEL,
      max_tokens: CFG.MAX_TOKENS,
      system:     systemPrompt,
      messages,
    });
    return res.content[0].text.trim();
  }
}

// ══════════════════════════════════════════════════════════════════
// AGENT PRINCIPAL
// ══════════════════════════════════════════════════════════════════
async function agentReply(phone, nom, userMsg) {
  const geo  = geoFromPhone(phone);
  const lang = detectLang(userMsg);

  // Track dès le 1er message
  await trackVisitor(phone, nom, geo, lang);

  const prompt = await buildPrompt(geo, lang);

  if (!conversations.has(phone)) conversations.set(phone, []);
  const hist = conversations.get(phone);
  hist.push({ role: 'user', content: userMsg });
  const trimmed = hist.slice(-CFG.MAX_HISTORY);

  let reply;
  try {
    reply = await callLLM(prompt, trimmed);
  } catch (e) {
    console.error('LLM error:', e.message);
    reply = lang === 'fr'
      ? 'Désolé, erreur temporaire. Réessayez dans quelques secondes.'
      : 'Salam, kayn mochkil sgher 🙏 3awd jreb mn b3d.';
  }

  hist.push({ role: 'assistant', content: reply });

  // Commande validée
  if (reply.includes('COMMANDE:')) {
    try {
      const json  = reply.split('COMMANDE:')[1].trim();
      const order = JSON.parse(json);
      await saveOrder({
        phone, nom,
        pays:          geo.pays,
        ville:         geo.ville,
        langue:        lang,
        produit:       order.p,
        preparation:   order.prep || 'Entier',
        quantite:      order.q,
        unite:         order.u,
        prix_unitaire: order.pu,
        total:         order.t,
        livraison:     order.l,
        promo:         order.promo || null,
      });
      conversations.set(phone, []); // reset

      return {
        darija: `✅ Commande validée! Shokran ${geo.flag}\nSad tslek pêcheur daba. Bslama 🐟`,
        fr:     `✅ Commande confirmée! Merci ${geo.flag}\nLe pêcheur vous contacte bientôt. 🐟`,
        en:     `✅ Order confirmed! Thank you ${geo.flag}\nFisherman will contact you soon. 🐟`,
        ar:     `✅ تم تأكيد الطلب! شكراً ${geo.flag}\nسيتصل بك البائع قريباً 🐟`,
      }[lang] || `✅ Commande validée! 🐟`;
    } catch (e) { console.warn('Order parse:', e.message); }
  }

  return reply;
}

// ══════════════════════════════════════════════════════════════════
// WHATSAPP-WEB.JS CLIENT
// ══════════════════════════════════════════════════════════════════
async function startAgent() {
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './wa-session-wwjs' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
  });

  // QR Code
  client.on('qr', (qr) => {
    console.log('\n📱 Scanne ce QR code avec WhatsApp:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n(WhatsApp → ⋮ → Appareils liés → Lier un appareil)\n');
  });

  client.on('ready', () => {
    console.log('\n✅ Agent SamakMarket actif! 🐟');
    console.log(`📱 Numéro connecté: ${client.info?.wid?.user}\n`);
    // Expose le client pour l'API admin
    global.whatsappClient = client;
  });

  client.on('auth_failure', () => {
    console.error('❌ Authentification échouée. Supprime ./wa-session-wwjs et relance.');
  });

  client.on('disconnected', (reason) => {
    console.log('Déconnecté:', reason);
    global.whatsappClient = null;
    setTimeout(startAgent, 5000);
  });

  // ── Réception messages ──────────────────────────────────────
  client.on('message', async (msg) => {
    // Ignore groupes, status, messages envoyés
    if (msg.from === 'status@broadcast') return;
    if (msg.from.endsWith('@g.us'))       return;
    if (msg.fromMe)                        return;

    // ✅ whatsapp-web.js retourne TOUJOURS le vrai numéro
    const phone = msg.from.replace('@c.us', '').replace(/\D/g, '');
    const nom   = msg._data?.notifyName || msg.author || '';
    const text  = msg.body?.trim();

    if (!text || !phone) return;

    const geo = geoFromPhone(phone);
    console.log(`📨 [${geo.flag} +${phone} "${nom}"]: ${text}`);

    // Typing indicator
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    await new Promise(r => setTimeout(r, CFG.TYPING_MS));

    // Réponse agent
    const reply = await agentReply(phone, nom, text);

    await chat.clearState();
    await msg.reply(reply);

    console.log(`📤 [${geo.flag} +${phone}]: ${reply.slice(0, 80)}`);
  });

  await client.initialize();
}

// ══════════════════════════════════════════════════════════════════
// DÉMARRAGE
// ══════════════════════════════════════════════════════════════════
(async () => {
  console.log('🐟 SamakMarket WhatsApp Agent v3 (whatsapp-web.js)\n');
  await initDB();
  await startAgent();
})();
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './wa-session-wwjs' }),
  puppeteer: {
    headless: true,
    protocolTimeout: 60000,
    executablePath: 'C:\\Users\\pcwin10\\.cache\\puppeteer\\chrome\\win64-146.0.7680.153\\chrome-win64\\chrome.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
    ],
  },
});
/*
══════════════════════════════════════════════════════════
INSTALLATION COMPLÈTE:

1. Désinstalle Baileys:
   npm uninstall @whiskeysockets/baileys

2. Installe whatsapp-web.js:
   npm install whatsapp-web.js qrcode-terminal
   npm install groq-sdk @anthropic-ai/sdk mysql2

3. Sur Windows, installe Puppeteer Chrome:
   npx puppeteer browsers install chrome

4. Lance:
   node whatsapp-agent.js

5. Scanne le QR code

✅ Le numéro réel est toujours disponible dans msg.from
══════════════════════════════════════════════════════════
*/
