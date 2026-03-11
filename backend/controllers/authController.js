// =============================================================
// controllers/authController.js
// Gestion de l'inscription, connexion et profil utilisateur
// =============================================================
// Ce controller gère tout ce qui concerne l'authentification :
//
//   POST /api/auth/register → Créer un nouveau compte
//   POST /api/auth/login    → Se connecter, recevoir un token JWT
//   GET  /api/auth/me       → Voir son propre profil (token requis)
// =============================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// =============================================================
// Fonction utilitaire : générer un token JWT
// =============================================================
// JWT = JSON Web Token
// C'est un "badge numérique" signé que le serveur donne à l'utilisateur
// après la connexion. L'utilisateur le renvoie à chaque requête pour
// prouver son identité.
//
// Structure d'un JWT : header.payload.signature
// Le payload contient : { id: 1, role: 'seller', iat: ..., exp: ... }
const genererToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },      // Données stockées dans le token (payload)
    process.env.JWT_SECRET,    // Clé secrète pour signer (dans .env)
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } // Durée de validité
  );
  
};

// =============================================================
// POST /api/auth/register
// Inscription d'un nouvel utilisateur
// =============================================================
exports.register = async (req, res) => {
  try {
    // 1. Récupérer les données envoyées par le frontend
    // req.body contient le JSON de la requête
    const { name, email, password, phone, whatsapp, role, city } = req.body;

    // 2. Validation basique : champs obligatoires
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Champs obligatoires manquants',
        requis: ['name', 'email', 'password'],
      });
    }

    // 3. Vérifier si l'email est déjà utilisé
    const utilisateurExistant = await User.findOne({ where: { email } });
    if (utilisateurExistant) {
      return res.status(409).json({ // 409 = Conflict
        message: 'Un compte existe déjà avec cet email.',
      });
    }

    // 4. Créer l'utilisateur en base de données
    // Le hook "beforeCreate" du modèle User hashera le mot de passe automatiquement
    const nouvelUtilisateur = await User.create({
      name,
      email,
      password, // Sera hashé par le hook beforeCreate
      phone,
      whatsapp,
      // Sécurité : on n'accepte pas 'admin' depuis l'API publique !
      role: role === 'seller' ? 'seller' : 'buyer',
      city,
    });

    // 5. Générer le token JWT pour connecter directement après inscription
    const token = genererToken(nouvelUtilisateur.id, nouvelUtilisateur.role);

    // 6. Répondre avec le token et le profil (sans le mot de passe)
    res.status(201).json({ // 201 = Created
      message: 'Compte créé avec succès ! Bienvenue sur SamakMarket 🐟',
      token,
      user: nouvelUtilisateur.toSafeObject(), // Méthode définie dans le modèle User
    });

  } catch (erreur) {
    console.error('❌ Erreur lors de l\'inscription :', erreur);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'inscription',
      detail: erreur.message,
    });
  }
};

// =============================================================
// POST /api/auth/login
// Connexion d'un utilisateur existant
// =============================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Vérifier que email et password sont fournis
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // 2. Chercher l'utilisateur par email (compte actif seulement)
    const utilisateur = await User.findOne({
      where: { email, is_active: true },
    });

    // 3. Si pas trouvé → message volontairement vague (sécurité)
    // On ne dit pas si c'est l'email ou le mot de passe qui est faux
    if (!utilisateur) {
      return res.status(401).json({ // 401 = Unauthorized
        message: 'Email ou mot de passe incorrect.',
      });
    }

    // 4. Vérifier le mot de passe avec bcrypt
    // checkPassword() est définie dans le modèle User
    const motDePasseCorrect = await utilisateur.checkPassword(password);

console.log('🔑 Login - mdp saisi:', password)
console.log('🔒 Login - hash en DB:', utilisateur.password)
console.log('✅ Login - résultat bcrypt:', motDePasseCorrect)
    if (!motDePasseCorrect) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect.',
      });
    }

    // 5. Générer le token JWT
    const token = genererToken(utilisateur.id, utilisateur.role);
await utilisateur.update({ last_login: new Date() });
    // 6. Répondre avec le token
    res.json({
      message: `Bienvenue ${utilisateur.name} ! 👋`,
      token,
      user: utilisateur.toSafeObject(),
    });

  } catch (erreur) {
    console.error('❌ Erreur lors de la connexion :', erreur);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

// =============================================================
// GET /api/auth/me
// Récupérer le profil de l'utilisateur connecté
// Route protégée → le middleware "auth" s'exécute avant
// =============================================================
exports.getMe = async (req, res) => {
  try {
    // req.user est disponible grâce au middleware auth
    // On re-fetch depuis la DB pour avoir les données fraîches
    const utilisateur = await User.findByPk(req.user.id);

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
      user: utilisateur.toSafeObject(),
    });

  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
