// =============================================================
// models/Review.js
// Modèle pour les avis et notes sur les produits
// =============================================================
// Les acheteurs peuvent noter un produit de 1 à 5 étoiles
// et laisser un commentaire écrit.
// Règle : UN SEUL avis par acheteur et par produit.
// =============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Le produit qui reçoit l'avis
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // L'acheteur qui laisse l'avis
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Note de 1 à 5 étoiles
    rating: {
      type: DataTypes.TINYINT, // Nombre entre -128 et 127 (léger en mémoire)
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'La note minimum est 1 étoile' },
        max: { args: [5], msg: 'La note maximum est 5 étoiles' },
      },
    },

    // Commentaire libre (optionnel)
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,

    // Index unique : empêche un même acheteur de noter deux fois
    // le même produit au niveau de la base de données
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'buyer_id'],
        name: 'un_avis_par_produit_et_acheteur',
      },
    ],
  }
);

module.exports = Review;
