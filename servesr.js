// =============================================================
// server.js
// Point d'entrée principal de l'application SamakMarket Backend
// =============================================================
// Ce fichier est le "chef d'orchestre" :
// 1. Charge la configuration (.env)
// 2. Crée l'application Express
// 3. Configure les middlewares globaux
// 4. Branche les routes
// 5. Synchronise la base de données
// 6. Démarre le serveur sur le port choisi
// =============================================================

// Charger les variables d'environnement depuis le fichier .env
// DOIT être en premier, avant tout autre import
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// Importer sequelize + tous les modèles (avec leurs associations)
const { sequelize } = require('./models');
// Auto-post Facebook — chargé après les models
const { Product } = require('./models')
const { posterSurFacebook, formaterMessageProduit } = require('./routes/facebook')

Product.addHook('afterCreate', async (produit) => {
  try {
    if (!produit.is_available) return
    const { User } = require('./models')
    const vendeur  = await User.findByPk(produit.seller_id, { attributes: ['name', 'city'] })
    const message  = formaterMessageProduit(produit, vendeur)
    const images   = JSON.parse(produit.images || '[]')
    const image_url = images[0] ? `${process.env.BACKEND_URL}/uploads/${images[0]}` : null
    const link = `${process.env.FRONTEND_URL}/products/${produit.id}`
    await posterSurFacebook({ message, image_url, link: image_url ? undefined : link })
    console.log(`✅ Auto-posté sur Facebook: ${produit.name}`)
  } catch (err) {
    console.error('⚠️ Auto-post Facebook échoué:', err.message)
  }
})

// Créer l'application Express
const app = express();

// =============================================================
// MIDDLEWARES GLOBAUX
// Les middlewares s'exécutent sur TOUTES les requêtes
// dans l'ordre où ils sont déclarés
// =============================================================

// CORS = Cross-Origin Resource Sharing
// Autorise le frontend (localhost:5173) à appeler l'API (localhost:3000)
// Sans ça, le navigateur bloquerait les requêtes (sécurité browser)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Autoriser les cookies si nécessaire plus tard
}));

// Parser le corps des requêtes JSON
// Sans ça, req.body serait undefined pour les POST/PUT
app.use(express.json());

// Parser les formulaires HTML classiques (form data)
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés (photos de produits, avatars...)
// Ex: http://localhost:3000/uploads/photo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================================
// ROUTES DE L'API
// Chaque groupe de routes est dans son propre fichier
// =============================================================

// Routes d'authentification → /api/auth/...
app.use('/api/auth', require('./routes/auth'));

// Routes des produits → /api/products/...
app.use('/api/products', require('./routes/products'));

// Routes des publicités → /api/ads/...
app.use('/api/ads', require('./routes/ads'));
app.use('/api/vendeurs', require('./routes/vendeurs'));
 app.use('/api/admin', require('./routes/admin'));
 app.use('/api/vendeurs', require('./routes/vendeurs'))
 app.use('/api/facebook', require('./routes/facebook'))
app.use('/api/instagram',  require('./routes/facebook'))  // ← même fichier, routes /instagram/...
app.use('/api/flash', require('./routes/flash'))
// =============================================================
// À AJOUTER dans backend/server.js
// Proxy /api/chat → n8n webhook
// //=============================================================

// app.post('/api/chat', async (req, res) => {
//   try {
//     const N8N_URL = process.env.N8N_WEBHOOK_URL || 'https://kase-prejudiciable-undistrustfully.ngrok-free.dev/webhook/samakAi'

//     const r = await fetch(N8N_URL, {
//       method:  'POST',
//   //    headers: { 'Content-Type': 'application/json' },
//       body:    JSON.stringify(req.body),
//     })

//     const data = await r.json()
//     res.json(data)

//   } catch (err) {
//     console.error('Proxy n8n erreur:', err.message)
//     res.status(503).json({ message: 'Service indisponible' })
//   }
// })
app.use('/api/admin/wa-orders', require('./routes/wa-orders'))
// =============================================================
// ROUTE DE SANTÉ
// Permet de vérifier rapidement que l'API fonctionne
// Test : ouvre http://localhost:3000/api/health dans le navigateur
// =============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK ✅',
    app: 'SamakMarket API',
    version: '1.0.0',
    heure: new Date().toLocaleString('fr-FR'),
    env: process.env.NODE_ENV,
  });
});
// city from ip
app.get("/api/detect-city", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    res.json({ city: data.city || "ALL" });

  } catch (e) {
    res.json({ city: "ALL" });
  }
});
// Démarre WhatsApp Baileys
//const whatsapp = require('./services/whatsappService')
//whatsapp.init()

// =============================================================
// GESTIONNAIRE DE ROUTES INCONNUES
// Si aucune route ne correspond → erreur 404
// =============================================================
app.use((req, res) => {
  res.status(404).json({
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
    conseil: 'Vérifiez que l\'URL est correcte et que la méthode HTTP est bonne',
  });
});

// =============================================================
// GESTIONNAIRE D'ERREURS GLOBAL
// Attrape toutes les erreurs non gérées dans les controllers
// =============================================================
app.use((err, req, res, next) => {
  console.error('💥 Erreur non gérée :', err);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    detail: process.env.NODE_ENV === 'development' ? err.message : 'Contactez l\'administrateur',
  });
  
});
// Ajoute après app.use(cors(...))
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true')
  next()
});

// =============================================================
// DÉMARRAGE DU SERVEUR
// On attend que la DB soit prête avant d'écouter les requêtes
// =============================================================
const PORT = process.env.PORT || 3000;
require('dotenv').config()
require('./services/fbScheduler')
require('./services/instagramScheduler')

// sequelize.sync() vérifie/crée les tables dans MySQL
// { alter: true } = met à jour les tables existantes si le modèle a changé
// ⚠️ En production, utiliser des "migrations" plutôt que sync()
sequelize
  .sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    console.log('✅ Tables MySQL synchronisées !');

    // Démarrer le serveur uniquement après la sync DB
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ====================================');
      console.log(`🐟  SamakMarket API démarrée !`);
      console.log(`🌐  http://localhost:${PORT}`);
      console.log(`📊  Environnement : ${process.env.NODE_ENV}`);
      console.log('🚀 ====================================');
      console.log('');
      console.log('📋 Endpoints disponibles :');
      console.log(`   GET  http://localhost:${PORT}/api/health`);
      console.log(`   POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   GET  http://localhost:${PORT}/api/products`);
      console.log(`   GET  http://localhost:${PORT}/api/admin`);
    console.log(`   GET  http://localhost:${PORT}/api/vendeurs`);
    console.log(`   GET  http://localhost:${PORT}/api/chat`);
     console.log(`📊  Environnement : ${process.env.N8N_WEBHOOK_URL}`);


      
      console.log('');
    });
   
  })
  .catch((erreur) => {
    console.error('❌ Impossible de synchroniser la base de données :', erreur.message);
    console.error('💡 Vérifie que MySQL est bien démarré et que le fichier .env est correct');
    process.exit(1);
  });
  
