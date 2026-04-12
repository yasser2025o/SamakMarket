/**
 * backend/routes/wa-orders.js
 * Routes API pour gestion commandes WhatsApp
 *
 * Dans server.js ajouter:
 *   app.use('/api/admin/wa-orders', require('./routes/wa-orders'))
 */

const express = require('express')
const router  = express.Router()
const { auth, isAdmin } = require('../middleware/auth')
const { sequelize }     = require('../models')
const { Op }            = require('sequelize')

// Numéro agent WhatsApp (ton numéro)
const AGENT_NUMBER = '212647689006'

// ── GET /api/admin/wa-orders ──────────────────────────────────
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      search = '', from = '', to = '',
      status = '', sortBy = 'created_at', sortDir = 'DESC'
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Construction WHERE
    let where = 'WHERE 1=1'
    const params = []

    if (search) {
      where += ' AND (produit LIKE ? OR phone LIKE ? OR livraison LIKE ? OR pays LIKE ?)'
      const s = `%${search}%`
      params.push(s, s, s, s)
    }
    if (from) { where += ' AND created_at >= ?'; params.push(from) }
    if (to)   { where += ' AND created_at <= ?'; params.push(to)   }
    if (status) { where += ' AND status = ?';    params.push(status) }

    // Colonnes autorisées pour tri
    const safeCols = ['created_at','produit','total','quantite','pays','status']
    const col = safeCols.includes(sortBy) ? sortBy : 'created_at'
    const dir = sortDir === 'ASC' ? 'ASC' : 'DESC'

    const [[{ total }]] = await sequelize.query(
      `SELECT COUNT(*) as total FROM wa_orders ${where}`, { replacements: params }
    )

    const [commandes] = await sequelize.query(
      `SELECT * FROM wa_orders ${where}
       ORDER BY ${col} ${dir}
       LIMIT ? OFFSET ?`,
      { replacements: [...params, parseInt(limit), offset] }
    )

    res.json({
      commandes,
      total,
      pages: Math.ceil(total / limit),
      page:  parseInt(page),
    })
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur', detail: e.message })
  }
})

// ── PUT /api/admin/wa-orders/:id ──────────────────────────────
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body
    await sequelize.query(
      'UPDATE wa_orders SET status=?, notes=?, updated_at=NOW() WHERE id=?',
      { replacements: [status, notes || null, req.params.id] }
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ message: 'Erreur update', detail: e.message })
  }
})

// ── POST /api/admin/wa-orders/send-wa ────────────────────────
// Envoie via l'agent Baileys (si actif) ou retourne le lien direct
router.post('/send-wa', auth, isAdmin, async (req, res) => {
  try {
    const { numero, message, ids } = req.body

    // Tente d'utiliser l'agent Baileys si disponible
    const agentSock = global.whatsappSock // injecté par whatsapp-agent.js
    if (agentSock) {
      const jid = `${(numero || AGENT_NUMBER).replace(/\D/g,'')}@s.whatsapp.net`
      await agentSock.sendMessage(jid, { text: message })

      // Met à jour statut des commandes envoyées
      if (ids && ids.length > 0) {
        await sequelize.query(
          `UPDATE wa_orders SET status='sent', updated_at=NOW() WHERE id IN (${ids.map(()=>'?').join(',')})`,
          { replacements: ids }
        )
      }
      res.json({ success: true, method: 'agent' })
    } else {
      // Pas d'agent actif → retourne le lien
      const num = (numero || AGENT_NUMBER).replace(/\D/g,'')
      const link = `https://wa.me/${num}?text=${encodeURIComponent(message)}`
      res.json({ success: false, method: 'link', link, message: 'Agent WhatsApp non connecté' })
    }
  } catch (e) {
    res.status(500).json({ message: 'Erreur envoi WA', detail: e.message })
  }
})

module.exports = router
