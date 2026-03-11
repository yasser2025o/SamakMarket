// =============================================================
// models/Product.js
// Modèle Sequelize pour la table "products"
// =============================================================
// Représente une annonce de produit publiée par un vendeur.
// Chaque produit appartient à un vendeur (seller_id).
// =============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    // --- Clé primaire ---
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // --- Référence vers le vendeur ---
    // seller_id est une clé étrangère : elle pointe vers users.id
    // Cela crée un lien entre ce produit et son vendeur
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Un produit DOIT avoir un vendeur
    },

    // --- Nom du produit ---
    // Exemples : "Sardine fraîche", "Thon rouge", "Crevettes royales"
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom du produit est obligatoire' },
      },
    },

    // --- Description ---
    // Texte libre pour décrire le produit (origine, qualité, conseil...)
    description: {
      type: DataTypes.TEXT, // TEXT = texte long (pas de limite fixe)
      allowNull: true,
    },

    // --- Prix ---
    // DECIMAL(10, 2) = nombre avec 2 décimales (ex: 15.50)
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Le prix doit être un nombre positif' },
      },
    },

    // --- Unité de vente ---
    // Exemples : "kg", "pièce", "lot de 10", "caisse"
    unit: {
      type: DataTypes.STRING(50),
      defaultValue: 'kg',
    },

    // --- Quantité en stock ---
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    // --- Catégorie ---
    // Permet de filtrer : Sardine, Thon, Crevette, Mérou, Capitaine...
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // --- Images ---
    // On stocke un tableau d'URLs en JSON
    // Exemple MySQL : '["https://site.com/img1.jpg", "https://site.com/img2.jpg"]'
    // En JavaScript : ["https://site.com/img1.jpg", "https://site.com/img2.jpg"]
    images: {
      type: DataTypes.JSON,
      defaultValue: [], // Tableau vide par défaut
    },

    // --- Ville ---
    // Où le produit est disponible (pour le filtre géographique)
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // --- Disponibilité ---
    // false = le produit n'est plus dispo mais on ne le supprime pas
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    // --- Produit mis en avant ---
    // true = apparaît en premier dans les résultats (option payante)
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    is_promo: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},
    // --- Compteur de vues ---
    // S'incrémente chaque fois qu'un visiteur ouvre la page du produit
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Product;
