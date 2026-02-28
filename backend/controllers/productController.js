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
const { Op } = require('sequelize');

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
exports.getAllProducts = async (req, res) => {
  try {
    // Récupérer les paramètres de l'URL
    // Si non fournis, on utilise des valeurs par défaut
    const {
      search,
      city,
      category,
      page = 1,
      limit = 12,
    } = req.query;

    // Construire les conditions de filtrage dynamiquement
    // On part d'une base : seulement les produits disponibles
    const conditions = { is_available: true };

    // Ajouter les filtres si fournis
    if (search) {
      // Op.like + % = recherche partielle (LIKE '%sardine%')
      // Trouve "Sardine fraîche", "Ma sardine", "Sardines grillées"...
      conditions.name = { [Op.like]: `%${search}%` };
    }
    if (city) {
      conditions.city = { [Op.like]: `%${city}%` };
    }
    if (category) {
      conditions.category = category; // Recherche exacte pour la catégorie
    }

    // Calculer l'offset pour la pagination
    // Page 1 : offset 0 (cocd e au début)
    // Page 2 : offset 12 (saute les 12 premiers)
    // Page 3 : offset 24, etc.
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Requête principale avec Sequelize
    const { count, rows: produits } = await Product.findAndCountAll({
      where: conditions,

      // "include" = JOIN en SQL
      // On charge aussi le vendeur de chaque produit en une seule requête
      include: [
        {
          model: User,
          as: 'seller',      // Alias défini dans models/index.js
          attributes: [      // Colonnes à récupérer du vendeur
            'id',
            'name',
            'phone',
            'whatsapp',
            'city',
            'avatar',
          ],
        },
      ],

      // Tri : produits sponsorisés en premier, puis du plus récent au plus ancien
      order: [
        ['is_featured', 'DESC'], // DESC = les "true" avant les "false"
        ['created_at', 'DESC'],
      ],

      limit: parseInt(limit),  // Nombre de résultats par page
      offset,                  // Décalage pour la pagination
    });

    // Retourner les produits avec infos de pagination
    res.json({
      produits,
      pagination: {
        total: count,                            // Nombre total de produits
        page: parseInt(page),                   // Page actuelle
        pages: Math.ceil(count / parseInt(limit)), // Nombre total de pages
        limit: parseInt(limit),                 // Produits par page
      },
    });

  } catch (erreur) {
    console.error('❌ Erreur getAllProducts :', erreur);
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
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
exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, price, unit,
      quantity, category, images, city,
    } = req.body;

    // Validation : le nom et le prix sont obligatoires
    if (!name || !price) {
      return res.status(400).json({
        message: 'Le nom et le prix sont obligatoires',
      });
    }

    // Créer le produit
    // seller_id = l'ID du vendeur connecté (depuis le token JWT)
    const produit = await Product.create({
      seller_id: req.user.id, // ← Automatique grâce au middleware auth
      name,
      description,
      price,
      unit,
      quantity,
      category,
      images: images || [],
      city,
    });

    res.status(201).json({
      message: 'Produit publié avec succès ! 🎉',
      produit,
    });

  } catch (erreur) {
    console.error('❌ Erreur createProduct :', erreur);
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
  }
};

// =============================================================
// PUT /api/products/:id
// Modifier un produit existant
// Route protégée → seulement le propriétaire peut modifier
// =============================================================
exports.updateProduct = async (req, res) => {
  try {
    // Chercher le produit qui appartient À CE vendeur uniquement
    // Si quelqu'un d'autre essaie de modifier → il ne trouvera pas le produit
    const produit = await Product.findOne({
      where: {
        id: req.params.id,
        seller_id: req.user.id, // Sécurité : vérifier la propriété
      },
    });

    if (!produit) {
      return res.status(404).json({
        message: 'Produit non trouvé ou vous n\'êtes pas le propriétaire',
      });
    }

    // Mettre à jour avec les nouvelles données
    // update() ne modifie que les champs fournis dans req.body
    await produit.update(req.body);

    res.json({
      message: 'Produit mis à jour avec succès !',
      produit,
    });

  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
  }
};

// =============================================================
// DELETE /api/products/:id
// Supprimer un produit
// Route protégée → seulement le propriétaire peut supprimer
// =============================================================
exports.deleteProduct = async (req, res) => {
  try {
    const produit = await Product.findOne({
      where: {
        id: req.params.id,
        seller_id: req.user.id,
      },
    });

    if (!produit) {
      return res.status(404).json({
        message: 'Produit non trouvé ou accès refusé',
      });
    }

    await produit.destroy(); // Supprime définitivement de la DB

    res.json({ message: 'Produit supprimé avec succès' });

  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
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
