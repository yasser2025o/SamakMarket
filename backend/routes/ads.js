// =============================================================
// routes/ads.js
// Routes pour les publicités
// =============================================================

const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { auth, isSeller, isAdmin } = require('../middleware/auth');

// Publique : voir les pubs actives
router.get('/', adController.getActiveAds);

// Publique : enregistrer un clic
router.post('/:id/click', adController.trackClick);

// Vendeur : soumettre une pub
router.post('/', auth, isSeller, adController.createAd);

// Admin seulement : valider/rejeter une pub
router.put('/:id/status', auth, isAdmin, adController.updateAdStatus);

module.exports = router;
