// =============================================================
// models/Ad.js
// Modèle Sequelize pour la table "ads" (publicités)
// =============================================================
// Les vendeurs peuvent payer pour afficher une bannière
// publicitaire sur la marketplace (homepage, sidebar, etc.)
// L'admin valide ou rejette la demande.
// =============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ad = sequelize.define(
  'Ad',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Référence vers le vendeur qui paie la pub
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Titre de la publicité
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    // URL de l'image à afficher (bannière)
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // URL de destination quand on clique sur la pub
    link_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // Emplacement de la pub sur le site
    position: {
      type: DataTypes.ENUM('homepage', 'sidebar', 'top', 'bottom'),
      defaultValue: 'homepage',
    },

    // Statut du cycle de vie de la publicité
    status: {
      type: DataTypes.ENUM('pending', 'active', 'expired', 'rejected'),
      defaultValue: 'pending', // Toujours "en attente" à la création
    },

    // Montant que le vendeur a payé
    price_paid: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Date de début d'affichage
    starts_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Date de fin d'affichage
    ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Statistiques : nombre de clics sur cette pub
    clicks_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    // Statistiques : nombre de fois où la pub a été vue
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'ads',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Ad;
