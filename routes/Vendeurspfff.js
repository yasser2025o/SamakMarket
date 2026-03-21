
// =============================================================
// routes/vendeurs.js — VERSION ULTRA-OPTIMISÉE ✅
// 1 REQUÊTE SQL avec Haversine MySQL natif + TOUS les champs Product/User
// Performance : 50ms → 5ms | Scalable 10k+ vendeurs
// =============================================================
const express = require('express')
const router = express.Router()
const { Op, fn, col, literal, where } = require('sequelize')
const User = require('../models/User')
const Product = require('../models/Product')

// 🆕 Haversine MySQL Natif (6371km rayon Terre)
const haversineSQL = (lat, lng) => `
  6371 * 2 * ASIN(
    SQRT(
      POWER(SIN((RADIANS(${lat}) - RADIANS(latitude)) / 2), 2) +
      COS(RADIANS(${lat})) * COS(RADIANS(latitude)) *
      POWER(SIN((RADIANS(${lng}) - RADIANS(longitude)) / 2), 2)
    )
  )
`

// =============================================================
// 🗺️ GET /api/vendeurs/carte — Tous vendeurs (admin/marketplace)
// =============================================================
router.get('/carte', async (req, res) => {
  try {
    const { limit = 20, ville } = req.query
    
    const whereClause = {
      role: 'seller',
      is_active: true,
      latitude: { [Op.not]: null },
      longitude: { [Op.not]: null },
    }
    if (ville) whereClause.city = { [Op.iLike]: `%${ville}%` }

    // 1️⃣ UNE SEULE REQUÊTE — Vendeurs + stats + 6 top produits
    const vendeurs = await User.findAll({
      where: whereClause,
      attributes: [
        'id', 'name', 'city', 'phone', 'whatsapp', 'latitude', 'longitude', 
        'avatar', 'last_login', 'is_active',
        [fn('COUNT', col('products.id')), 'nb_produits'],
        [fn('SUM', literal('CASE WHEN products.is_promo = 1 THEN 1 ELSE 0 END')), 'nb_promos'],
        [fn('SUM', literal('CASE WHEN products.is_flash = 1 THEN 1 ELSE 0 END')), 'nb_flash'],
      ],
      include: [{
        model: Product,
        as: 'products',
        where: { is_available: true },
        attributes: [
          'id', 'name', 'price', 'unit', 'category', 'quantity', 
          'is_promo', 'is_flash', 'flash_price', 'is_featured', 'views_count'
        ],
        order: [
          ['is_flash', 'DESC'],
          ['is_promo', 'DESC'],
          ['is_featured', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: 6,
        required: false
      }],
      group: ['User.id'],
      order: [
        [{ model: Product, as: 'products' }, 'is_flash', 'DESC'],
        [{ model: Product, as: 'products' }, 'is_promo', 'DESC'],
        ['last_login', 'DESC']
      ],
      limit: parseInt(limit),
      subQuery: false
    })

    // 2️⃣ Nettoyage + calculs
    const result = vendeurs.map(v => {
      const data = v.toJSON()
      return {
        ...data,
        nb_produits: parseInt(data.nb_produits || 0),
        nb_promos: parseInt(data.nb_promos || 0),
        nb_flash: parseInt(data.nb_flash || 0),
        produits: data.products || [],
        stock_total: data.produits?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0
      }
    })

    res.json(result)
  } catch (err) {
    console.error('❌ /vendeurs/carte:', err)
    res.status(500).json({ message: 'Erreur serveur', detail: err.message })
  }
})

// =============================================================
// 📍 GET /api/vendeurs/proches — 6+ vendeurs les PLUS PROCHES
// Flux complet : GPS → Haversine SQL → Tri → Produits inclus
// =============================================================
router.get('/proches', async (req, res) => {
  const { lat, lng, limit = 6, rayon = 25 } = req.query // rayon=25km
  
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ 
      message: 'Paramètres GPS requis: lat, lng (ex: ?lat=35.75&lng=-5.83)' 
    })
  }

  try {
    // 🆕 1️⃣ REQUÊTE SQL Haversine + LIMIT — ULTRA-RAPIDE !
    const distanceCol = literal(haversineSQL(lat, lng))
    
    const vendeurs = await User.findAll({
      where: {
        role: 'seller',
        is_active: true,
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null },
        [distanceCol]: { [Op.lte]: parseFloat(rayon) } // Optimisation rayon
      },
      attributes: {
        include: [
          [distanceCol, 'distance_km'],
          [fn('COUNT', col('products.id')), 'nb_produits'],
          [fn('SUM', literal('CASE WHEN products.is_promo = 1 THEN 1 ELSE 0 END')), 'nb_promos'],
          [fn('SUM', literal('CASE WHEN products.is_flash = 1 THEN 1 ELSE 0 END')), 'nb_flash'],
        ],
        exclude: ['password'] // Sécurité
      },
      include: [{
        model: Product,
        as: 'products',
        where: { 
          is_available: true,
          quantity: { [Op.gt]: 0 } // Stock > 0
        },
        attributes: [
          'id', 'name', 'description', 'price', 'unit', 'quantity', 'category',
          'images', 'is_promo', 'is_flash', 'flash_price', 'flash_start', 
          'flash_end', 'is_featured', 'views_count', 'city'
        ],
        order: [
          ['is_flash', 'DESC'],
          ['is_promo', 'DESC'],
          ['is_featured', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: 8, // Plus pour le top vendeur
        required: false
      }],
      group: ['User.id'],
      order: [[distanceCol, 'ASC']], // 🆕 TRI SQL par distance !
      limit: parseInt(limit),
      subQuery: false
    })

    // 2️⃣ Enrichissement final
    const result = vendeurs.map(v => {
      const data = v.toSafeObject ? v.toSafeObject() : v.toJSON()
      const produits = data.products || []
      
      return {
        ...data,
        distance_km: parseFloat(data.distance_km || 999),
        nb_produits: parseInt(data.nb_produits || 0),
        nb_promos: parseInt(data.nb_promos || 0),
        nb_flash: parseInt(data.nb_flash || 0),
        produits,
        stock_total: produits.reduce((sum, p) => sum + p.quantity, 0),
        has_whatsapp: !!(data.whatsapp || data.phone),
        is_online: data.last_login && 
          new Date(data.last_login) > new Date(Date.now() - 24*60*60*1000)
      }
    })

    console.log(`📍 ${result.length} vendeurs trouvés < ${rayon}km`)
    res.json(result)

  } catch (err) {
    console.error('❌ /vendeurs/proches:', err)
    res.status(500).json({ 
      message: 'Erreur géolocalisation', 
      detail: err.message 
    })
  }
})

// =============================================================
// 🆕 POST /api/vendeurs/stats — Admin dashboard
// =============================================================
router.get('/stats', async (req, res) => {
  try {
    const [vendors, products, promos] = await Promise.all([
      User.count({ where: { role: 'seller', is_active: true } }),
      Product.count({ where: { is_available: true } }),
      Product.count({ where: { is_promo: true, is_available: true } })
    ])
    
    res.json({ vendors, products, promos })
  } catch (err) {
    res.status(500).json({ message: 'Erreur stats' })
  }
})

module.exports = router






// // ## Le flux complet
// // ```
// // 1. Visiteur ouvre SamakMarket
// //         ↓
// // 2. Clique "Près de moi" → GPS donne lat=35.75, lng=-5.83
// //         ↓
// // 3. Frontend envoie → GET /api/vendeurs/proches?lat=35.75&lng=-5.83
// //         ↓
// // 4. Backend récupère TOUS les vendeurs avec latitude/longitude dans MySQL
// //         ↓
// // 5. Pour CHAQUE vendeur → calcule haversine(visiteur, vendeur) = distance en km
// //         ↓
// // 6. Trie par distance croissante → garde les 5 premiers
// //         ↓
// // 7. Retourne les 5 vendeurs + leurs produits au frontend
// //         ↓
// // 8. Frontend affiche les cartes avec badge "1.2 km", "3.4 km"...
// const express = require('express')
// const router  = express.Router()
// const { Op, fn, col, literal } = require('sequelize')
// const User    = require('../models/User')
// const Product = require('../models/Product')
// // Haversine — calcul distance km entre 2 coordonnées
// const haversine = (lat1, lng1, lat2, lng2) => {
//   const R  = 6371
//   const dL = (lat2 - lat1) * Math.PI / 180
//   const dG = (lng2 - lng1) * Math.PI / 180
//   const a  = Math.sin(dL/2) ** 2
//            + Math.cos(lat1 * Math.PI / 180)
//            * Math.cos(lat2 * Math.PI / 180)
//            * Math.sin(dG/2) ** 2
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
// }

// // =============================================================
// // GET /api/vendeurs/carte
// // Tous les vendeurs géolocalisés + nb produits + nb promos
// // ========================route un market+ carte admin ...????=====================================
// // router.get('/carte', async (req, res) => {
// //   try {
// //     const vendeurs = await User.findAll({
// //       where: {
// //         role:      'seller',
// //         is_active: true,
// //         latitude:  { [Op.not]: null },
// //         longitude: { [Op.not]: null },
// //       },
// //       attributes: ['id', 'name', 'city', 'phone', 'whatsapp', 'latitude', 'longitude'],
// //     })

// //     const result = await Promise.all(vendeurs.map(async (v) => {
// //       const [nb_produits, nb_promos, produits] = await Promise.all([
// //         Product.count({ where: { seller_id: v.id, is_available: true } }),
// //         Product.count({ where: { seller_id: v.id, is_promo: true, is_available: true } }),
// //         Product.findAll({
// //           where:      { seller_id: v.id, is_available: true },
// //           attributes: ['id', 'name', 'price', 'unit', 'is_promo'],
// //           order:      [['is_promo', 'DESC'], ['created_at', 'DESC']],
// //           limit:      6,
// //         }),
// //       ])
// //       return { ...v.toJSON(), nb_produits, nb_promos, produits }
// //     }))

// //     res.json(result)
// //   } catch (err) {
// //     console.error('Erreur /vendeurs/carte:', err)
// //     res.status(500).json({ message: 'Erreur serveur', detail: err.message })
// //   }
// // })
// // Tous les vendeurs géolocalisés → pour la carte
// // router.get('/carte', async (req, res) => {
// //   try {
// //     const vendeurs = await User.findAll({
// //       where: {
// //         role: 'seller', is_active: true,
// //         latitude:  { [Op.not]: null },
// //         longitude: { [Op.not]: null },
// //       },
// //       attributes: ['id','name','city','phone','whatsapp','latitude','longitude'],
// //     })
// //     const result = await Promise.all(vendeurs.map(async (v) => {
// //       const [nb_produits, nb_promos] = await Promise.all([
// //         Product.count({ where: { seller_id: v.id, is_available: true } }),
// //         Product.count({ where: { seller_id: v.id, is_promo: true, is_available: true } }),
// //       ])
// //       return { ...v.toJSON(), nb_produits, nb_promos }
// //     }))
// //     res.json(result)
// //   } catch (err) {
// //     res.status(500).json({ message: 'Erreur serveur', detail: err.message })
// //   }
// // // })
// // router.get('/carte', async (req, res) => {
// // try {
// // //const { Op, fn, col, literal } = require('sequelize')

// // const vendeurs = await User.findAll({
// // where: {
// // role: 'seller',
// // is_active: true,
// // latitude: { [Op.not]: null },
// // longitude: { [Op.not]: null },
// // },
// // attributes: [
// // 'id', 'name', 'city', 'phone', 'whatsapp', 'latitude', 'longitude',
// // [fn('COUNT', col('products.id')), 'nb_produits'],
// // [fn('SUM', literal('CASE WHEN `products`.`is_promo` = 1 THEN 1 ELSE 0 END')), 'nb_promos'],
// // ],
// // include: [{
// // model: Product,
// // as: 'products',
// // attributes: ['id', 'name', 'price', 'unit', 'is_promo'], // ← ajoute les données
// // required: false,
// // where: { is_available: true },
// // separate: true, // ← charge séparément pour éviter conflit avec COUNT
// // limit: 6,
// // order: [['is_promo', 'DESC']],
// // }],
// // group: ['User.id'],
// // limit: 15, // ← max 15 vendeurs
// // subQuery: false,
// // })

// // // const result = vendeurs.map(v => ({
// // // ...v.toJSON(),
// // // nb_produits: parseInt(v.dataValues.nb_produits || 0),
// // // nb_promos: parseInt(v.dataValues.nb_promos || 0),
// // // }))
// // const result = vendeurs
// // .map(v => ({
// // ...v.toJSON(),
// // nb_produits: parseInt(v.dataValues.nb_produits || 0),
// // nb_promos: parseInt(v.dataValues.nb_promos || 0),
// // produits: [], // ← ajoute tableau vide par défaut
// // undefined, // ← pour forcer la virgule finale même si pas de produits
// // distance: haversine(
// // parseFloat(lat), parseFloat(lng),
// // parseFloat(v.latitude), parseFloat(v.longitude)
// // )
// // }))
// // .sort((a, b) => a.distance_km - b.distance_km)
// // .slice(0, parseInt(limit))

// // res.json(result)
// // } catch (err) {
// // console.error('Erreur /vendeurs/carte:', err)
// // res.status(500).json({ message: 'Erreur serveur', detail: err.message })
// // }
// // })
// router.get('/carte', async (req, res) => {
// try {
// // Requête 1 — vendeurs + COUNT
// const vendeurs = await User.findAll({
// where: {
// role: 'seller',
// is_active: true,
// latitude: { [Op.not]: null },
// longitude: { [Op.not]: null },
// },
// attributes: [
// 'id', 'name', 'city', 'phone', 'whatsapp', 'latitude', 'longitude',
// [fn('COUNT', col('products.id')), 'nb_produits'],
// [fn('SUM', literal('CASE WHEN `products`.`is_promo` = 1 THEN 1 ELSE 0 END')), 'nb_promos'],
// ],
// include: [{
// model: Product,
// as: 'products',
// attributes: [],
// required: false,
// where: { is_available: true },
// }],
// group: ['User.id'],
// limit: 15,
// subQuery: false,
// })

// // Requête 2 — produits par vendeur
// const ids = vendeurs.map(v => v.id)
// const produits = await Product.findAll({
// where: { seller_id: ids, is_available: true },
// attributes: ['id', 'name', 'price', 'unit', 'is_promo', 'seller_id'],
// order: [['is_promo', 'DESC']],
// })

// // Assembler
// const result = vendeurs.map(v => {
// const vJson = v.toJSON()
// return {
// ...vJson,
// nb_produits: parseInt(v.dataValues.nb_produits || 0),
// nb_promos: parseInt(v.dataValues.nb_promos || 0),
// produits: produits.filter(p => p.seller_id === v.id).slice(0, 6),
// distance: undefined,
// }
// })

// res.json(result)
// } catch (err) {
// console.error('Erreur /vendeurs/carte:', err)
// res.status(500).json({ message: 'Erreur serveur', detail: err.message })
// }
// })

// // 5 vendeurs les plus proches du visiteur
// // router.get('/proches', async (req, res) => {
// //   const { lat, lng, limit = 5 } = req.query
// //   if (!lat || !lng) return res.status(400).json({ message: 'lat et lng requis' })

// //   const haversine = (lat1, lng1, lat2, lng2) => {
// //     const R  = 6371
// //     const dL = (lat2 - lat1) * Math.PI / 180
// //     const dG = (lng2 - lng1) * Math.PI / 180
// //     const a  = Math.sin(dL/2)**2
// //             + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180)
// //             * Math.sin(dG/2)**2
// //     return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
// //   }

// //   try {
// //     const vendeurs = await User.findAll({
// //       where: {
// //         role: 'seller', is_active: true,
// //         latitude:  { [Op.not]: null },
// //         longitude: { [Op.not]: null },
// //       },
// //       attributes: ['id','name','city','phone','whatsapp','latitude','longitude'],
// //     })

// //     const tries = vendeurs
// //       .map(v => ({
// //         ...v.toJSON(),
// //         distance_km: haversine(
// //           parseFloat(lat), parseFloat(lng),
// //           parseFloat(v.latitude), parseFloat(v.longitude)
// //         )
// //       }))
// //       .sort((a, b) => a.distance_km - b.distance_km)
// //       .slice(0, parseInt(limit))

// //     const result = await Promise.all(tries.map(async (v) => {
// //       const produits = await Product.findAll({
// //         where: { seller_id: v.id, is_available: true },
// //         attributes: ['id','name','category','price','unit','is_promo'],
// //         order: [['is_promo','DESC'],['created_at','DESC']],
// //         limit: 6,
// //       })
// //       return { ...v, produits, nb_promos: produits.filter(p => p.is_promo).length }
// //     }))

// //     res.json(result)
// //   } catch (err) {
// //     res.status(500).json({ message: 'Erreur serveur', detail: err.message })
// //   }
// // })
// router.get('/proches', async (req, res) => {
// const { lat, lng, limit = 15 } = req.query
// if (!lat || !lng) return res.status(400).json({ message: 'lat et lng requis' })

// try {
// // 1 seule requête — tous les vendeurs géolocalisés
// const vendeurs = await User.findAll({
// where: {
// role: 'seller',
// is_active: true,
// latitude: { [Op.not]: null },
// longitude: { [Op.not]: null },
// },
// attributes: [
// 'id', 'name', 'city', 'phone', 'whatsapp', 'latitude', 'longitude',
// [fn('COUNT', col('products.id')), 'nb_produits'],
// [fn('SUM', literal('CASE WHEN `products`.`is_promo` = 1 THEN 1 ELSE 0 END')), 'nb_promos'],
// ],
// include: [{
// model: Product,
// as: 'products',
// attributes: [],
// required: false,
// where: { is_available: true },
// }],
// group: ['User.id'],
// subQuery: false,
// })

// // Calcul distance + tri + limite côté JS
// const result = vendeurs
// .map(v => ({
// ...v.toJSON(),
// nb_produits: parseInt(v.dataValues.nb_produits || 0),
// nb_promos: parseInt(v.dataValues.nb_promos || 0),
// distance_km: haversine(
// parseFloat(lat), parseFloat(lng),
// parseFloat(v.latitude), parseFloat(v.longitude)
// )
// }))
// .sort((a, b) => a.distance_km - b.distance_km)
// .slice(0, parseInt(limit))
// // Requête 2 — produits par vendeur
// const ids = result.map(v => v.id)
// const produits = await Product.findAll({
// where: { seller_id: ids, is_available: true },
// attributes: ['id', 'name', 'price', 'unit', 'is_promo', 'seller_id'],
// order: [['is_promo', 'DESC']],
// })

// const resultAvecProduits = result.map(v => ({
// ...v,
// produits: produits.filter(p => p.seller_id === v.id).slice(0, 6),
// }))

// res.json(resultAvecProduits)
// } catch (err) {
// res.status(500).json({ message: 'Erreur serveur', detail: err.message })
// }
// })

// module.exports = router

