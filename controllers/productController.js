// =============================================================
// controllers/productController.js
// CRUD complet pour les produits de la marketplace
// =============================================================
// CRUD = Create, Read, Update, Delete
// C'est les 4 opérations de base sur une ressource.
//
// Routes gérées par ce controller :
//   GET    /api/products         → Lister tous les produits (public)
//   GET    /api/products/mine    → Mes produits (vendeur connecté)
//   GET    /api/products/:id     → Un produit spécifique (public)
//   POST   /api/products         → Créer un produit (vendeur)
//   PUT    /api/products/:id     → Modifier un produit (vendeur propriétaire)
//   DELETE /api/products/:id     → Supprimer un produit (vendeur propriétaire)
// =============================================================

const { Product, User } = require('../models');

// Op = "Operators" de Sequelize, pour faire des conditions SQL avancées
// Exemple : Op.like → LIKE en SQL (recherche partielle)
const { Op, where } = require('sequelize');

// =============================================================
// GET /api/products
// Lister tous les produits avec filtres et pagination
// =============================================================
// Paramètres URL optionnels (query params) :
//   ?search=sardine    → filtre par nom
//   ?city=Tanger       → filtre par ville
//   ?category=Thon     → filtre par catégorie
//   ?page=1&limit=12   → pagination
// =============================================================
// exports.getAllProducts = async (req, res) => {
//   try {
//     // Récupérer les paramètres de l'URL
//     // Si non fournis, on utilise des valeurs par défaut
//     const {
// search,
// city,
// category,
// seller_id,
// today, // ← ajoute cette ligne
// page = 1,
// sort,
// limit = 12,
// } = req.query;;

//     // Construire les conditions de filtrage dynamiquement
//     // On part d'une base : seulement les produits disponibles
//     const conditions = { is_available: true };

//     // Ajouter les filtres si fournis
//     if (search) {
//       // Op.like + % = recherche partielle (LIKE '%sardine%')
//       // Trouve "Sardine fraîche", "Ma sardine", "Sardines grillées"...
//       conditions.name = { [Op.like]: `%${search}%` };
//     }
//     if (city) {
//       conditions.city = { [Op.like]: `%${city}%` };
//     }
//     if (seller_id) {
//       conditions.seller_id = parseInt(seller_id);
//     }
//     if (category) {
//       conditions.category = category; // Recherche exacte pour la catégorie
//     }
//     if (today === 'true') {
//       const debutJour = new Date()
//       debutJour.setHours(0, 0, 0, 0)
//       conditions.created_at = { [Op.gte]: debutJour }
//     }
    

//     // Calculer l'offset pour la pagination
//     // Page 1 : offset 0 (cocd e au début)
//     // Page 2 : offset 12 (saute les 12 premiers)
//     // Page 3 : offset 24, etc.
//     const offset = (parseInt(page) - 1) * parseInt(limit);

//     // Requête principale avec Sequelize
//     const { count, rows: produits } = await Product.findAndCountAll({
//       where: conditions,

//       // "include" = JOIN en SQL
//       // On charge aussi le vendeur de chaque produit en une seule requête
//       include: [
//         {
//           model: User,
//           as: 'seller',      // Alias défini dans models/index.js
//           attributes: [      // Colonnes à récupérer du vendeur
//             'id',
//             'name',
//             'phone',
//             'whatsapp',
//             'city',
//             'avatar',
//           ],
//         },
//       ],

//       // Tri : produits sponsorisés en premier, puis du plus récent au plus ancien
//       order: [
//         ['is_featured', 'DESC'], // DESC = les "true" avant les "false"
//         ['created_at', 'DESC'],
//       ],

//       limit: parseInt(limit),  // Nombre de résultats par page
//       offset,                  // Décalage pour la pagination
//     });

//     // Retourner les produits avec infos de pagination
//     res.json({
//       produits,
//       pagination: {
//         total: count,                            // Nombre total de produits
//         page: parseInt(page),                   // Page actuelle
//         pages: Math.ceil(count / parseInt(limit)), // Nombre total de pages
//         limit: parseInt(limit),                 // Produits par page
//         order: [sort === 'updated_at'? 'updated_at' : 'created_at', 'DESC']
//       },
//     });

//   } catch (erreur) {
//     console.error('❌ Erreur getAllProducts :', erreur);
//     res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
//   }
// };
exports.getAllProducts = async (req, res) => {
  try {
    const {
      search,
      city,
      category,
      seller_id,
      today,
      page = 1,
      limit = 12,
    } = req.query; // ✅ Nettoyé : une seule déclaration propre

    const conditions = { is_available: true };

    if (search) conditions.name = { [Op.like]: `%${search}%` };
    if (city) conditions.city = { [Op.like]: `%${city}%` };
    if (seller_id) conditions.seller_id = parseInt(seller_id);
    if (category) conditions.category = category;

    if (today === 'true') {
      const debutJour = new Date();
      debutJour.setHours(0, 0, 0, 0);
      conditions.createdAt = { [Op.gte]: debutJour }; // ✅ Vérifie que c'est bien createdAt (majuscule)
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: produits } = await Product.findAndCountAll({
      where: conditions,
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'city', 'avatar'],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true // ✅ Ajoute ceci pour éviter les erreurs de count avec include
    });

    res.json({ produits, total: count });
  } catch (erreur) {
    console.error('❌ Erreur détaillée :', erreur); // Regarde ton terminal backend pour voir le message exact
    res.status(500).json({ message: 'Erreur SQL', detail: erreur.message });
  }
};
// =============================================================
// GET /api/products/mine
// Récupérer MES produits (pour le dashboard vendeur)
// Route protégée → nécessite d'être connecté et vendeur
// =============================================================
exports.getMyProducts = async (req, res) => {
  try {
    // req.user.id est disponible grâce au middleware auth
    const mesProduits = await Product.findAll({
      where: { seller_id: req.user.id },
      order: [['created_at', 'DESC']], // Du plus récent au plus ancien
    });

    res.json({ produits: mesProduits });

  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
  }
};

// =============================================================
// GET /api/products/:id
// Récupérer UN produit par son identifiant
// =============================================================
exports.getProduct = async (req, res) => {
  try {
    // req.params.id = la valeur dans l'URL (ex: /api/products/5 → id = 5)
    const produit = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'whatsapp', 'city', 'avatar'],
        },
      ],
    });

    // Si le produit n'existe pas → erreur 404
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    const nbProduits = produit.seller_id
    ? await Product.count({ where: {seller_id: produit.seller_id, is_available:true} })
    : 0;
    // Incrémenter le compteur de vues à chaque consultation
    // increment() fait un UPDATE products SET views_count = views_count + 1
    await produit.increment('views_count');

    res.json({ produit });

  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
  }
};

// =============================================================
// POST /api/products
// Créer un nouveau produit
// Route protégée → nécessite d'être vendeur
// =============================================================
//const { Product } = require('../models');

// --- CRÉATION ---
exports.createProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    // Si Multer a reçu un fichier
    if (req.file) {
      data.images = JSON.stringify([req.file.filename]);
    }

    const produit = await Product.create({
      ...data,
      seller_id: req.user.id
    });

    res.status(201).json(produit);
  } catch (erreur) {
    console.error("Erreur création :", erreur);
    res.status(500).json({ message: erreur.message });
  }
};

// --- MODIFICATION ---
exports.updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    // Si on change la photo lors de la modification
    if (req.file) {
      data.images = JSON.stringify([req.file.filename]);
    }

    const [updated] = await Product.update(data, {
      where: { 
        id: req.params.id, 
        seller_id: req.user.id 
      }
    });

    if (!updated) return res.status(404).json({ message: "Produit non trouvé" });
    
    res.json({ message: "Produit mis à jour ! 🎉" });
  } catch (err) {
    console.error("Erreur modification :", err);
    res.status(500).json({ error: err.message });
  }
};

// --- SUPPRESSION ---
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id, seller_id: req.user.id }
    });
    if (!deleted) return res.status(404).json({ message: "Produit non trouvé" });
    res.json({ message: "Supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getCountByCity = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ['city', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['city']
    });
    const counts = {};
    products.forEach(p => { counts[p.city] = p.get('count'); });
    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// =============================================================
// GET /api/products/promos
// Récuperer uniquement les produits en promotion (is_promo = 1)
// Route publique — pas besoin d'être connecté
// =============================================================
exports.getPromos = async (req, res) => {
  try {
    const produits = await Product.findAll({
      where: {
        is_promo:     true,   // Filtre principal : uniquement les promos
        is_available: true,   // Seulement les produits encore disponibles
      },
      include: [
        {
          model: User,
          as:    'seller',
          // On inclut whatsapp et phone pour les boutons de contact
          attributes: ['id', 'name', 'phone', 'whatsapp', 'city'],
        },
      ],
      order: [['created_at', 'DESC']], // Les plus récentes en premier
    });

    res.json({ produits });

  } catch (erreur) {
    console.error('Erreur getPromos :', erreur);
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
  }
};

// =============================================================
// GET /api/products/count-by-city
// Retourne le nombre de produits disponibles par ville
// Ex: { "Tanger": 12, "Casablanca": 5, "Agadir": 3 }
// ✅ FIX : sequelize importé depuis ../models (pas depuis le package)
// =============================================================
exports.getCountByCity = async (req, res) => {
  try {
    const { sequelize } = require('../models')

    const rows = await Product.findAll({
      where: { is_available: true },
      attributes: [
        'city',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group:  ['city'],
      order:  [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    })

    // { Tanger: 12, Casablanca: 5, ... }
    const counts = {}
    rows.forEach(r => {
      if (r.city) counts[r.city] = parseInt(r.get('count'))
    })

    res.json(counts)
  } catch (err) {
    console.error('❌ getCountByCity :', err.message)
    res.status(500).json({ error: err.message })
  }
}
