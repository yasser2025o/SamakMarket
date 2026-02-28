// =============================================================
// config/database.js
// Configuration de la connexion à MySQL via Sequelize
// =============================================================
// Sequelize est un ORM (Object-Relational Mapper).
// Il fait le pont entre Node.js et MySQL :
// au lieu d'écrire du SQL à la main, on écrit du JavaScript.
//
// Exemple sans Sequelize :
//   "SELECT * FROM products WHERE id = 1"
//
// Exemple avec Sequelize :
//   Product.findByPk(1)
// =============================================================

// On charge les variables du fichier .env dans process.env
const { Sequelize } = require('sequelize');
require('dotenv').config();

// On prépare les valeurs de connexion (trim pour éviter les espaces/retours)
const dbName = (process.env.DB_NAME || '').trim();      // Nom de la base : "samakmarket"
const dbUser = (process.env.DB_USER || '').trim();      // Utilisateur MySQL : "root"
const dbPassword = (process.env.DB_PASSWORD || '');     // Mot de passe MySQL (ne pas logguer)

// Affiche la valeur brute de DB_NAME encodée pour détecter retours à la ligne/espaces invisibles
console.log('🔎 DB_NAME raw:', JSON.stringify(dbName));

// On crée une instance Sequelize avec nos informations de connexion
const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql', // On indique qu'on utilise MySQL (et pas PostgreSQL, SQLite, etc.)

    // logging : affiche les requêtes SQL dans le terminal
    // En développement c'est utile pour débugger
    // En production on désactive pour ne pas polluer les logs
    logging: process.env.NODE_ENV === 'development'
      ? (sql) => console.log(`\n📋 SQL: ${sql}\n`)
      : false,

    // Pool de connexions = Sequelize garde un certain nombre
    // de connexions MySQL ouvertes pour aller plus vite
    pool: {
      max: 10,       // Maximum 10 connexions simultanées
      min: 0,        // Minimum 0 (ferme si pas utilisé)
      acquire: 30000, // Attendre 30s maximum pour avoir une connexion
      idle: 10000,   // Fermer une connexion inactive depuis 10s
    },
  }
);

// =============================================================
// Test de connexion au démarrage
// On vérifie tout de suite si MySQL est bien accessible
// =============================================================
const testerConnexion = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à MySQL réussie !');
  } catch (erreur) {
    console.error('❌ Impossible de se connecter à MySQL :', erreur.message);
    console.error('💡 Vérifie ton fichier .env (DB_HOST, DB_USER, DB_PASSWORD)');
    process.exit(1); // On arrête l'application si pas de DB
  }
};

testerConnexion();

// On exporte sequelize pour l'utiliser dans les modèles
module.exports = sequelize;
