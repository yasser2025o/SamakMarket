// =============================================================
// middleware/auth.js
// Middlewares de vérification JWT et de contrôle des rôles
// =============================================================
// Un "middleware" est une fonction qui s'exécute ENTRE la réception
// de la requête et l'exécution du controller.
//
// Schéma d'une requête :
//   Navigateur → [middleware auth] → [middleware isSeller] → Controller
//
// Si le middleware détecte un problème (token invalide, rôle insuffisant),
// il renvoie une erreur et le controller n'est JAMAIS appelé.
//
// Utilisation dans les routes :
//   router.post('/produit', auth, isSeller, productController.create)
//   ↑ Route publique ↑ Connecté ↑ Vendeur ↑ Action
// =============================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// =============================================================
// Middleware 1 : auth
// Vérifie que l'utilisateur est connecté (token JWT valide)
// =============================================================
const auth = async (req, res, next) => {
  try {
    // 1. Récupérer le header Authorization
    // Le frontend envoie : "Authorization: Bearer eyJhbGc..."
    const authHeader = req.headers.authorization;

    // 2. Vérifier que le header existe et commence par "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Accès refusé. Vous devez être connecté.',
        detail: 'Token JWT manquant dans le header Authorization',
      });
    }

    // 3. Extraire le token (enlever "Bearer " au début)
    // "Bearer eyJhbGc..." → "eyJhbGc..."
    const token = authHeader.split(' ')[1];

    // 4. Vérifier et décoder le token
    // jwt.verify() lance une erreur si le token est invalide ou expiré
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded contient ce qu'on a mis dans le token : { id: 1, role: 'seller' }

    // 5. Vérifier que l'utilisateur existe toujours en DB
    // (il pourrait avoir été supprimé ou désactivé depuis)
    const utilisateur = await User.findOne({
      where: {
        id: decoded.id,
        is_active: true, // Compte actif seulement
      },
    });

    if (!utilisateur) {
      return res.status(401).json({
        message: 'Compte introuvable ou désactivé.',
      });
    }

    // 6. Ajouter l'utilisateur à la requête
    // Maintenant req.user est disponible dans tous les middlewares suivants
    // et dans le controller → req.user.id, req.user.role, etc.
    req.user = utilisateur;

    // 7. Passer au middleware ou controller suivant
    next();
  } catch (erreur) {
    // Gérer les erreurs JWT spécifiques
    if (erreur.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expirée. Veuillez vous reconnecter.',
      });
    }
    if (erreur.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Token invalide. Veuillez vous reconnecter.',
      });
    }
    // Autre erreur inattendue
    return res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
  }
};

// =============================================================
// Middleware 2 : requireRole
// Fabrique un middleware qui vérifie le rôle de l'utilisateur
// =============================================================
// Usage : requireRole('admin') ou requireRole('seller', 'admin')
const requireRole = (...rolesAutorises) => {
  return (req, res, next) => {
    // req.user est disponible car le middleware "auth" s'est exécuté avant
    if (!req.user || !rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôle requis : ${rolesAutorises.join(' ou ')}`,
        votreRole: req.user?.role || 'non connecté',
      });
    }
    next(); // Rôle OK → on continue
  };
};

// --- Raccourcis pratiques ---

// isSeller : réservé aux vendeurs ET admins
const isSeller = requireRole('seller', 'admin');

// isAdmin : réservé aux admins uniquement
const isAdmin = requireRole('admin');

// On exporte tout pour utiliser dans les routes
module.exports = { auth, requireRole, isSeller, isAdmin };
