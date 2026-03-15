// =============================================================
// À AJOUTER dans backend/models/Product.js
// Hook afterCreate — auto-post sur Facebook quand produit créé
//
// PLACEMENT : juste avant "module.exports = Product"
// =============================================================

const { posterSurFacebook, formaterMessageProduit } = require('../routes/facebook')
const User = require('./User')

// Auto-post Facebook quand un nouveau produit est créé
Product.addHook('afterCreate', async (produit) => {
  try {
    // Récupère le vendeur
    const vendeur = await User.findByPk(produit.seller_id, {
      attributes: ['name', 'city'],
    })

    // Ne poste que si le produit est disponible
    if (!produit.is_available) return

    const message   = formaterMessageProduit(produit, vendeur)
    const images    = JSON.parse(produit.images || '[]')
    const image_url = images[0]
      ? `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${images[0]}`
      : null
    const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${produit.id}`

    await posterSurFacebook({ message, image_url, link: image_url ? undefined : link })
    console.log(`✅ Produit "${produit.name}" auto-posté sur Facebook`)
  } catch (err) {
    // Ne bloque pas la création du produit si FB échoue
    console.error('⚠️ Auto-post Facebook échoué (non bloquant):', err.message)
  }
})
