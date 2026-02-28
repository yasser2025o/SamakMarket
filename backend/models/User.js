// =============================================================
// models/User.js
// Modèle Sequelize pour la table "users"
// =============================================================
// Un "modèle" en Sequelize = la représentation d'une table MySQL
// en JavaScript. Chaque colonne de la table devient une propriété.
//
// Ce fichier gère :
// - La définition des colonnes de la table users
// - Le hashage automatique du mot de passe avant sauvegarde
// - Des méthodes utilitaires (vérifier mdp, cacher mdp)
// =============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs'); // Pour hasher les mots de passe

// =============================================================
// Définition du modèle User
// sequelize.define('NomDuModèle', { colonnes }, { options })
// =============================================================
const User = sequelize.define(
  'User', // Nom du modèle (Sequelize cherchera la table "users" automatiquement)
  {
    // --- Colonne : id ---
    // Clé primaire auto-incrémentée (1, 2, 3, ...)
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // --- Colonne : name ---
    name: {
      type: DataTypes.STRING(100), // VARCHAR(100) en SQL
      allowNull: false,            // Champ obligatoire
      validate: {
        notEmpty: { msg: 'Le nom ne peut pas être vide' },
        len: { args: [2, 100], msg: 'Le nom doit faire entre 2 et 100 caractères' },
      },
    },

    // --- Colonne : email ---
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { msg: 'Cet email est déjà utilisé par un autre compte' },
      validate: {
        isEmail: { msg: 'Format d\'email invalide (ex: user@exemple.com)' },
      },
    },

    // --- Colonne : password ---
    // IMPORTANT : on ne stocke JAMAIS le mot de passe en clair !
    // bcrypt transforme "monmdp123" → "$2b$10$Xk9mN..." (irréversible)
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // --- Colonne : phone ---
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true, // Optionnel
    },

    // --- Colonne : whatsapp ---
    // Peut être différent du téléphone principal
    whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    // --- Colonne : role ---
    // ENUM = valeur parmi une liste fixe
    role: {
      type: DataTypes.ENUM('admin', 'seller', 'buyer'),
      defaultValue: 'buyer', // Par défaut, les nouveaux sont acheteurs
    },

    // --- Colonne : avatar ---
    // URL vers la photo de profil
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // --- Colonne : city ---
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // --- Colonne : is_active ---
    // Permet à l'admin de désactiver un compte sans le supprimer
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    // --- Options du modèle ---
    tableName: 'users',    // Nom exact de la table MySQL
    timestamps: true,      // Ajoute automatiquement createdAt et updatedAt
    underscored: true,     // Utilise snake_case en DB (created_at, not createdAt)

    // ==========================================================
    // HOOKS = fonctions appelées automatiquement avant/après
    // certaines opérations (create, update, delete...)
    // ==========================================================
    hooks: {
      // Avant de créer un utilisateur → hasher le mot de passe
      beforeCreate: async (user) => {
        console.log('🔐 Hashage du mot de passe en cours...');
        // bcrypt.hash(motDePasse, saltRounds)
        // saltRounds=10 = niveau de sécurité (+ haut = + lent mais + sécurisé)
        user.password = await bcrypt.hash(user.password, 10);
      },

      // Avant de modifier un utilisateur → re-hasher si le mdp a changé
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          console.log('🔐 Nouveau mot de passe détecté, hashage...');
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// =============================================================
// MÉTHODES D'INSTANCE
// Fonctions disponibles sur chaque objet User
// =============================================================

// Vérifier si un mot de passe correspond au hash stocké
// Utilisation : const ok = await user.checkPassword("monmdp")
User.prototype.checkPassword = async function (motDePasseEnClair) {
  // bcrypt.compare() retourne true si le mdp correspond, false sinon
  return bcrypt.compare(motDePasseEnClair, this.password);
};

// Retourner l'utilisateur SANS le champ password (pour la sécurité)
// On ne renvoie jamais le mot de passe dans les réponses API !
User.prototype.toSafeObject = function () {
  const donnees = this.toJSON();     // Convertir en objet JS simple
  delete donnees.password;           // Supprimer le mot de passe
  return donnees;                    // Retourner le reste
};

module.exports = User;
