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


// Le reste de ta route reste identique !
// GET /api/products/:id → Voir un produit spécifique
// ⚠️ Cette route doit être APRÈS /mine sinon Express confondrait
//    /mine avec un :id
//router.get('/:id', productController.getProduct);
// Correction : utiliser productController au lieu de ctrl (variable non définie)
router.get('/promos', productController.getPromos);
// =============================================================
// Routes PUBLIQUES → Accessible à tout le monde
// =============================================================
router.get('/', productController.getAllProducts);      // ← RESTAURER
router.get('/:id', productController.getProduct);       // ← RESTAURER (APRÈS /mine)


// =============================================================
// Routes PROTÉGÉES → Vendeur connecté uniquement
// Ordre des middlewares : auth → isSeller → controller
// ============================================================= GET /api/products/mine → Mes produits (dashboard)
// PUT /api/products/:id → Modifier un produit
router.put('/:id', auth, isSeller, productController.updateProduct);
// auth    = vérifie le token JWT
// isSeller = vérifie que le rôle est 'seller' ou 'admin'

router.get('/mine', auth, isSeller, productController.getMyProducts);

// POST /api/products → Créer un produit
router.post('/', auth, isSeller, productController.createProduct);



// DELETE /api/products/:id → Supprimer un produit
router.delete('/:id', auth, isSeller, productController.deleteProduct);



module.exports = router;
