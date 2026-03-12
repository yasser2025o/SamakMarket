// =============================================================
// backend/routes/flash.js
// Routes offres flash
//
// Dans server.js ajouter :
//   app.use('/api/flash', require('./routes/flash'))
// =============================================================

const express = require('express')
const router  = express.Router()
const { Op }  = require('sequelize')
const { auth, isAdmin } = require('../middleware/auth')

// Charge Product dynamiquement pour éviter circular deps
const getProduct = () => require('../models').Product
const getUser    = () => require('../models').User

// =============================================================
// GET /api/flash/active
// Retourne toutes les offres flash actives en ce moment
// =============================================================
router.get('/active', async (req, res) => {
  try {
    const Product = getProduct()
    const User    = getUser()
    const now     = new Date()

    const offres = await Product.findAll({
      where: {
        is_flash:    true,
        is_available: true,
        flash_start: { [Op.lte]: now },
        flash_end:   { [Op.gt]:  now },
      },
      include: [{ model: User, as: 'seller', attributes: ['name', 'city', 'whatsapp'] }],
      order:   [['flash_end', 'ASC']], // expire bientôt en premier
    })

    res.json(offres)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const Product = getProduct()
    const User    = getUser()
    const offres  = await Product.findAll({
      where:   { is_flash: true },
      include: [{ model: User, as: 'seller', attributes: ['name', 'city'] }],
      order:   [['flash_end', 'DESC']],
    })
    res.json(offres)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// =============================================================
// POST /api/flash/:id — créer/modifier une offre flash (admin/vendeur)
// Body: { flash_price, duree_minutes }
// =============================================================
router.post('/:id', auth, async (req, res) => {
  try {
    const Product = getProduct()
    const { flash_price, duree_minutes = 120 } = req.body

    if (!flash_price || flash_price <= 0) {
      return res.status(400).json({ message: 'flash_price requis' })
    }
    if (duree_minutes < 15 || duree_minutes > 1440) {
      return res.status(400).json({ message: 'Durée entre 15 min et 24h' })
    }

    const produit = await Product.findByPk(req.params.id)
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' })

    // Vérif autorisation
    if (req.user.role !== 'admin' && req.user.id !== produit.seller_id) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    const now   = new Date()
    const fin   = new Date(now.getTime() + duree_minutes * 60 * 1000)

    await produit.update({
      is_flash:    true,
      flash_price: parseFloat(flash_price),
      flash_start: now,
      flash_end:   fin,
    })

    res.json({
      message: `Offre flash créée — expire dans ${duree_minutes} min`,
      produit: {
        id:          produit.id,
        name:        produit.name,
        flash_price: produit.flash_price,
        flash_end:   fin,
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// =============================================================
// DELETE /api/flash/:id — annuler une offre flash
// =============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const Product = getProduct()
    const produit = await Product.findByPk(req.params.id)
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' })

    if (req.user.role !== 'admin' && req.user.id !== produit.seller_id) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    await produit.update({ is_flash: false, flash_price: null, flash_start: null, flash_end: null })
    res.json({ message: 'Offre flash annulée' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// =============================================================
// GET /api/flash/admin/all — toutes les flash (admin)
// =============================================================


module.exports = router
