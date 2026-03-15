// =============================================================
// backend/services/instagramScheduler.js
// Scheduler Instagram Business API — SamakMarket
// Post promos 08:00 + 18:00 + notification email
//
// INSTALLATION :
//   npm install node-cron axios sharp form-data nodemailer
//
// AJOUT dans server.js :
//   require('./services/instagramScheduler')
//
// .env requis :
//   INSTAGRAM_ACCOUNT_ID=17841234567890
//   INSTAGRAM_TOKEN=EAAxxxxx...
//   MAIL_USER=ton@gmail.com
//   MAIL_PASS=xxxx xxxx xxxx xxxx
//   BACKEND_URL=http://localhost:3000
//   FRONTEND_URL=http://localhost:5173
// =============================================================

const cron       = require('node-cron')
const axios      = require('axios')
const sharp      = require('sharp')
const nodemailer = require('nodemailer')

const IG_API   = 'https://graph.facebook.com/v19.0'
const IG_ID    = () => process.env.INSTAGRAM_ACCOUNT_ID
const IG_TOKEN = () => process.env.INSTAGRAM_TOKEN

// =============================================================
// 1. GÉNÉRER IMAGE PROMO (SVG → PNG via Sharp)
// =============================================================
const genererImagePromo = async (produit, vendeur) => {

  const nom    = produit.name.toUpperCase().substring(0, 28)
  const prix   = `${produit.price} MAD / ${produit.unit}`
  const ville  = (produit.city || vendeur?.city || 'Maroc').substring(0, 20)
  const seller = (vendeur?.name || 'SamakMarket').substring(0, 24)

  const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#020e23"/>
        <stop offset="60%" style="stop-color:#0d2340"/>
        <stop offset="100%" style="stop-color:#020e23"/>
      </linearGradient>
      <linearGradient id="or" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#c9a227"/>
        <stop offset="50%" style="stop-color:#f0d060"/>
        <stop offset="100%" style="stop-color:#c9a227"/>
      </linearGradient>
      <linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e74c3c"/>
        <stop offset="100%" style="stop-color:#c0392b"/>
      </linearGradient>
      <linearGradient id="prix_bg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#1d6991"/>
        <stop offset="100%" style="stop-color:#1a5276"/>
      </linearGradient>
    </defs>

    <!-- Fond -->
    <rect width="1080" height="1080" fill="url(#bg)"/>

    <!-- Motif géométrique décoratif -->
    <circle cx="1080" cy="0"   r="300" fill="rgba(201,162,39,0.04)"/>
    <circle cx="0"    cy="1080" r="300" fill="rgba(29,105,145,0.06)"/>
    <circle cx="540"  cy="540"  r="480" fill="none" stroke="rgba(201,162,39,0.05)" stroke-width="2"/>
    <circle cx="540"  cy="540"  r="420" fill="none" stroke="rgba(201,162,39,0.03)" stroke-width="1"/>

    <!-- Bordure dorée double -->
    <rect x="24" y="24" width="1032" height="1032" rx="32"
      fill="none" stroke="url(#or)" stroke-width="4" opacity="0.7"/>
    <rect x="36" y="36" width="1008" height="1008" rx="24"
      fill="none" stroke="rgba(201,162,39,0.2)" stroke-width="1"/>

    <!-- Zone centrale image/emoji -->
    <rect x="90" y="90" width="900" height="500" rx="24"
      fill="rgba(255,255,255,0.03)" stroke="rgba(201,162,39,0.12)" stroke-width="1"/>

    <!-- Emoji poisson large -->
    <text x="540" y="380" font-size="200" text-anchor="middle" dominant-baseline="middle">🐟</text>

    <!-- Badge PROMO coin haut droit -->
    <rect x="820" y="70" width="220" height="80" rx="40" fill="url(#badge)"/>
    <text x="930" y="122" font-family="Arial Black,Arial" font-size="28"
      font-weight="900" fill="white" text-anchor="middle">🔥 PROMO</text>

    <!-- Badge ville coin haut gauche -->
    <rect x="40" y="70" width="180" height="54" rx="27"
      fill="rgba(29,105,145,0.7)" stroke="rgba(29,105,145,0.4)" stroke-width="1"/>
    <text x="130" y="105" font-family="Arial,sans-serif" font-size="22"
      fill="white" text-anchor="middle">📍 ${ville}</text>

    <!-- Séparateur doré -->
    <line x1="90" y1="618" x2="990" y2="618"
      stroke="url(#or)" stroke-width="2" opacity="0.4"/>

    <!-- Nom produit -->
    <text x="540" y="698" font-family="Arial Black,Arial" font-size="64"
      font-weight="900" fill="url(#or)" text-anchor="middle"
      letter-spacing="3">${nom}</text>

    <!-- Prix encadré -->
    <rect x="290" y="730" width="500" height="90" rx="45" fill="url(#prix_bg)"/>
    <text x="540" y="790" font-family="Arial Black,Arial" font-size="38"
      font-weight="900" fill="white" text-anchor="middle">${prix}</text>

    <!-- Vendeur -->
    <text x="540" y="880" font-family="Arial,sans-serif" font-size="28"
      fill="rgba(255,255,255,0.45)" text-anchor="middle">👨‍🍳 ${seller}</text>

    <!-- Slogan arabe -->
    <text x="540" y="930" font-family="Arial,sans-serif" font-size="26"
      fill="rgba(201,162,39,0.55)" text-anchor="middle">
      السمك الطازج — من البحر لديك مباشرة 🌊
    </text>

    <!-- Footer barre -->
    <rect x="0" y="988" width="1080" height="92" fill="rgba(201,162,39,0.07)"/>
    <line x1="0" y1="988" x2="1080" y2="988"
      stroke="rgba(201,162,39,0.3)" stroke-width="1"/>
    <text x="540" y="1046" font-family="Arial Black,Arial" font-size="30"
      font-weight="900" fill="url(#or)" text-anchor="middle" letter-spacing="4">
      🐟  SAMAKMARKET.MA
    </text>
  </svg>`

  return await sharp(Buffer.from(svg)).png({ quality: 95 }).toBuffer()
}

// =============================================================
// 2. UPLOADER IMAGE SUR SERVEUR TEMPORAIRE (requis par Instagram)
//    Instagram a besoin d'une URL publique pour l'image
//    On sauvegarde dans /uploads/promo_temp/ accessible publiquement
// =============================================================
const sauvegarderImageTemp = async (buffer, nomFichier) => {
  const fs   = require('fs')
  const path = require('path')

  const dir = path.join(__dirname, '../uploads/promo_temp')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const fichier = path.join(dir, nomFichier)
  fs.writeFileSync(fichier, buffer)

  return `${process.env.BACKEND_URL}/uploads/promo_temp/${nomFichier}`
}

// =============================================================
// 3. POSTER SUR INSTAGRAM BUSINESS
//    Étape 1 : Créer un media container avec l'image URL
//    Étape 2 : Publier le container
// =============================================================
const posterSurInstagram = async (produit, vendeur) => {
  const igId    = IG_ID()
  const token   = IG_TOKEN()

  if (!igId || !token) throw new Error('INSTAGRAM_ACCOUNT_ID ou INSTAGRAM_TOKEN manquant dans .env')

  // Génère l'image
  const buffer    = await genererImagePromo(produit, vendeur)
  const nomFichier = `promo_${produit.id}_${Date.now()}.png`
  const imageUrl  = await sauvegarderImageTemp(buffer, nomFichier)

  // Caption du post
  const caption = `🔥 عرض اليوم على SamakMarket!

🐟 ${produit.name}
💰 ${produit.price} MAD / ${produit.unit}
📍 ${produit.city || vendeur?.city || 'Maroc'}
👨‍🍳 ${vendeur?.name || 'SamakMarket'}

السمك الطازج من البحر لديك مباشرة 🌊
🛒 ${process.env.FRONTEND_URL}/products/${produit.id}

#SamakMarket #سمك_طازج #PoissonFrais #Maroc #SamakFrais #BahriMaroc #${(produit.city || 'Maroc').replace(/\s/g, '')} #مأكولات_بحرية`

  // Étape 1 — Créer le container media
  const { data: container } = await axios.post(
    `${IG_API}/${igId}/media`,
    {
      image_url:    imageUrl,
      caption,
      access_token: token,
    }
  )

  if (!container.id) throw new Error('Impossible de créer le container Instagram')

  // Attendre 3 secondes que l'image soit traitée
  await new Promise(r => setTimeout(r, 3000))

  // Étape 2 — Publier le container
  const { data: post } = await axios.post(
    `${IG_API}/${igId}/media_publish`,
    {
      creation_id: container.id,
      access_token: token,
    }
  )

  return { post_id: post.id, image_url: imageUrl, caption }
}

// =============================================================
// 4. EMAIL RAPPORT
// =============================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
})

const envoyerRapport = async ({ heure, resultats }) => {
  const nbSucces = resultats.filter(r => r.succes).length

  const lignes = resultats.map(r => `
    <tr style="border-bottom:1px solid #f3f4f6">
      <td style="padding:10px 14px;font-weight:600;color:#111">${r.nom}</td>
      <td style="padding:10px 14px;color:#374151">${r.prix} MAD</td>
      <td style="padding:10px 14px">
        ${r.succes
          ? `<span style="color:#059669;font-weight:700">✅ Posté</span>`
          : `<span style="color:#dc2626;font-weight:700">❌ ${r.erreur}</span>`
        }
      </td>
    </tr>`).join('')

  await transporter.sendMail({
    from:    `"SamakMarket Instagram Bot" <${process.env.MAIL_USER}>`,
    to:      process.env.MAIL_USER,
    subject: `📸 Instagram ${heure} — ${nbSucces}/${resultats.length} posts réussis`,
    html: `
      <!DOCTYPE html><html lang="fr">
      <body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif">
        <div style="max-width:580px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)">

          <div style="background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);padding:28px;text-align:center">
            <div style="font-size:2rem">📸</div>
            <h1 style="color:white;font-size:1.2rem;font-weight:900;margin:8px 0 4px">SamakMarket Instagram</h1>
            <p style="color:rgba(255,255,255,.7);font-size:.8rem;margin:0">Rapport automatique — ${heure}</p>
          </div>

          <div style="padding:28px">
            <p style="color:#374151;font-size:.9rem;margin:0 0 20px">
              📅 ${new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              — <strong>${nbSucces} produit(s)</strong> posté(s) sur Instagram
            </p>

            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:.75rem;text-transform:uppercase">Produit</th>
                  <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:.75rem;text-transform:uppercase">Prix</th>
                  <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:.75rem;text-transform:uppercase">Statut</th>
                </tr>
              </thead>
              <tbody>${lignes}</tbody>
            </table>

            <div style="margin-top:20px;padding:14px;border-radius:10px;
              background:${nbSucces === resultats.length ? '#f0fdf4' : '#fef3f2'};
              border:1px solid ${nbSucces === resultats.length ? '#bbf7d0' : '#fecaca'}">
              <p style="margin:0;font-size:.85rem;font-weight:700;
                color:${nbSucces === resultats.length ? '#059669' : '#dc2626'}">
                ${nbSucces === resultats.length
                  ? '✅ Tous les posts publiés avec succès !'
                  : `⚠️ ${resultats.length - nbSucces} échec(s) — vérifiez le token Instagram`
                }
              </p>
            </div>

            <p style="margin:16px 0 0;font-size:.72rem;color:#9ca3af">
              ⏰ Prochain post : ${heure === '08:00' ? '18:00 ce soir' : '08:00 demain matin'}
            </p>
          </div>
        </div>
      </body></html>
    `,
  })
}

// =============================================================
// 5. TÂCHE PRINCIPALE
// =============================================================
const lancerPostPromos = async (heure = 'Manuel') => {
  console.log(`\n📸 [Instagram Scheduler] Lancement — ${heure}`)

  try {
    const { Product, User } = require('../models')

    const produits = await Product.findAll({
      where:   { is_promo: true, is_available: true },
      include: [{ model: User, as: 'seller', attributes: ['name', 'city'] }],
      order:   [['created_at', 'DESC']],
      limit:   4, // Instagram limite les posts rapprochés
    })

    if (produits.length === 0) {
      console.log('ℹ️ Aucun produit en promo')
      return
    }

    console.log(`📦 ${produits.length} promo(s) à poster`)

    const resultats = []

    for (const produit of produits) {
      // Délai 5s entre chaque post (limite Instagram)
      await new Promise(r => setTimeout(r, 5000))
      try {
        const result = await posterSurInstagram(produit, produit.seller)
        console.log(`✅ Posté: ${produit.name} — ${result.post_id}`)
        resultats.push({ nom: produit.name, prix: produit.price, succes: true })
      } catch (err) {
        console.error(`❌ Échec "${produit.name}":`, err.response?.data?.error?.message || err.message)
        resultats.push({ nom: produit.name, prix: produit.price, succes: false, erreur: err.response?.data?.error?.message || err.message })
      }
    }

    // Email rapport
    await envoyerRapport({ heure, resultats })
    console.log(`📧 Rapport envoyé à ${process.env.MAIL_USER}`)

  } catch (err) {
    console.error('❌ Erreur scheduler Instagram:', err.message)
  }
}

// =============================================================
// 6. CRON — 08:00 et 18:00 Maroc
// =============================================================
cron.schedule('0 8 * * *',  () => lancerPostPromos('08:00'), { timezone: 'Africa/Casablanca' })
cron.schedule('0 18 * * *', () => lancerPostPromos('18:00'), { timezone: 'Africa/Casablanca' })

console.log('⏰ Instagram Scheduler démarré — 08:00 et 18:00 (Casablanca)')

module.exports = { lancerPostPromos, posterSurInstagram, genererImagePromo }
