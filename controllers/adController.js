// =============================================================
// controllers/adController.js
// Gestion des publicités payantes
// =============================================================
// Routes :
//   GET  /api/ads                → Pubs actives (public, par position)
//   POST /api/ads                → Soumettre une pub (vendeur)
//   PUT  /api/ads/:id/status     → Valider/rejeter une pub (admin)
//   POST /api/ads/:id/click      → Enregistrer un clic (public)
// =============================================================

const { Ad, User } = require('../models');
const { Op } = require('sequelize');

// =============================================================
// GET /api/ads?position=homepage
// Récupérer les publicités actives pour une position donnée
// =============================================================
exports.getActiveAds = async (req, res) => {
  try {
    const { position } = req.query;
    const maintenant = new Date(); // Heure actuelle

    // Conditions : pub active + dans la période valide
    const conditions = {
      status: 'active',
      starts_at: { [Op.lte]: maintenant }, // Déjà commencée (<=)
      ends_at:   { [Op.gte]: maintenant }, // Pas encore expirée (>=)
    };

    // Filtrer par position si fournie
    if (position) {
      conditions.position = position;
    }

    const pubs = await Ad.findAll({
      where: conditions,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Incrémenter les vues de toutes les pubs retournées
    if (pubs.length > 0) {
      const ids = pubs.map((pub) => pub.id);
      await Ad.increment('views_count', { where: { id: ids } });
    }

    res.json({ pubs });

  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
  }
};

// =============================================================
// POST /api/ads
// Soumettre une demande de publicité (vendeur)
// =============================================================
exports.createAd = async (req, res) => {
  try {
    const { title, image_url, link_url, position, starts_at, ends_at, price_paid } = req.body;

    const pub = await Ad.create({
      seller_id: req.user.id,
      title,
      image_url,
      link_url,
      position,
      starts_at,
      ends_at,
      price_paid,
      status: 'pending', // Toujours "en attente" → admin doit valider
    });

    res.status(201).json({
      message: 'Demande de publicité soumise ! L\'admin va la vérifier sous 24h.',
      pub,
    });

  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
  }
};

// =============================================================
// PUT /api/ads/:id/status
// L'admin change le statut d'une publicité
// =============================================================
exports.updateAdStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const statutsValides = ['active', 'rejected', 'expired'];

    if (!statutsValides.includes(status)) {
      return res.status(400).json({
        message: `Statut invalide. Valeurs acceptées : ${statutsValides.join(', ')}`,
      });
    }

    const pub = await Ad.findByPk(req.params.id);
    if (!pub) {
      return res.status(404).json({ message: 'Publicité non trouvée' });
    }

    await pub.update({ status });

    res.json({
      message: `Publicité ${status === 'active' ? 'approuvée ✅' : 'rejetée ❌'}`,
      pub,
    });

  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', detail: erreur.message });
  }
};

// =============================================================
// POST /api/ads/:id/click
// Enregistrer un clic sur une publicité (statistiques)
// =============================================================
exports.trackClick = async (req, res) => {
  try {
    await Ad.increment('clicks_count', { where: { id: req.params.id } });
    res.json({ message: 'Clic enregistré' });
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
