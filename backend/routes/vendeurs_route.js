// =============================================================
// backend/routes/vendeurs.js
// Routes publiques — vendeurs géolocalisés
// =============================================================

const express = require('express')
const router  = express.Router()
const { Op }  = require('sequelize')
const User    = require('../models/User')
const Product = require('../models/Product')

// Haversine — calcul distance km entre 2 coordonnées
const haversine = (lat1, lng1, lat2, lng2) => {
  const R  = 6371
  const dL = (lat2 - lat1) * Math.PI / 180
  const dG = (lng2 - lng1) * Math.PI / 180
  const a  = Math.sin(dL/2) ** 2
           + Math.cos(lat1 * Math.PI / 180)
           * Math.cos(lat2 * Math.PI / 180)
           * Math.sin(dG/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// =============================================================
// GET /api/vendeurs/carte
// Tous les vendeurs géolocalisés + nb produits + nb promos
// =============================================================
router.get('/carte', async (req, res) => {
  try {
    const vendeurs = await User.findAll({
      where: {
        role:      'seller',
        is_active: true,
        latitude:  { [Op.not]: null },
        longitude: { [Op.not]: null },
      },
      attributes: ['id', 'name', 'city', 'phone', 'whatsapp', 'latitude', 'longitude'],
    })

    const result = await Promise.all(vendeurs.map(async (v) => {
      const [nb_produits, nb_promos, produits] = await Promise.all([
        Product.count({ where: { seller_id: v.id, is_available: true } }),
        Product.count({ where: { seller_id: v.id, is_promo: true, is_available: true } }),
        Product.findAll({
          where:      { seller_id: v.id, is_available: true },
          attributes: ['id', 'name', 'price', 'unit', 'is_promo'],
          order:      [['is_promo', 'DESC'], ['created_at', 'DESC']],
          limit:      6,
        }),
      ])
      return { ...v.toJSON(), nb_produits, nb_promos, produits }
    }))

    res.json(result)
  } catch (err) {
    console.error('Erreur /vendeurs/carte:', err)
    res.status(500).json({ message: 'Erreur serveur', detail: err.message })
  }
})

// =============================================================
// GET /api/vendeurs/proches?lat=X&lng=Y&limit=5
// Vendeurs triés par distance depuis une position GPS
// =============================================================
router.get('/proches', async (req, res) => {
  const { lat, lng, limit = 5 } = req.query
  if (!lat || !lng) return res.status(400).json({ message: 'lat et lng requis' })

  try {
    const vendeurs = await User.findAll({
      where: {
        role:      'seller',
        is_active: true,
        latitude:  { [Op.not]: null },
        longitude: { [Op.not]: null },
      },
      attributes: ['id', 'name', 'city', 'phone', 'whatsapp', 'latitude', 'longitude'],
    })

    const tries = vendeurs
      .map(v => ({
        ...v.toJSON(),
        distance_km: haversine(
          parseFloat(lat), parseFloat(lng),
          parseFloat(v.latitude), parseFloat(v.longitude)
        )
      }))
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, parseInt(limit))

    const result = await Promise.all(tries.map(async (v) => {
      const produits = await Product.findAll({
        where:      { seller_id: v.id, is_available: true },
        attributes: ['id', 'name', 'category', 'price', 'unit', 'is_promo'],
        order:      [['is_promo', 'DESC'], ['created_at', 'DESC']],
        limit:      6,
      })
      return { ...v, produits, nb_promos: produits.filter(p => p.is_promo).length }
    }))

    res.json(result)
  } catch (err) {
    console.error('Erreur /vendeurs/proches:', err)
    res.status(500).json({ message: 'Erreur serveur', detail: err.message })
  }
})

module.exports = router
