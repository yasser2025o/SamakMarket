// =============================================================
// routes/auth.js
// Définition des routes d'authentification
// =============================================================
// Une "route" lie une URL + méthode HTTP à une fonction controller.
//
// Schéma :
//   router.METHOD('/chemin', [middlewares], controller.fonction)
//
// Les middlewares sont optionnels. S'il y en a plusieurs, ils
// s'exécutent dans l'ordre avant le controller.
// =============================================================

const express = require('express');
const router = express.Router(); // Créer un routeur Express
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// --- Routes publiques (pas besoin d'être connecté) ---

// POST /api/auth/register → Inscription
router.post('/register', authController.register);

// POST /api/auth/login → Connexion
router.post('/login', authController.login);

// --- Routes protégées (token JWT requis) ---

// GET /api/auth/me → Mon profil
// Le middleware "auth" vérifie le token avant d'appeler getMe()
router.get('/me', auth, authController.getMe);

module.exports = router;
