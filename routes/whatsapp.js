// =============================================================
// À AJOUTER dans backend/routes/ — créer whatsapp.js
// =============================================================

const express    = require('express')
const router     = express.Router()
const whatsapp   = require('../services/whatsappService')
const { auth, isAdmin } = require('../middleware/auth')
const { Product, User } = require('../models')
const QRCode     = require('qrcode')

// GET /api/whatsapp/status
router.get('/status', async (req, res) => {
  const statut = whatsapp.getStatut()
  
  // Convertit le QR en image base64 si disponible
  let qrImage = null
  if (statut.qr) {
    try {
      qrImage = await QRCode.toDataURL(statut.qr)
    } catch {}
  }

  res.json({ ...statut, qrImage })
})

// POST /api/whatsapp/send-promo/:id
// Envoie la promo d'un produit sur WhatsApp
router.post('/send-promo/:id', auth, async (req, res) => {
  try {
    const { numeros } = req.body // tableau de numéros ex: ['212612345678']

    const produit = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['name', 'city', 'whatsapp', 'phone'] }]
    })
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' })

    const user = req.user
    if (user.role !== 'admin' && user.id !== produit.seller_id) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    const resultats = await whatsapp.envoyerPromo(produit, produit.seller, numeros)
    res.json({ ok: true, resultats, message: `Promo envoyée sur WhatsApp ✅` })

  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
})

// POST /api/whatsapp/send-toutes-promos
// Envoie toutes les promos actives (admin)
router.post('/send-toutes-promos', auth, isAdmin, async (req, res) => {
  const { numeros } = req.body
  if (!numeros || numeros.length === 0) {
    return res.status(400).json({ message: 'Fournir au moins un numéro' })
  }

  try {
    const produits = await Product.findAll({
      where:   { is_promo: true, is_available: true },
      include: [{ model: User, as: 'seller', attributes: ['name', 'city'] }],
      order:   [['created_at', 'DESC']],
      limit:   6,
    })

    if (produits.length === 0) {
      return res.json({ message: 'Aucun produit en promo' })
    }

    // Lance en arrière-plan
    const envoyer = async () => {
      for (const p of produits) {
        await whatsapp.envoyerPromo(p, p.seller, numeros)
        await new Promise(r => setTimeout(r, 3000))
      }
    }
    envoyer().catch(console.error)

    res.json({ ok: true, message: `${produits.length} promos en cours d'envoi WhatsApp !` })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
})
// =============================================================
// À AJOUTER dans backend/routes/whatsapp.js
// Route POST /api/whatsapp/send — appelée par n8n
// =============================================================

// POST /api/whatsapp/send
// Route interne appelée par n8n pour envoyer un message
router.post('/send', async (req, res) => {
  const { to, message, image_url } = req.body
  if (!to || !message) return res.status(400).json({ message: 'to et message requis' })

  try {
    // Si Baileys connecté — utilise Baileys
    const whatsapp = require('../services/whatsappService')
    if (whatsapp.getStatut().connecte) {
      await whatsapp.envoyerMessage(to, message)
      return res.json({ ok: true, via: 'baileys' })
    }

    // Sinon — Meta Cloud API
    const token   = process.env.WHATSAPP_TOKEN
    const phoneId = process.env.WHATSAPP_PHONE_ID
    if (token && phoneId) {
      const axios = require('axios')
      await axios.post(
        `https://graph.facebook.com/v19.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return res.json({ ok: true, via: 'meta_cloud' })
    }

    res.status(503).json({ message: 'Aucun canal WhatsApp disponible' })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.response?.data?.error?.message || err.message })
  }
})
// Vérification webhook Meta
router.get('/meta-webhook', (req, res) => {
  const mode      = req.query['hub.mode']
  const token     = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === 'samakmarket') {
    res.status(200).send(challenge)
  } else {
    res.sendStatus(403)
  }
})

// Recevoir messages Meta
router.post('/meta-webhook', (req, res) => {
  // Forward vers n8n
  const axios = require('axios')
  axios.post('http://localhost:5678/webhook/whatsapp-webhook', req.body)
    .catch(console.error)
  res.sendStatus(200)
})


module.exports = router
