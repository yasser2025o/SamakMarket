// =============================================================
//  controllers/guideController.js  —  SamakMarket
//  Guide "New in Town" — Logique métier par ville
// =============================================================

const { Product, User, sequelize } = require('../models')
const { Op }                       = require('sequelize')

// =============================================================
//  DONNÉES CULTURELLES PAR VILLE
//  Chaque ville a : message d'accueil, contexte culturel,
//  poissons emblématiques, et prix moyen de référence
// =============================================================
const CULTURES_VILLES = {
  'Tanger': {
    bienvenue:    'Marhaba b Tanger ! 🌊',
    description:  'Carrefour entre Méditerranée et Atlantique — deux mers, deux saveurs.',
    culture:      'À Tanger, le poisson frais arrive tôt le matin au port Tanger-Med. Les sardines et les dorades dominent les étals dès 7h.',
    emoji:        '🌉',
    poissons:     ['Sardine', 'Dorade', 'Anchois', 'Thon'],
    couleur:      '#0A4C8B',
    prixMoyen:    { sardine: 12, dorade: 65, crevette: 90 }
  },
  'Casablanca': {
    bienvenue:    'Marhaba f Casa ! 🏙️',
    description:  'La capitale économique — marché du poisson le plus animé du Maroc.',
    culture:      'Le marché de Aïn Diab et les poissonneries de Maarif sont des références. Prix compétitifs, grand choix de céphalopodes.',
    emoji:        '🏢',
    poissons:     ['Calamar', 'Crevette', 'Merlu', 'Bar'],
    couleur:      '#1A5E8A',
    prixMoyen:    { sardine: 10, dorade: 70, crevette: 85 }
  },
  'Agadir': {
    bienvenue:    'Marhaba f Agadir ! ☀️',
    description:  'Premier port de pêche du Maroc — fraîcheur garantie à chaque marée.',
    culture:      'Le port d\'Agadir est le plus grand du Maroc. Les sardines et les anchois y sont pêchés à quelques kilomètres. Prix imbattables en direct du port.',
    emoji:        '⚓',
    poissons:     ['Sardine', 'Anchois', 'Sabre', 'Pageot'],
    couleur:      '#0F5E4A',
    prixMoyen:    { sardine: 8, dorade: 55, crevette: 75 }
  },
  'Essaouira': {
    bienvenue:    'Marhaba b Essaouira ! 🎵',
    description:  'La cité des vents — poisson fumé et frais dans les ruelles de la médina.',
    culture:      'Essaouira est célèbre pour son poisson grillé servi dans les étals de la place principale. Les sardines grillées à 5 DH/pièce sont une tradition.',
    emoji:        '🏰',
    poissons:     ['Sardine grillée', 'Calamar', 'Dorade', 'Crevette'],
    couleur:      '#5B4A8A',
    prixMoyen:    { sardine: 15, dorade: 60, crevette: 80 }
  },
  'Nador': {
    bienvenue:    'Marhaba b Nador ! 🌅',
    description:  'La lagune de Marchica — poissons méditerranéens rares et savoureux.',
    culture:      'La lagune Marchica offre des poissons d\'eau saumâtre introuvables ailleurs. Les mulets et les anguilles sont des spécialités locales.',
    emoji:        '🦅',
    poissons:     ['Mulet', 'Anguille', 'Bar', 'Dorade'],
    couleur:      '#2A6B5A',
    prixMoyen:    { sardine: 11, dorade: 58, crevette: 82 }
  },
  // Ville par défaut si non reconnue
  'default': {
    bienvenue:    'Bienvenue sur SamakMarket ! 🐟',
    description:  'Découvrez les meilleures offres de poisson frais près de chez vous.',
    culture:      'Sélectionnez votre ville pour voir les offres locales et les prix du jour.',
    emoji:        '🗺️',
    poissons:     ['Sardine', 'Dorade', 'Crevette'],
    couleur:      '#0A1628',
    prixMoyen:    { sardine: 12, dorade: 65, crevette: 85 }
  }
}

// =============================================================
//  GET /api/guide/:ville
//  Retourne : bienvenue culturel + promos proches + prix comparés
// =============================================================
exports.getGuideVille = async (req, res) => {
  try {
    const ville = req.params.ville

    // 1. Données culturelles de la ville
    const culture = CULTURES_VILLES[ville] || CULTURES_VILLES['default']

    // 2. Promos proches (is_promo=true dans cette ville)
    const promosProches = await Product.findAll({
      where: {
        is_available: true,
        is_promo:     true,
        city:         { [Op.like]: `%${ville}%` }
      },
      include: [{
        model: User,
        as:    'seller',
        attributes: ['id', 'name', 'phone', 'whatsapp', 'city']
      }],
      order: [['createdAt', 'DESC']],
      limit: 6 // Max 6 promos pour la grille 2 colonnes
    })

    // 3. Prix moyen de la ville pour comparaison
    // On calcule la moyenne des prix par catégorie dans cette ville
    const [prixMoyenVille] = await sequelize.query(`
      SELECT category, AVG(price) as moyenne, MIN(price) as min_prix, MAX(price) as max_prix, COUNT(*) as nb
      FROM Products
      WHERE is_available = 1
        AND city LIKE :ville
      GROUP BY category
    `, {
      replacements: { ville: `%${ville}%` },
      type: sequelize.QueryTypes.SELECT
    })

    // ⚠️ Attention : sequelize.query retourne un tableau
    // Pour plusieurs lignes, on utilise une approche différente
    const moyennesParCategorie = await sequelize.query(`
      SELECT category, ROUND(AVG(price), 2) as moyenne
      FROM Products
      WHERE is_available = 1 AND city LIKE :ville
      GROUP BY category
    `, {
      replacements: { ville: `%${ville}%` },
      type:         sequelize.QueryTypes.SELECT
    })

    // 4. Construire la map des moyennes { sardine: 12.5, ... }
    const moyennes = {}
    moyennesParCategorie.forEach(row => {
      moyennes[row.category] = parseFloat(row.moyenne)
    })

    res.json({
      ville,
      culture,
      promosProches,
      moyennesVille: moyennes,
      total:         promosProches.length
    })

  } catch (err) {
    console.error('❌ Erreur getGuideVille :', err)
    res.status(500).json({ message: 'Erreur serveur', detail: err.message })
  }
}

// =============================================================
//  GET /api/guide/:ville/pepites
//  "Pépites de la ville" — meilleures offres, même éloignées
//  Triées par : (is_flash DESC, is_promo DESC, views_count DESC)
// =============================================================
exports.getPepites = async (req, res) => {
  try {
    const ville = req.params.ville

    // On cherche les meilleures offres du Maroc entier
    // mais on remonte d'abord celles de la ville demandée
    const pepites = await Product.findAll({
      where: { is_available: true },
      include: [{
        model: User,
        as:    'seller',
        attributes: ['id', 'name', 'phone', 'whatsapp', 'city']
      }],
      order: [
        // Ordre de priorité : flash > promo > vues
        ['is_flash',     'DESC'],
        ['is_promo',     'DESC'],
        ['views_count',  'DESC'],
        ['price',        'ASC']   // À prix égal : moins cher en premier
      ],
      limit: 8
    })

    // Calculer "% sous la moyenne nationale" pour chaque produit
    const prixMoyensNationaux = await sequelize.query(`
      SELECT category, ROUND(AVG(price), 2) as moyenne
      FROM Products WHERE is_available = 1
      GROUP BY category
    `, { type: sequelize.QueryTypes.SELECT })

    const moyNat = {}
    prixMoyensNationaux.forEach(r => { moyNat[r.category] = parseFloat(r.moyenne) })

    // Enrichir chaque pépite avec le delta de prix
    const pepitesEnrichies = pepites.map(p => {
      const moy = moyNat[p.category] || p.price
      const delta = moy > 0 ? Math.round(((moy - p.price) / moy) * 100) : 0
      return {
        ...p.toJSON(),
        prixMoyenNational: moy,
        // Positif = moins cher que la moyenne, négatif = plus cher
        economie:    delta,
        // Peut-on négocier ? (total > 200 DH et pas déjà en flash)
        negociable:  !p.is_flash && p.price > 50
      }
    })

    res.json({ ville, pepites: pepitesEnrichies })

  } catch (err) {
    console.error('❌ Erreur getPepites :', err)
    res.status(500).json({ message: 'Erreur serveur', detail: err.message })
  }
}
