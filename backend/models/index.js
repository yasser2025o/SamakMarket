// =============================================================
// models/index.js
// Point d'entrée de tous les modèles + définition des relations
// =============================================================
// Ce fichier fait deux choses importantes :
// 1. Importer tous les modèles Sequelize
// 2. Définir les ASSOCIATIONS (relations entre les tables)
//
// Les associations permettent de faire des requêtes intelligentes.
// Exemple : récupérer un produit ET son vendeur en une seule requête.
// =============================================================

const sequelize = require('../config/database');

// Import de tous les modèles
const User         = require('./User');
const Product      = require('./Product');
const Ad           = require('./Ad');
const Subscription = require('./Subscription');
const Review       = require('./Review');

// =============================================================
// ASSOCIATIONS (Relations entre les tables)
// =============================================================
// Il existe plusieurs types de relations :
//
//   hasMany     → "A plusieurs" (ex: un vendeur A PLUSIEURS produits)
//   belongsTo   → "Appartient à" (ex: un produit APPARTIENT À un vendeur)
//   hasOne      → "A un seul" (ex: un user A UN profil)
//   belongsToMany → "Appartient à plusieurs" (many-to-many)
// =============================================================

// --- User ↔ Product ---
// Un vendeur peut avoir PLUSIEURS produits
User.hasMany(Product, {
  foreignKey: 'seller_id', // Colonne dans la table products
  as: 'products',          // Alias pour les requêtes : user.getProducts()
});
// Un produit appartient à UN seul vendeur
Product.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller', // Alias : product.getSeller()
});

// --- User ↔ Ad ---
// Un vendeur peut avoir PLUSIEURS publicités
User.hasMany(Ad, {
  foreignKey: 'seller_id',
  as: 'ads',
});
Ad.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller',
});

// --- User ↔ Subscription ---
// Un utilisateur peut avoir PLUSIEURS abonnements (historique)
User.hasMany(Subscription, {
  foreignKey: 'user_id',
  as: 'subscriptions',
});
Subscription.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// --- Product ↔ Review ---
// Un produit peut avoir PLUSIEURS avis
Product.hasMany(Review, {
  foreignKey: 'product_id',
  as: 'reviews',
});
Review.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

// --- User ↔ Review ---
// Un acheteur peut laisser PLUSIEURS avis (sur des produits différents)
User.hasMany(Review, {
  foreignKey: 'buyer_id',
  as: 'myReviews',
});
Review.belongsTo(User, {
  foreignKey: 'buyer_id',
  as: 'buyer',
});


// =============================================================
// On exporte tout pour pouvoir importer depuis les controllers
// Utilisation : const { User, Product } = require('../models');
// =============================================================
module.exports = {
  sequelize,
  User,
  Product,
  Ad,
  Subscription,
  Review,
};
