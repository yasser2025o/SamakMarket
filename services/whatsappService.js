// =============================================================
// backend/services/whatsappService.js
// Service WhatsApp via Baileys — SamakMarket
//
// USAGE dans server.js :
//   const whatsapp = require('./services/whatsappService')
//   whatsapp.init()
//
// ENDPOINTS disponibles après init :
//   GET  /api/whatsapp/status   → statut connexion + QR code
//   POST /api/whatsapp/send     → envoyer message/image
// =============================================================
// Si tu utilises baileys (fork)
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('baileys')
//const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
//const qrcode = require('qrcode-terminal')
const sharp  = require('sharp')
const path   = require('path')
const fs     = require('fs')
const P      = require('pino')

// ── État global ──────────────────────────────────────────────
let sock         = null
let qrCodeData   = null
let estConnecte  = false
let nomConnecte  = ''

const AUTH_DIR = path.join(__dirname, '../whatsapp_auth')

// =============================================================
// GÉNÉRER IMAGE PROMO (SVG → PNG)
// =============================================================
const genererImagePromo = async (produit, vendeur) => {
  const nom   = produit.name.toUpperCase().substring(0, 28)
  const prix  = `${produit.price} MAD / ${produit.unit}`
  const ville = (produit.city || vendeur?.city || 'Maroc').substring(0, 20)
  const seller = (vendeur?.name || 'SamakMarket').substring(0, 24)

  const svg = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#020e23"/>
        <stop offset="100%" style="stop-color:#0d2340"/>
      </linearGradient>
      <linearGradient id="or" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#c9a227"/>
        <stop offset="50%" style="stop-color:#f0d060"/>
        <stop offset="100%" style="stop-color:#c9a227"/>
      </linearGradient>
    </defs>

    <!-- Fond -->
    <rect width="800" height="800" fill="url(#bg)"/>
    <circle cx="800" cy="0"   r="250" fill="rgba(201,162,39,0.05)"/>
    <circle cx="0"   cy="800" r="250" fill="rgba(29,105,145,0.07)"/>

    <!-- Bordure dorée -->
    <rect x="16" y="16" width="768" height="768" rx="24"
      fill="none" stroke="url(#or)" stroke-width="3" opacity="0.7"/>

    <!-- Zone centrale -->
    <rect x="60" y="60" width="680" height="380" rx="20"
      fill="rgba(255,255,255,0.03)" stroke="rgba(201,162,39,0.1)" stroke-width="1"/>

    <!-- Emoji -->
    <text x="400" y="275" font-size="160" text-anchor="middle" dominant-baseline="middle">🐟</text>

    <!-- Badge PROMO -->
    <rect x="590" y="48" width="180" height="60" rx="30" fill="#e74c3c"/>
    <text x="680" y="86" font-family="Arial Black,Arial" font-size="24"
      font-weight="900" fill="white" text-anchor="middle">🔥 PROMO</text>

    <!-- Séparateur -->
    <line x1="60" y1="465" x2="740" y2="465" stroke="url(#or)" stroke-width="1.5" opacity="0.4"/>

    <!-- Nom produit -->
    <text x="400" y="530" font-family="Arial Black,Arial" font-size="52"
      font-weight="900" fill="url(#or)" text-anchor="middle">${nom}</text>

    <!-- Prix -->
    <rect x="220" y="558" width="360" height="72" rx="36" fill="#1d6991"/>
    <text x="400" y="603" font-family="Arial Black,Arial" font-size="30"
      font-weight="900" fill="white" text-anchor="middle">${prix}</text>

    <!-- Ville + vendeur -->
    <text x="400" y="668" font-family="Arial,sans-serif" font-size="22"
      fill="rgba(255,255,255,0.4)" text-anchor="middle">📍 ${ville} · ${seller}</text>

    <!-- Slogan -->
    <text x="400" y="710" font-family="Arial,sans-serif" font-size="19"
      fill="rgba(201,162,39,0.5)" text-anchor="middle">السمك الطازج من البحر لديك مباشرة</text>

    <!-- Footer -->
    <rect x="0" y="744" width="800" height="56" fill="rgba(201,162,39,0.07)"/>
    <line x1="0" y1="744" x2="800" y2="744" stroke="rgba(201,162,39,0.25)" stroke-width="1"/>
    <text x="400" y="778" font-family="Arial Black,Arial" font-size="22"
      font-weight="900" fill="url(#or)" text-anchor="middle" letter-spacing="3">
      🐟 SAMAKMARKET.MA
    </text>
  </svg>`

  return await sharp(Buffer.from(svg)).png({ quality: 95 }).toBuffer()
}

// =============================================================
// FORMATTER MESSAGE DARIJA
// =============================================================
const formaterMessage = (produit, vendeur) => {
  return `🔥 *عرض اليوم على SamakMarket!*

🐟 *${produit.name}*
💰 *${produit.price} MAD / ${produit.unit}*
📍 ${produit.city || vendeur?.city || 'Maroc'}
👨‍🍳 ${vendeur?.name || 'SamakMarket'}

_السمك الطازج من البحر لديك مباشرة_ 🌊

👉 ${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${produit.id}

#SamakMarket #سمك_طازج #PoissonFrais`
}

// =============================================================
// INITIALISER BAILEYS
// =============================================================
const init = async () => {
  console.log('📱 Initialisation WhatsApp Baileys...')

  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true })

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)

  sock = makeWASocket({
    auth:   state,
    logger: P({ level: 'silent' }), // silence les logs verbose
   // printQRInTerminal: true,
  })

  // Sauvegarde credentials
  sock.ev.on('creds.update', saveCreds)

  // Gestion connexion
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrCodeData  = qr
      estConnecte = false
      console.log('📱 QR Code généré — scanne avec WhatsApp')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      estConnecte = true
      qrCodeData  = null
      nomConnecte = sock.user?.name || sock.user?.id || ''
      console.log(`✅ WhatsApp connecté : ${nomConnecte}`)
    }

   if (connection === 'close') {
  estConnecte = false
  const code  = lastDisconnect?.error?.output?.statusCode
  const msg   = lastDisconnect?.error?.message
  console.log('❌ Déconnecté — code:', code, '— msg:', msg)  // ← ajoute ça
  const reconnect = code !== DisconnectReason.loggedOut
  if (reconnect) setTimeout(init, 8000)
}
  })
}

// =============================================================
// ENVOYER MESSAGE TEXTE
// =============================================================
const envoyerMessage = async (numero, texte) => {
  if (!estConnecte || !sock) throw new Error('WhatsApp non connecté')
  const jid = numero.replace(/[\s\+\-\(\)]/g, '') + '@s.whatsapp.net'
  await sock.sendMessage(jid, { text: texte })
  console.log(`✅ Message envoyé à ${numero}`)
}

// =============================================================
// ENVOYER IMAGE + CAPTION
// =============================================================
const envoyerImage = async (numero, imageBuffer, caption) => {
  if (!estConnecte || !sock) throw new Error('WhatsApp non connecté')
  const jid = numero.replace(/[\s\+\-\(\)]/g, '') + '@s.whatsapp.net'
  await sock.sendMessage(jid, {
    image:   imageBuffer,
    caption,
    mimetype: 'image/png',
  })
  console.log(`✅ Image envoyée à ${numero}`)
}

// =============================================================
// ENVOYER PROMO D'UN PRODUIT
// =============================================================
const envoyerPromo = async (produit, vendeur, numeros = []) => {
  if (!estConnecte) throw new Error('WhatsApp non connecté')

  const imageBuffer = await genererImagePromo(produit, vendeur)
  const caption     = formaterMessage(produit, vendeur)

  // Envoie à tous les numéros fournis
  const destinataires = numeros.length > 0
    ? numeros
    : [process.env.WHATSAPP_ADMIN || ''] // numéro admin par défaut

  const resultats = []
  for (const num of destinataires) {
    if (!num) continue
    try {
      await envoyerImage(num, imageBuffer, caption)
      resultats.push({ numero: num, succes: true })
      await new Promise(r => setTimeout(r, 1500)) // délai entre envois
    } catch (err) {
      console.error(`❌ Échec envoi ${num}:`, err.message)
      resultats.push({ numero: num, succes: false, erreur: err.message })
    }
  }
  return resultats
}

// =============================================================
// GETTERS ÉTAT
// =============================================================
const getStatut = () => ({
  connecte:  estConnecte,
  nom:       nomConnecte,
  qr:        qrCodeData,
})

module.exports = { init, envoyerMessage, envoyerImage, envoyerPromo, genererImagePromo, getStatut }
