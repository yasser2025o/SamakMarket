// =============================================================
// routes/admin.js
// Routes du dashboard admin — toutes protégées par isAdmin
//
// INTÉGRATION dans server.js :
//   app.use('/api/admin', require('./routes/admin'));
//
// ENDPOINTS :
//   GET /api/admin/stats    → KPI globaux
//   GET /api/admin/vendeurs → liste vendeurs + nb articles/promos/vues
//   GET /api/admin/produits → tous les produits pour le comparateur prix
// =============================================================

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { auth, isAdmin } = require('../middleware/auth');

// Toutes les routes admin nécessitent :
//   1. auth    = être connecté (token JWT valide)
//   2. isAdmin = avoir le rôle 'admin'
// Si l'une des deux échoue → 401 ou 403 automatiquement

router.get('/stats',    auth, isAdmin, ctrl.getStats);
router.get('/vendeurs', auth, isAdmin, ctrl.getVendeurs);
router.get('/produits', auth, isAdmin, ctrl.getProduits);
router.get('/vendeur/:id',          auth, isAdmin, ctrl.getVendeurSession)
router.get('/vendeur/:id/produits', auth, isAdmin, ctrl.getVendeurProduits)
router.post('/reset-password/:id', auth, isAdmin, ctrl.resetPassword)
module.exports = router;

