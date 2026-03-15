// =============================================================
// backend/routes/facebook.js
// Intégration Facebook Graph API — SamakMarket
//
// Routes :
//   POST /api/facebook/post        → Poster manuellement sur la page FB
//   POST /api/facebook/post-produit/:id → Poster un produit spécifique
//   GET  /api/facebook/status      → Vérifier que le token FB est valide
// =============================================================

const express = require('express')
const router  = express.Router()
const axios   = require('axios')
//const auth    = require('../middleware/auth')
// const isAdmin = require('../middleware/isAdmin')
const { Product, User } = require('../models')
const { auth, isAdmin } = require('../middleware/auth')
const FB_API = 'https://graph.facebook.com/v19.0'

// =============================================================
// Fonction utilitaire — poster sur la page Facebook
// =============================================================
const posterSurFacebook = async ({ message, link, image_url }) => {
  const PAGE_ID    = process.env.FB_PAGE_ID
  const PAGE_TOKEN = process.env.FB_PAGE_TOKEN

  if (!PAGE_ID || !PAGE_TOKEN) {
    throw new Error('FB_PAGE_ID ou FB_PAGE_TOKEN manquant dans .env')
  }

  // Si image → utilise /photos endpoint
  if (image_url) {
    const { data } = await axios.post(
      `${FB_API}/${PAGE_ID}/photos`,
      {
        url:          image_url,
        caption:      message,
        access_token: PAGE_TOKEN,
      }
    )
    return data
  }

  // Sinon → post texte + lien
  const { data } = await axios.post(
    `${FB_API}/${PAGE_ID}/feed`,
    {
      message,
      link:         link || undefined,
      access_token: PAGE_TOKEN,
    }
  )
  return data
}

// =============================================================
// Formater le message d'un produit en Darija + Français
// =============================================================
const formaterMessageProduit = (produit, vendeur) => {
  const emoji = {
    'Poisson':    '🐟',
    'Crustacés':  '🦐',
    'Mollusques': '🦑',
    'Fruits de mer': '🦞',
    'Séché':      '🐠',
    'Conserve':   '🥫',
  }
  const ico = emoji[produit.category] || '🐟'

  return `${ico} ${produit.name} — ${produit.price} MAD/${produit.unit}

🛒 منتج جديد على SamakMarket!
📍 ${produit.city || vendeur?.city || 'Maroc'}
💰 السعر: ${produit.price} درهم / ${produit.unit}
${produit.is_promo ? '🔥 عرض خاص — Promotion spéciale!\n' : ''}
👨‍🍳 البائع: ${vendeur?.name || 'Vendeur SamakMarket'}

🌊 السمك الطازج — من البحر لديك مباشرة
👉 samakmarket.ma

#SamakMarket #سمك #MarocFresh #PoissonFrais #${(produit.city || 'Maroc').replace(/\s/g, '')}`
}

// =============================================================
// GET /api/facebook/status
// Vérifie que le token FB est valide
// =============================================================
router.get('/status', auth, isAdmin, async (req, res) => {
  try {
    const { data } = await axios.get(`${FB_API}/me`, {
      params: {
        access_token: process.env.FB_PAGE_TOKEN,
        fields: 'id,name,fan_count',
      }
    })
    res.json({
      ok:        true,
      page_name: data.name,
      page_id:   data.id,
      fans:      data.fan_count || 0,
    })
  } catch (err) {
    res.status(400).json({
      ok:      false,
      message: 'Token Facebook invalide ou expiré',
      detail:  err.response?.data?.error?.message || err.message,
    })
  }
})

// =============================================================
// POST /api/facebook/post
// Poster un message custom sur la page (admin seulement)
// Body: { message, link?, image_url? }
// =============================================================
router.post('/post', auth, isAdmin, async (req, res) => {
  const { message, link, image_url } = req.body
  if (!message) return res.status(400).json({ message: 'message requis' })

  try {
    const result = await posterSurFacebook({ message, link, image_url })
    res.json({ ok: true, post_id: result.id, message: 'Posté sur Facebook ✅' })
  } catch (err) {
    console.error('❌ Facebook post error:', err.response?.data || err.message)
    res.status(500).json({
      ok:      false,
      message: err.response?.data?.error?.message || err.message,
    })
  }
})

// =============================================================
// POST /api/facebook/post-produit/:id
// Poster un produit spécifique sur Facebook (admin ou vendeur propriétaire)
// =============================================================
router.post('/post-produit/:id', auth, async (req, res) => {
  try {
    const produit = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['name', 'city'] }]
    })

    if (!produit) return res.status(404).json({ message: 'Produit introuvable' })

    // Seul l'admin ou le vendeur propriétaire peut poster
    const user = req.user
    if (user.role !== 'admin' && user.id !== produit.seller_id) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    const message    = formaterMessageProduit(produit, produit.seller)
    const images     = JSON.parse(produit.images || '[]')
    const image_url  = images[0] || null
    const link       = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${produit.id}`

    const result = await posterSurFacebook({
      message,
      link: image_url ? undefined : link, // pas de lien si image
      image_url: image_url
        ? `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${image_url}`
        : null,
    })

    res.json({
      ok:      true,
      post_id: result.id,
      message: `Produit "${produit.name}" posté sur Facebook ✅`,
    })
  } catch (err) {
    console.error('❌ Facebook post-produit error:', err.response?.data || err.message)
    res.status(500).json({
      ok:      false,
      message: err.response?.data?.error?.message || err.message,
    })
  }
})
// =============================================================
// À AJOUTER dans backend/routes/facebook.js (ou créer instagram.js)
// Routes Instagram — ajoute après les routes Facebook existantes
// =============================================================

// GET /api/instagram/status — vérifie le token Instagram
router.get('/instagram/status', auth, isAdmin, async (req, res) => {
  try {
    const { data } = await axios.get(`${FB_API}/${process.env.INSTAGRAM_ACCOUNT_ID}`, {
      params: {
        fields:       'id,name,username,followers_count,media_count',
        access_token: process.env.INSTAGRAM_TOKEN,
      }
    })
    res.json({ ok: true, ...data })
  } catch (err) {
    res.status(400).json({ ok: false, message: err.response?.data?.error?.message || err.message })
  }
})

// POST /api/instagram/post-produit/:id — poster un produit manuellement
router.post('/instagram/post-produit/:id', auth, async (req, res) => {
  try {
    const { Product, User } = require('../models')
    const produit = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['name', 'city'] }]
    })
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' })

    const user = req.user
    if (user.role !== 'admin' && user.id !== produit.seller_id) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    const { posterSurInstagram } = require('../services/instagramScheduler')
    const result = await posterSurInstagram(produit, produit.seller)
    res.json({ ok: true, post_id: result.post_id, message: `"${produit.name}" posté sur Instagram ✅` })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.response?.data?.error?.message || err.message })
  }
})

// POST /api/instagram/post-toutes-promos — déclencher manuellement
router.post('/instagram/post-toutes-promos', auth, isAdmin, async (req, res) => {
  try {
    const { lancerPostPromos } = require('../services/instagramScheduler')
    lancerPostPromos('Manuel').catch(console.error)
    res.json({ message: 'Post Instagram lancé ! Rapport email dans quelques minutes.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// =============================================================
// POST /api/facebook/post-toutes-promos
// Déclenche manuellement le scheduler (admin seulement)
// =============================================================
router.post('/post-toutes-promos', auth, isAdmin, async (req, res) => {
  try {
    const { lancerPostPromos } = require('../services/fbScheduler')
    // Lance en arrière-plan sans bloquer la réponse
    lancerPostPromos('Manuel').catch(console.error)
    res.json({ message: 'Post des promos lancé ! Un email de rapport vous sera envoyé.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
module.exports.posterSurFacebook  = posterSurFacebook
module.exports.formaterMessageProduit = formaterMessageProduit


