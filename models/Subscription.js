// =============================================================
// models/Subscription.js
// Modèle pour les abonnements premium (SaaS)
// =============================================================
// Les vendeurs peuvent s'abonner à un plan payant pour débloquer :
// - Plus de produits
// - Badge "Vendeur Premium"
// - Produits mis en avant
// - Accès aux statistiques
// =============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define(
  'Subscription',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // L'utilisateur qui s'abonne
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Plan choisi par l'utilisateur
    plan: {
      type: DataTypes.ENUM('free', 'basic', 'premium', 'pro'),
      defaultValue: 'free',
    },

    // Prix payé (historique de paiement)
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Quand l'abonnement a commencé
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Quand l'abonnement expire
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // L'abonnement est-il encore valide ?
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    // Référence du paiement (Stripe, PayPal, CinetPay...)
    // Utile pour tracer les transactions
    payment_ref: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Subscription;
