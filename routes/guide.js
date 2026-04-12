// =============================================================
//  routes/guide.js  —  SamakMarket
//  Guide "New in Town" — API données par ville
//  Mount dans server.js : app.use('/api/guide', require('./routes/guide'))
// =============================================================

const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/guideController')

// GET /api/guide/:ville  → toutes les données du guide pour une ville
// Ex: /api/guide/Tanger
router.get('/:ville', controller.getGuideVille)

// GET /api/guide/:ville/pepites → top offres même éloignées
router.get('/:ville/pepites', controller.getPepites)

module.exports = router
