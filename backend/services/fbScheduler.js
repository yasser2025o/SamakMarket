// =============================================================
// backend/services/fbScheduler.js
// Scheduler Facebook — Post promos 2x/jour + notification email
//
// INSTALLATION :
//   npm install node-cron axios nodemailer
//
// AJOUT dans server.js (après les routes) :
//   require('./services/fbScheduler')
// =============================================================

const cron       = require('node-cron')
const axios      = require('axios')
const nodemailer = require('nodemailer')
const path       = require('path')
const fs         = require('fs')

const FB_API = 'https://graph.facebook.com/v19.0'

// =============================================================
// 1. TRANSPORTER EMAIL
// =============================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

// =============================================================
// 2. GÉNÉRER L'IMAGE PROMO EN SVG → BUFFER PNG via Sharp
//    (Canvas natif nécessite compilation C++ — on utilise SVG+Sharp)
// =============================================================
const genererImagePromo = async (produit, vendeur) => {
  const sharp = require('sharp')

  // Couleurs thème SamakMarket
  const BG_DARK  = '#020e23'
  const OR       = '#d4af37'
  const OR_LIGHT = '#f5d57a'
  const BLEU     = '#1d6991'
  const BLANC    = '#ffffff'

  // Textes
  const nomProduit = produit.name.toUpperCase()
  const prix       = `${produit.price} MAD / ${produit.unit}`
  const ville      = produit.city || vendeur?.city || 'Maroc'
  const vendeurNom = vendeur?.name || 'SamakMarket'

  // SVG 800x800 — design promo
  const svg = `
  <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${BG_DARK}"/>
        <stop offset="100%" style="stop-color:#0d1f3c"/>
      </linearGradient>
      <linearGradient id="or" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${OR}"/>
        <stop offset="100%" style="stop-color:${OR_LIGHT}"/>
      </linearGradient>
      <linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e74c3c"/>
        <stop offset="100%" style="stop-color:#c0392b"/>
      </linearGradient>
    </defs>

    <!-- Fond -->
    <rect width="800" height="800" fill="url(#bg)"/>

    <!-- Bordure dorée -->
    <rect x="12" y="12" width="776" height="776" rx="20"
      fill="none" stroke="${OR}" stroke-width="3" opacity="0.6"/>
    <rect x="20" y="20" width="760" height="760" rx="16"
      fill="none" stroke="${OR}" stroke-width="1" opacity="0.2"/>

    <!-- Zone image produit (fond placeholder) -->
    <rect x="50" y="80" width="700" height="380" rx="16"
      fill="rgba(255,255,255,0.04)" stroke="rgba(212,175,55,0.15)" stroke-width="1"/>

    <!-- Emoji poisson centré (placeholder si pas d'image) -->
    <text x="400" y="290" font-size="120" text-anchor="middle" dominant-baseline="middle">🐟</text>

    <!-- Badge PROMO -->
    <rect x="580" y="60" width="180" height="60" rx="30" fill="url(#badge)"/>
    <text x="670" y="100" font-family="Arial Black, Arial" font-size="22"
      font-weight="900" fill="white" text-anchor="middle">🔥 PROMO</text>

    <!-- Séparateur doré -->
    <line x1="50" y1="490" x2="750" y2="490" stroke="${OR}" stroke-width="1" opacity="0.3"/>

    <!-- Nom produit -->
    <text x="400" y="555" font-family="Arial Black, Arial" font-size="42"
      font-weight="900" fill="url(#or)" text-anchor="middle"
      letter-spacing="2">${nomProduit}</text>

    <!-- Prix -->
    <rect x="250" y="580" width="300" height="64" rx="32" fill="${BLEU}" opacity="0.8"/>
    <text x="400" y="622" font-family="Arial Black, Arial" font-size="28"
      font-weight="900" fill="white" text-anchor="middle">${prix}</text>

    <!-- Ville + vendeur -->
    <text x="400" y="688" font-family="Arial, sans-serif" font-size="20"
      fill="rgba(255,255,255,0.5)" text-anchor="middle">📍 ${ville} · ${vendeurNom}</text>

    <!-- Slogan arabe -->
    <text x="400" y="728" font-family="Arial, sans-serif" font-size="18"
      fill="rgba(212,175,55,0.6)" text-anchor="middle">السمك الطازج من البحر لديك مباشرة</text>

    <!-- Footer -->
    <rect x="0" y="756" width="800" height="44" fill="rgba(212,175,55,0.08)"/>
    <text x="400" y="784" font-family="Arial Black, Arial" font-size="20"
      font-weight="900" fill="${OR}" text-anchor="middle" letter-spacing="3">
      🐟 SAMAKMARKET.MA
    </text>
  </svg>`

  // Convertir SVG → PNG buffer via Sharp
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
  return buffer
}

// =============================================================
// 3. UPLOADER L'IMAGE SUR FB ET POSTER
// =============================================================
const posterPromoFacebook = async (produit, vendeur) => {
  const PAGE_ID    = process.env.FB_PAGE_ID
  const PAGE_TOKEN = process.env.FB_PAGE_TOKEN

  if (!PAGE_ID || !PAGE_TOKEN) throw new Error('FB credentials manquants')

  // Générer l'image
  const imageBuffer = await genererImagePromo(produit, vendeur)

  // Message du post
  const message = `🔥 عرض اليوم على SamakMarket!

🐟 ${produit.name}
💰 ${produit.price} MAD / ${produit.unit}
📍 ${produit.city || vendeur?.city || 'Maroc'}
👨‍🍳 ${vendeur?.name || 'SamakMarket'}

السمك الطازج من البحر لديك مباشرة 🌊
👉 ${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${produit.id}

#SamakMarket #سمك_طازج #PoissonFrais #Maroc #${(produit.city || 'Maroc').replace(/\s/g,'')}`

  // Upload image comme FormData
  const FormData = require('form-data')
  const form = new FormData()
  form.append('source',       imageBuffer, { filename: 'promo.png', contentType: 'image/png' })
  form.append('caption',      message)
  form.append('access_token', PAGE_TOKEN)

  const { data } = await axios.post(
    `${FB_API}/${PAGE_ID}/photos`,
    form,
    { headers: form.getHeaders() }
  )

  return { post_id: data.id, message }
}

// =============================================================
// 4. ENVOYER EMAIL DE NOTIFICATION
// =============================================================
const envoyerNotifEmail = async ({ produits, heure, resultats }) => {
  const lignes = resultats.map(r => `
    <tr>
      <td style="padding:8px 12px;color:#111;font-weight:600">${r.nom}</td>
      <td style="padding:8px 12px;color:#374151">${r.prix} MAD</td>
      <td style="padding:8px 12px">
        ${r.succes
          ? `<span style="color:#059669;font-weight:700">✅ Posté</span>`
          : `<span style="color:#dc2626;font-weight:700">❌ ${r.erreur}</span>`
        }
      </td>
    </tr>`).join('')

  const nbSucces = resultats.filter(r => r.succes).length

  await transporter.sendMail({
    from:    `"SamakMarket Bot" <${process.env.MAIL_USER}>`,
    to:      process.env.MAIL_USER,
    subject: `📊 Rapport Facebook ${heure} — ${nbSucces}/${resultats.length} posts réussis`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif">
        <div style="max-width:600px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#020e23,#1e3a5f);padding:28px;text-align:center">
            <div style="font-size:2rem">🐟</div>
            <h1 style="color:white;font-size:1.2rem;font-weight:900;margin:8px 0 4px">SamakMarket</h1>
            <p style="color:rgba(255,255,255,.4);font-size:.8rem;margin:0">Rapport automatique Facebook</p>
          </div>

          <!-- Body -->
          <div style="padding:28px">
            <h2 style="color:#1e3a5f;font-size:1rem;margin:0 0 6px">
              📅 Post du ${new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })} — ${heure}
            </h2>
            <p style="color:#6b7280;font-size:.85rem;margin:0 0 20px">
              ${nbSucces} produit(s) posté(s) sur la page Facebook SamakMarket
            </p>

            <!-- Tableau résultats -->
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:.78rem;text-transform:uppercase">Produit</th>
                  <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:.78rem;text-transform:uppercase">Prix</th>
                  <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:.78rem;text-transform:uppercase">Statut</th>
                </tr>
              </thead>
              <tbody>${lignes}</tbody>
            </table>

            <!-- Résumé -->
            <div style="margin-top:20px;padding:14px;background:${nbSucces === resultats.length ? '#f0fdf4' : '#fef3f2'};border-radius:10px;border:1px solid ${nbSucces === resultats.length ? '#bbf7d0' : '#fecaca'}">
              <p style="margin:0;font-size:.85rem;font-weight:700;color:${nbSucces === resultats.length ? '#059669' : '#dc2626'}">
                ${nbSucces === resultats.length
                  ? `✅ Tous les posts ont été publiés avec succès !`
                  : `⚠️ ${resultats.length - nbSucces} post(s) ont échoué. Vérifiez le token Facebook.`
                }
              </p>
            </div>

            <p style="margin:20px 0 0;font-size:.75rem;color:#9ca3af">
              Prochain post automatique : ${heure === '08:00' ? '18:00' : '08:00 demain'}
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  })
}

// =============================================================
// 5. TÂCHE PRINCIPALE — récupère promos et poste
// =============================================================
const lancerPostPromos = async (heure) => {
  console.log(`\n🤖 [Facebook Scheduler] Lancement post promos — ${heure}`)

  try {
    // Charge les models ici pour éviter circular dependency
    const { Product, User } = require('../models')

    // Récupère tous les produits en promo actifs
    const produits = await Product.findAll({
      where: { is_promo: true, is_available: true },
      include: [{ model: User, as: 'seller', attributes: ['name', 'city'] }],
      order: [['created_at', 'DESC']],
      limit: 5, // Max 5 posts par session
    })

    if (produits.length === 0) {
      console.log('ℹ️ Aucun produit en promo à poster')
      return
    }

    console.log(`📦 ${produits.length} produit(s) en promo trouvé(s)`)

    // Poste chaque produit avec délai de 30s entre chaque
    const resultats = []

    for (const produit of produits) {
      try {
        await new Promise(r => setTimeout(r, 2000)) // délai 2s entre posts
        const result = await posterPromoFacebook(produit, produit.seller)
        console.log(`✅ Posté: ${produit.name} — ID: ${result.post_id}`)
        resultats.push({
          nom: produit.name, prix: produit.price,
          succes: true, post_id: result.post_id,
        })
      } catch (err) {
        console.error(`❌ Échec post "${produit.name}":`, err.message)
        resultats.push({
          nom: produit.name, prix: produit.price,
          succes: false, erreur: err.message,
        })
      }
    }

    // Envoie email de rapport
    await envoyerNotifEmail({ produits, heure, resultats })
    console.log(`📧 Rapport email envoyé à ${process.env.MAIL_USER}`)

  } catch (err) {
    console.error('❌ Erreur scheduler Facebook:', err.message)
  }
}

// =============================================================
// 6. PLANIFICATION CRON
//    "0 8 * * *"  = tous les jours à 08:00
//    "0 18 * * *" = tous les jours à 18:00
//    Timezone : Africa/Casablanca (Maroc)
// =============================================================
const TIMEZONE = 'Africa/Casablanca'

// 08:00 matin
cron.schedule('0 8 * * *', () => {
  lancerPostPromos('08:00')
}, { timezone: TIMEZONE })

// 18:00 soir
cron.schedule('0 18 * * *', () => {
  lancerPostPromos('18:00')
}, { timezone: TIMEZONE })

console.log('⏰ Facebook Scheduler démarré — Posts à 08:00 et 18:00 (Casablanca)')

// =============================================================
// 7. EXPORT pour appel manuel depuis l'admin
// =============================================================
module.exports = { lancerPostPromos, posterPromoFacebook, genererImagePromo }
