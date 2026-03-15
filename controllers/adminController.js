// =============================================================
// controllers/adminController.js
// Logique métier du dashboard admin SamakMarket
//
// Utilise Sequelize pour agréger les données MySQL :
//   - fn('COUNT', ...) = compter les lignes
//   - fn('SUM', ...)   = additionner les valeurs
//   - group(...)       = GROUP BY en SQL
//   - order(...)       = ORDER BY en SQL
// =============================================================

const { User, Product } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
 const bcrypt     = require('bcryptjs')
  const nodemailer = require('nodemailer')
  const crypto     = require('crypto')

// =============================================================
// GET /api/admin/stats
// Retourne les KPI globaux pour la page "Vue d'ensemble"
// =============================================================
const getStats = async (req, res) => {
  try {

    // ── 1. Comptes globaux ──────────────────────────────────
    const totalProduits  = await Product.count({ where: { is_available: true } });
    const totalPromos    = await Product.count({ where: { is_promo: true } });
    const totalVendeurs  = await User.count({ where: { role: 'seller' } });
    const vendeursActifs = await User.count({ where: { role: 'seller', is_active: true } });

    // Total des vues sur tous les produits
    const vuesResult = await Product.findOne({
      attributes: [[fn('SUM', col('views_count')), 'total']],
      raw: true,
    });
    const totalVues = parseInt(vuesResult?.total || 0);

    // Produits ajoutés aujourd'hui
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    const produitsAujourdhui = await Product.count({
      where: { created_at: { [Op.gte]: debutJour } },
    });

    // ── 2. Promos par ville ─────────────────────────────────
    // Équivalent SQL :
    //   SELECT city, COUNT(*) as count FROM products
    //   WHERE is_promo = 1 GROUP BY city ORDER BY count DESC
    const promoParVilleRaw = await Product.findAll({
      attributes: [
        'city',
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { is_promo: true },
      group:  ['city'],
      order:  [[literal('count'), 'DESC']],
      raw:    true,
    });
    // Nettoyer : retirer les villes vides
    const promoParVille = promoParVilleRaw
      .filter(v => v.city)
      .map(v => ({ ville: v.city, count: parseInt(v.count) }));

    // ── 3. Top catégories ────────────────────────────────────
    // Équivalent SQL :
    //   SELECT category, COUNT(*) as count FROM products
    //   GROUP BY category ORDER BY count DESC LIMIT 5
    const topCategoriesRaw = await Product.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count'],
      ],
      where:  { is_available: true },
      group:  ['category'],
      order:  [[literal('count'), 'DESC']],
      limit:  5,
      raw:    true,
    });
    const topCategories = topCategoriesRaw
      .filter(c => c.category)
      .map(c => ({ cat: c.category, count: parseInt(c.count) }));

    // ── 4. Vendeurs en promo (top 5) ─────────────────────────
    // Vendeurs qui ont au moins 1 produit en promo actuellement
    const vendeursEnPromoRaw = await Product.findAll({
      attributes: [
        'seller_id',
        [fn('COUNT', col('Product.id')), 'nbPromos'],
      ],
      where:   { is_promo: true },
      include: [{
        model:      User,
        as:         'seller',
        attributes: ['name', 'city'],
      }],
      group:  ['seller_id', 'seller.id'],
      order:  [[literal('nbPromos'), 'DESC']],
      limit:  5,
      raw:    false,
    });
    const vendeursEnPromo = vendeursEnPromoRaw.map(p => ({
      id:       p.seller_id,
      name:     p.seller?.name || '—',
      ville:    p.seller?.city || '—',
      nbPromos: parseInt(p.dataValues.nbPromos),
    }));

    // ── Réponse finale ───────────────────────────────────────
    res.json({
      totalProduits,
      totalPromos,
      totalVendeurs,
      vendeursActifs,
      totalVues,
      produitsAujourdhui,
      promoParVille,
      topCategories,
      vendeursEnPromo,
    });

  } catch (err) {
    console.error('Erreur admin/stats :', err);
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};

// =============================================================
// GET /api/admin/vendeurs
// Liste tous les vendeurs avec leurs statistiques
// =============================================================
// const getVendeurs = async (req, res) => {
//   try {

//     // Récupérer tous les vendeurs
//     const vendeurs = await User.findAll({
//       where:      { role: 'seller' },
//       attributes: ['id', 'name', 'email', 'city', 'is_active', 'created_at'],
//       order:      [['created_at', 'DESC']],
//     });

//     // Pour chaque vendeur, calculer ses stats
//     // (on pourrait faire ça en SQL mais c'est plus lisible ainsi)
//     const vendeursAvecStats = await Promise.all(
//       vendeurs.map(async (v) => {

//         // Nombre de produits actifs
//         const nbProduits = await Product.count({
//           where: { seller_id: v.id, is_available: true },
//         });

//         // Nombre de promos actives
//         const nbPromos = await Product.count({
//           where: { seller_id: v.id, is_promo: true },
//         });

//         // Total des vues sur ses produits
//         const vuesRes = await Product.findOne({
//           attributes: [[fn('SUM', col('views_count')), 'total']],
//           where:      { seller_id: v.id },
//           raw:        true,
//         });
//         const nbVues = parseInt(vuesRes?.total || 0);

//         return {
//           id:        v.id,
//           name:      v.name,
//           email:     v.email,
//           city:      v.city,
//           is_active: v.is_active,
//           nbProduits,
//           nbPromos,
//           nbVues,
//         };
//       })
//     );

//     // Trier par nombre d'articles décroissant
//     vendeursAvecStats.sort((a, b) => b.nbProduits - a.nbProduits);

//     res.json(vendeursAvecStats);

//   } catch (err) {
//     console.error('Erreur admin/vendeurs :', err);
//     res.status(500).json({ message: 'Erreur serveur', detail: err.message });
//   }
// };
const getVendeurs = async (req, res) => {
try {
// UNE SEULE requête avec tout inclus
const vendeurs = await User.findAll({
where: { role: 'seller' },
attributes: [
'id', 'name', 'email', 'city', 'phone',
'whatsapp', 'is_active', 'last_login', 'created_at',
// COUNT produits actifs en SQL directement
[fn('COUNT', col('products.id')), 'nbProduits'],
[fn('SUM', literal('CASE WHEN `products`.`is_promo` = 1 THEN 1 ELSE 0 END')), 'nbPromos'],
[fn('SUM', col('products.views_count')), 'nbVues'],
],
include: [{
model: Product,
as: 'products',
attributes: [], // pas besoin des données produits
required: false,
where: { is_available: true },
}],
group: ['User.id'],
order: [[literal('nbProduits'), 'DESC']],
subQuery: false,
})

const result = vendeurs.map(v => ({
id: v.id,
name: v.name,
email: v.email,
city: v.city,
is_active: v.is_active,
last_login: v.last_login,
nbProduits: parseInt(v.dataValues.nbProduits || 0),
nbPromos: parseInt(v.dataValues.nbPromos || 0),
nbVues: parseInt(v.dataValues.nbVues || 0),
}))

res.json(result)

} catch (err) {
console.error('Erreur admin/vendeurs :', err)
res.status(500).json({ message: 'Erreur serveur', detail: err.message })
}
}
// =============================================================
// GET /api/admin/produits
// Tous les produits avec leur vendeur (pour comparateur prix)
// =============================================================
const getProduits = async (req, res) => {
  try {

    const produits = await Product.findAll({
      where:   { is_available: true },
      attributes: ['id', 'name', 'category', 'price', 'unit', 'city', 'is_promo', 'views_count'],
      include: [{
        model:      User,
        as:         'seller',
        attributes: ['id', 'name', 'city'],  // Seulement ce qu'on a besoin
      }],
      order: [['category', 'ASC'], ['price', 'ASC']],
    });

    // Formater pour le frontend
    const produitsFormats = produits.map(p => ({
      id:         p.id,
      name:       p.name,
      category:   p.category,
      price:      parseFloat(p.price),
      unit:       p.unit,
      city:       p.city || p.seller?.city,
      is_promo:   p.is_promo,
      views_count: p.views_count,
      sellerName: p.seller?.name || '—',
      sellerId:   p.seller?.id,
    }));

    res.json(produitsFormats);

  } catch (err) {
    console.error('Erreur admin/produits :', err);
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
// GET /api/admin/vendeur/:id — infos du vendeur
const getVendeurSession = async (req, res) => {
  try {
    const v = await User.findOne({
      where: { id: req.params.id, role: 'seller' },
      attributes: ['id','name','email','city','phone','whatsapp','is_active','last_login','created_at'],
    })
    if (!v) return res.status(404).json({ message: 'Vendeur introuvable' })
    res.json(v)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', detail: err.message })
  }
}
// GET /api/admin/vendeur/:id/produits — produits du vendeur
const getVendeurProduits = async (req, res) => {
  try {
    const produits = await Product.findAll({
      where: { seller_id: req.params.id },
      order: [['created_at', 'DESC']],
    })
    res.json(produits)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', detail: err.message })
  }
}
// =============================================================
// backend/controllers/adminController.js
// Ajoute cette fonction à la fin, avant module.exports
// =============================================================

// const bcrypt       = require('bcryptjs')
// const nodemailer   = require('nodemailer')
// const crypto       = require('crypto') // inclus dans Node.js, pas besoin d'installer

// =============================================================
// POST /api/admin/reset-password/:id
// Génère un mot de passe temporaire et l'envoie par email
// =============================================================
const resetPassword = async (req, res) => {
   console.log('🔐 Reset password appelé pour vendeur ID:', req.params.id)
  console.log('📧 MAIL_USER:', process.env.MAIL_USER)
  console.log('🔑 MAIL_PASS défini:', !!process.env.MAIL_PASS)
  try {
    const vendeur = await User.findOne({
      where: { id: req.params.id, role: 'seller' },
    })

    if (!vendeur) {
      return res.status(404).json({ message: 'Vendeur introuvable' })
    }

    // ── 1. Générer un mot de passe temporaire lisible ──────
    // Format : Samak + 6 chiffres aléatoires ex: Samak482917
    // const mdpTemp = 'Samak' + crypto.randomInt(100000, 999999)
    const mdpTemp = 'Sam' + crypto.randomInt(1000, 9999) + 'ak'
console.log('🔑 Mot de passe temporaire généré:', mdpTemp)  // ← ajoute ça
    // ── 2. Hasher et sauvegarder en base ──────────────────
    // const hash = await bcrypt.hash(mdpTemp, 12)
    // await vendeur.update({ password: hash })
//await vendeur.update({ password: mdpTemp })
// vendeur.password = mdpTemp
// await vendeur.save({ hooks: false })  // ← bypass tous les hooks
// ── APRÈS — SQL brut, bypass Sequelize et tous ses hooks ─
const sequelize = require('../config/database')
const hash = await bcrypt.hash(mdpTemp, 12) 
await sequelize.query(
  'UPDATE users SET password = ? WHERE id = ?',
  { replacements: [hash, vendeur.id] }
)
const verify = await bcrypt.compare(mdpTemp, hash)
console.log('🔐 Vérification hash:', verify) // doit être true
    // ── 3. Configurer le transporteur email ───────────────
    // Utilise Gmail — change les variables dans .env
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // ou 'outlook', 'yahoo', ou config SMTP custom
      auth: {
        user: process.env.MAIL_USER, // Ton adresse Gmail dans .env
        pass: process.env.MAIL_PASS, // Mot de passe d'application Gmail
      },
    })

    // ── 4. Envoyer l'email ─────────────────────────────────
    await transporter.sendMail({
      from:    `"SamakMarket Admin" <${process.env.MAIL_USER}>`,
      to:      vendeur.email,
      subject: '🔐 Réinitialisation de votre mot de passe — SamakMarket',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"></head>
        <body style="
          margin:0; padding:0; background:#f0f4f8;
          font-family: 'Segoe UI', Arial, sans-serif;
        ">
          <div style="max-width:560px; margin:40px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.1);">

            <!-- Header bleu marine -->
            <div style="background:linear-gradient(135deg,#020e23,#1e3a5f); padding:32px 28px; text-align:center;">
              <div style="font-size:2.5rem; margin-bottom:8px;">🐟</div>
              <h1 style="color:white; font-size:1.3rem; font-weight:900; margin:0;">SamakMarket</h1>
              <p style="color:rgba(255,255,255,.4); font-size:.8rem; margin:4px 0 0;">Marché de poisson frais — Maroc</p>
            </div>

            <!-- Contenu -->
            <div style="padding:32px 28px;">
              <h2 style="color:#1e3a5f; font-size:1.1rem; margin:0 0 12px;">
                Bonjour ${vendeur.name} 👋
              </h2>
              <p style="color:#374151; line-height:1.7; margin:0 0 24px;">
                L'administrateur SamakMarket a réinitialisé votre mot de passe.
                Voici votre nouveau mot de passe temporaire :
              </p>

              <!-- Mot de passe encadré -->
              <div style="
                background:#f0f4f8; border:2px dashed #93c5fd;
                border-radius:12px; padding:20px; text-align:center; margin-bottom:24px;
              ">
                <p style="color:#6b7280; font-size:.78rem; margin:0 0 8px; text-transform:uppercase; letter-spacing:.08em;">
                  Mot de passe temporaire
                </p>
                <p style="
                  color:#1e3a5f; font-size:1.8rem; font-weight:900;
                  letter-spacing:.15em; margin:0; font-family:monospace;
                ">${mdpTemp}</p>
              </div>

              <!-- Avertissement -->
              <div style="
                background:#fffbeb; border-left:4px solid #f59e0b;
                border-radius:0 8px 8px 0; padding:14px 16px; margin-bottom:24px;
              ">
                <p style="color:#92400e; font-size:.82rem; margin:0; line-height:1.6;">
                  ⚠️ <strong>Important :</strong> Connectez-vous avec ce mot de passe
                  puis changez-le immédiatement dans vos paramètres.
                </p>
              </div>

              <!-- Bouton connexion -->
              <div style="text-align:center; margin-bottom:28px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
                  style="
                    display:inline-block; background:linear-gradient(135deg,#1e3a5f,#1d4ed8);
                    color:white; text-decoration:none; padding:13px 32px;
                    border-radius:10px; font-weight:800; font-size:.9rem;
                    box-shadow:0 4px 14px rgba(29,78,216,.3);
                  ">
                  Se connecter →
                </a>
              </div>

              <hr style="border:none; border-top:1px solid #e5e7eb; margin:0 0 20px;">
              <p style="color:#9ca3af; font-size:.72rem; line-height:1.6; margin:0;">
                Si vous n'avez pas demandé cette réinitialisation, contactez-nous immédiatement
                en répondant à cet email. Ce message a été envoyé par l'administration SamakMarket.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    })

    res.json({ message: `Mot de passe réinitialisé et envoyé à ${vendeur.email}` })

  } catch (erreur) {
    console.error('❌ Erreur reset password:', erreur)
    
    // Erreur spécifique email
    if (erreur.code === 'EAUTH') {
      return res.status(500).json({ 
        message: 'Erreur d\'authentification email — vérifiez MAIL_USER et MAIL_PASS dans .env' 
      })
    }
    res.status(500).json({ message: 'Erreur lors de la réinitialisation', detail: erreur.message })
  }
}
module.exports = { 
  getStats, 
  getVendeurs, 
  getProduits, 
  getVendeurSession, 
  getVendeurProduits,
  resetPassword,
}

