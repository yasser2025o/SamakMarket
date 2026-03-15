// =============================================================
// routes/products.js
// Routes pour la gestion des produits
// =============================================================

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isSeller } = require('../middleware/auth');

// =============================================================
// Routes PUBLIQUES → Accessible à tout le monde
// =============================================================

// GET /api/products → Lister tous les produits (avec filtres)
router.get('/', productController.getAllProducts);

// GET /api/products/:id → Voir un produit spécifique
// ⚠️ Cette route doit être APRÈS /mine sinon Express confondrait
//    /mine avec un :id
router.get('/:id', productController.getProduct);

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

module.exports = router;
