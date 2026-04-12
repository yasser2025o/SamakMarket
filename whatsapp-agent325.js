'use strict';
require('dotenv').config();

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    jidNormalizedUser 
} = require('@whiskeysockets/baileys');

const Groq = require('groq-sdk');
const qrcode = require('qrcode-terminal');
const mysql = require('mysql2/promise');
const P = require('pino');
const fs = require('fs');

// ── Configuration ────────────────────────────────────────────────
const CONFIG = {
    GROQ_KEY: process.env.GROQ_API_KEY,
    DB: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'samakmarket'
    },
    SESSION_DIR: './wa-session',
    MODEL: "llama-3.3-70b-versatile" // Le meilleur pour le Darija
};

// ── Initialisation ───────────────────────────────────────────────
const groq = new Groq({ apiKey: CONFIG.GROQ_KEY });
const conversations = new Map();
let db;

// ── 1. Connexion Base de Données ────────────────────────────────
async function initDB() {
    try {
        db = await mysql.createPool(CONFIG.DB);
        console.log('📡 [DB] Connectée avec succès.');
        await db.query(`
            CREATE TABLE IF NOT EXISTS whatsapp_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(30),
                produit VARCHAR(100),
                quantite DECIMAL(8,2),
                prix_unitaire DECIMAL(10,2),
                total DECIMAL(10,2),
                livraison VARCHAR(200),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('📦 [DB] Table whatsapp_orders vérifiée.');
    } catch (e) {
        console.error('❌ [DB] Erreur:', e.message);
        process.exit(1);
    }
}

// ── 2. Logique IA (Groq) ────────────────────────────────────────
async function getAgentReply(phone, userMsg) {
    try {
        // Récupération du stock pour le prompt
        const [rows] = await db.query(`SELECT category, price FROM products WHERE is_available = 1 LIMIT 10`);
        const stock = rows.length > 0 ? rows.map(p => `${p.category}:${p.price}dh`).join(', ') : "Sardine:20dh, Crevette:80dh";

        if (!conversations.has(phone)) conversations.set(phone, []);
        const history = conversations.get(phone);
        history.push({ role: 'user', content: userMsg });

        const sysPrompt = `
        Tu es l'agent WhatsApp de SamakMarket (Poissons frais Maroc).
        Stock: ${stock}. 
        Règles: Réponds en DARIJA uniquement. Max 2 phrases. Sois poli et direct.
        Process: Demande 1.Produit 2.Quantité 3.Ville.
        Si la commande est complète, réponds EXACTEMENT: COMMANDE_VALIDEE:{"produit":"","quantite":0,"prix_unitaire":0,"total":0,"livraison":""}
        `.trim();

        console.log(`🧠 [GROQ] Génération réponse pour ${phone}...`);
        
        const completion = await groq.chat.completions.create({
            model: CONFIG.MODEL,
            messages: [{ role: "system", content: sysPrompt }, ...history.slice(-6)],
            temperature: 0.5,
            max_tokens: 150
        });

        let reply = completion.choices[0].message.content;

        // Si l'IA valide la commande
        if (reply.includes("COMMANDE_VALIDEE:")) {
            try {
                const data = JSON.parse(reply.split("COMMANDE_VALIDEE:")[1]);
                await db.query(
                    `INSERT INTO whatsapp_orders (phone, produit, quantite, prix_unitaire, total, livraison) VALUES (?,?,?,?,?,?)`, 
                    [phone, data.produit, data.quantite, data.prix_unitaire, data.total, data.livraison]
                );
                console.log(`✅ [ORDER] Nouvelle commande de ${phone}: ${data.produit}`);
                conversations.delete(phone);
                return "Nadi! ✅ Commande dyalk t'enregistrat f SamakMarket. Ghadi ntaslo bik f had l-noomro bach n-confirmew livraison. Chokran! 🐟";
            } catch (err) {
                console.error("❌ [PARSE ERROR] JSON invalide de l'IA");
            }
        }

        history.push({ role: 'assistant', content: reply });
        return reply;

    } catch (e) {
        console.error('❌ [GROQ ERROR]:', e.message);
        return "Smah lia bezzaf, kayn mochkil f l-système. 3awd sayfet lia mn b3d. 🙏";
    }
}

// ── 3. Agent WhatsApp (Baileys) ──────────────────────────────────
async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(CONFIG.SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    console.log(`🔄 [WA] Initialisation (v${version.join('.')})...`);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }), // On cache les logs internes pour voir NOS logs
        syncFullHistory: false,          // ⚡ ÉVITE LE BUFFER TIMEOUT
        shouldSyncHistoryMessage: () => false,
        browser: ["SamakMarket", "Chrome", "1.0.0"]
    });

    // Gestion de la connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 [WA] SCANNE LE QR CODE CI-DESSOUS :');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(`⚠️ [WA] Connexion fermée (Raison: ${reason})`);
            if (reason !== DisconnectReason.loggedOut) {
                console.log('🔄 [WA] Reconnexion automatique...');
                startWhatsApp();
            } else {
                console.error('❌ [WA] Session déconnectée. Supprime le dossier wa-session et relance.');
            }
        }

        if (connection === 'open') {
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🚀 SAMAKMARKET ONLINE ✅');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Réception des messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const m = messages[0];
        if (m.key.fromMe || !m.message) return;

        const phone = jidNormalizedUser(m.key.remoteJid);
        const text = m.message.conversation || m.message.extendedTextMessage?.text;

        if (!text) return;

        console.log(`📩 [MSG] ${phone}: "${text}"`);

        // Marquer comme lu
        await sock.readMessages([m.key]);
        
        // Simuler l'écriture
        await sock.sendPresenceUpdate('composing', m.key.remoteJid);
        
        // Obtenir la réponse de Groq
        const reply = await getAgentReply(phone, text);
        
        // Envoyer la réponse
        await sock.sendMessage(m.key.remoteJid, { text: reply });
        console.log(`📤 [REP] Vers ${phone}: "${reply.substring(0, 50)}..."`);
    });
}

// ── Lancement ────────────────────────────────────────────────────
console.log('🐟 SamakMarket Agent — Démarrage du moteur...');
initDB().then(() => {
    startWhatsApp();
});