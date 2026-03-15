// =============================================================
// routes/products.js
// Routes pour la gestion des produits
// =============================================================

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isSeller } = require('../middleware/auth');
const { auth, isAdmin } = require('../middleware/auth')
const { Product, User } = require('../models')

// =============================================================
// Routes PUBLIQUES → Accessible à tout le monde
// =============================================================

// GET /api/products → Lister tous les produits (avec filtres)
router.get('/', productController.getAllProducts);

// GET /api/products/:id → Voir un produit spécifique
// ⚠️ Cette route doit être APRÈS /mine sinon Express confondrait
//    /mine avec un :id
//router.get('/:id', productController.getProduct);
// Correction : utiliser productController au lieu de ctrl (variable non définie)
router.get('/promos', productController.getPromos);
// =============================================================
// Routes PROTÉGÉES → Vendeur connecté uniquement
// Ordre des middlewares : auth → isSeller → controller
// =============================================================

// GET /api/products/mine → Mes produits (dashboard)
// auth    = vérifie le token JWT
// isSeller = vérifie que le rôle est 'seller' ou 'admin'
router.get('/mine', auth, isSeller, productController.getMyProducts);

// POST /api/products → Créer un produit
router.post('/', auth, isSeller, productController.createProduct);

// PUT /api/products/:id → Modifier un produit
router.put('/:id', auth, isSeller, productController.updateProduct);

// DELETE /api/products/:id → Supprimer un produit
router.delete('/:id', auth, isSeller, productController.deleteProduct);

// =============================================================
// À AJOUTER dans backend/models/Product.js
// Hook afterCreate — auto-post sur Facebook quand produit créé
//
// PLACEMENT : juste avant "module.exports = Product"
// =============================================================

// const { posterSurFacebook, formaterMessageProduit } = require('../routes/facebook')
// //const User = require('./User')

// // Auto-post Facebook quand un nouveau produit est créé
// Product.addHook('afterCreate', async (produit) => {
//   try {
//     // Récupère le vendeur
//     const vendeur = await User.findByPk(produit.seller_id, {
//       attributes: ['name', 'city'],
//     })

//     // Ne poste que si le produit est disponible
//     if (!produit.is_available) return

//     const message   = formaterMessageProduit(produit, vendeur)
//     const images    = JSON.parse(produit.images || '[]')
//     const image_url = images[0]
//       ? `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${images[0]}`
//       : null
//     const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${produit.id}`

//     await posterSurFacebook({ message, image_url, link: image_url ? undefined : link })
//     console.log(`✅ Produit "${produit.name}" auto-posté sur Facebook`)
//   } catch (err) {
//     // Ne bloque pas la création du produit si FB échoue
//     console.error('⚠️ Auto-post Facebook échoué (non bloquant):', err.message)
//   }
// })

module.exports = router;
