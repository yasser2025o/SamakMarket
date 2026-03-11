<!-- =============================================================
  views/VendeurSessionView.vue
  Page session vendeur — vue admin
  
  Accessible via : /admin/vendeur/:id
  Affiche : infos vendeur + état actuel produits + prix + promos
  
  INTÉGRATION :
    Dans router/index.js ajouter :
    {
      path: '/admin/vendeur/:id',
      name: 'vendeur-session',
      component: () => import('../views/VendeurSessionView.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    }
============================================================= -->
<template>
  <div class="session-shell">

    <!-- Fond grain -->
    <div class="grain"></div>

    <!-- ── HEADER ── -->
    <header class="session-header">
      <button @click="$router.push('/admin')" class="btn-retour">
        ← Dashboard Admin
      </button>
      <div class="header-centre" v-if="vendeur">
        <div class="vendeur-av-lg">{{ vendeur.name.charAt(0).toUpperCase() }}</div>
        <div>
          <h1 class="vendeur-nom-lg">{{ vendeur.name }}</h1>
          <p class="vendeur-meta">📍 {{ vendeur.city || '—' }} · {{ vendeur.email }}</p>
        </div>
        <!-- Indicateur en ligne -->
        <div :class="['statut-pill', vendeur.is_active ? 'statut-on' : 'statut-off']">
          <span class="statut-dot"></span>
          {{ vendeur.is_active ? 'Actif' : 'Inactif' }}
        </div>
      </div>
      <div class="header-last" v-if="vendeur">
        <div class="last-label">Dernière connexion</div>
        <div class="last-val">{{ formatDate(vendeur.last_login) }}</div>
      </div>
    </header>

    <!-- Chargement -->
    <div v-if="chargement" class="loading-wrap">
      <div class="loading-fish">🐟</div>
      <p class="loading-txt">Chargement de la session...</p>
    </div>

    <div v-else-if="vendeur" class="session-body">

      <!-- ── KPI vendeur ── -->
      <div class="kpi-row">
        <div class="kpi-mini">
          <div class="kpi-mini-val">{{ produits.length }}</div>
          <div class="kpi-mini-label">Produits actifs</div>
        </div>
        <div class="kpi-mini kpi-gold">
          <div class="kpi-mini-val">{{ produits.filter(p => p.is_promo).length }}</div>
          <div class="kpi-mini-label">En promo 🔥</div>
        </div>
        <div class="kpi-mini">
          <div class="kpi-mini-val">{{ totalVues }}</div>
          <div class="kpi-mini-label">Vues totales 👁️</div>
        </div>
        <div class="kpi-mini">
          <div class="kpi-mini-val">{{ prixMoyen }} MAD</div>
          <div class="kpi-mini-label">Prix moyen / kg</div>
        </div>
      </div>

      <!-- ── PRODUITS + PRIX ── -->
      <div class="card">
        <div class="card-head">
          <h2 class="card-titre">🐟 Catalogue actuel — prix en temps réel</h2>
          <span class="card-badge">{{ produits.length }} produits</span>
        </div>

        <!-- Filtres rapides -->
        <div class="filtres">
          <button v-for="f in filtres" :key="f.val"
            @click="filtreActif = f.val"
            :class="['filtre-btn', filtreActif === f.val && 'filtre-on']">
            {{ f.label }}
          </button>
        </div>

        <div class="table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Unité</th>
                <th>Stock</th>
                <th>Vues</th>
                <th>Promo</th>
                <th>Dispo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in produitsFiltres" :key="p.id" class="tbl-row">
                <td>
                  <div class="prod-nom">{{ p.name }}</div>
                  <div class="prod-ville">📍 {{ p.city || vendeur.city }}</div>
                </td>
                <td>
                  <span class="cat-chip">{{ emojiCat(p.category) }} {{ p.category }}</span>
                </td>
                <td>
                  <!-- Prix coloré selon position par rapport à la moyenne -->
                  <span :class="['prix-chip',
                    p.price < prixMoyen * 0.9  ? 'prix-bas'  :
                    p.price > prixMoyen * 1.1  ? 'prix-haut' : 'prix-mid'
                  ]">
                    {{ Number(p.price).toLocaleString('fr-FR') }} MAD
                  </span>
                </td>
                <td class="tbl-grey">{{ p.unit }}</td>
                <td class="tbl-grey">{{ p.quantity ?? '—' }}</td>
                <td class="tbl-grey">{{ p.views_count ?? 0 }}</td>
                <td>
                  <span v-if="p.is_promo" class="badge-fire">🔥 Oui</span>
                  <span v-else class="tbl-non">—</span>
                </td>
                <td>
                  <span :class="p.is_available ? 'badge-dispo' : 'badge-indispo'">
                    {{ p.is_available ? '✓' : '✗' }}
                  </span>
                </td>
              </tr>
              <tr v-if="produitsFiltres.length === 0">
                <td colspan="8" class="tbl-vide">Aucun produit dans ce filtre</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Légende prix -->
        <div class="legende">
          <span><span class="dot-vert"></span>Sous la moyenne (−10%)</span>
          <span><span class="dot-or"></span>Prix moyen</span>
          <span><span class="dot-rouge"></span>Au-dessus (+10%)</span>
          <span class="tbl-grey">Moyenne : <strong class="text-amber-400">{{ prixMoyen }} MAD</strong></span>
        </div>
      </div>

      <!-- ── RÉPARTITION PAR CATÉGORIE ── -->
      <div class="card mt-4">
        <div class="card-head">
          <h2 class="card-titre">📊 Répartition par type de poisson</h2>
        </div>
        <div class="cats-grid">
          <div v-for="c in categoriesStats" :key="c.cat" class="cat-stat">
            <div class="cat-stat-emoji">{{ emojiCat(c.cat) }}</div>
            <div class="cat-stat-nom">{{ c.cat }}</div>
            <div class="cat-stat-nb">{{ c.nb }} article{{ c.nb > 1 ? 's' : '' }}</div>
            <div class="cat-stat-prix">{{ c.prixMoyen }} MAD/kg</div>
            <!-- Barre proportion -->
            <div class="cat-bar-track">
              <div class="cat-bar-fill"
                :style="{ width: (c.nb / produits.length * 100) + '%' }">
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Vendeur introuvable -->
    <div v-else class="loading-wrap">
      <p class="text-white/30">Vendeur introuvable</p>
      <button @click="$router.push('/admin')" class="btn-retour mt-4">← Retour</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route  = useRoute()
const router = useRouter()

const vendeur    = ref(null)
const produits   = ref([])
const chargement = ref(true)

// ── Filtres produits ──────────────────────────────────────────
const filtreActif = ref('tous')
const filtres = [
  { val: 'tous',  label: 'Tous' },
  { val: 'promo', label: '🔥 Promos' },
  { val: 'dispo', label: '✓ Disponibles' },
]
const produitsFiltres = computed(() => {
  if (filtreActif.value === 'promo') return produits.value.filter(p => p.is_promo)
  if (filtreActif.value === 'dispo') return produits.value.filter(p => p.is_available)
  return produits.value
})

// ── KPI calculés ──────────────────────────────────────────────
const totalVues = computed(() =>
  produits.value.reduce((s, p) => s + (p.views_count || 0), 0).toLocaleString('fr-FR')
)
const prixMoyen = computed(() => {
  const actifs = produits.value.filter(p => p.is_available)
  if (!actifs.length) return 0
  return Math.round(actifs.reduce((s, p) => s + Number(p.price), 0) / actifs.length)
})

// ── Stats par catégorie ───────────────────────────────────────
const categoriesStats = computed(() => {
  const map = {}
  produits.value.forEach(p => {
    if (!p.category) return
    if (!map[p.category]) map[p.category] = { cat: p.category, nb: 0, total: 0 }
    map[p.category].nb++
    map[p.category].total += Number(p.price)
  })
  return Object.values(map).map(c => ({
    ...c,
    prixMoyen: Math.round(c.total / c.nb)
  })).sort((a, b) => b.nb - a.nb)
})

// ── Emoji catégorie ───────────────────────────────────────────
const emojiCat = (cat) => ({
  Sardine:'🐟', Thon:'🐠', Crevette:'🦐', Mérou:'🐡',
  Homard:'🦞', Capitaine:'🐟', Calamar:'🦑', Dorade:'🐠',
  Bar:'🐟', Pieuvre:'🐙', Moule:'🦪', Sole:'🐟',
})[cat] || '🐟'

// ── Format date ───────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return 'Jamais connecté'
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ── Chargement données ────────────────────────────────────────
onMounted(async () => {
  try {
    const id = route.params.id
    const [vendeurRes, produitsRes] = await Promise.all([
      api.get(`/admin/vendeur/${id}`),
      api.get(`/admin/vendeur/${id}/produits`),
    ])
    vendeur.value  = vendeurRes.data
    produits.value = produitsRes.data
  } catch (e) {
    console.error('Erreur session vendeur:', e)
  } finally {
    chargement.value = false
  }
})
</script>

<style scoped>
.session-shell {
  min-height: 100vh;
  background: linear-gradient(160deg, #020c1b 0%, #040f20 100%);
  color: white; font-family: 'Segoe UI', system-ui, sans-serif;
  position: relative;
}
.grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .02;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ── Header ── */
.session-header {
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  padding: 20px 28px;
  background: rgba(2,14,35,.7); backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,.06);
  position: sticky; top: 0; z-index: 10;
}
.btn-retour {
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.5); font-size: .8rem; padding: 7px 14px;
  border-radius: 99px; cursor: pointer; transition: all .2s; white-space: nowrap;
}
.btn-retour:hover { background: rgba(255,255,255,.1); color: white; }

.header-centre {
  display: flex; align-items: center; gap: 14px; flex: 1;
}
.vendeur-av-lg {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23; font-weight: 900; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 16px rgba(212,175,55,.3);
}
.vendeur-nom-lg { color: white; font-size: 1.1rem; font-weight: 800; }
.vendeur-meta   { color: rgba(255,255,255,.3); font-size: .75rem; margin-top: 2px; }

.statut-pill {
  display: flex; align-items: center; gap: 6px;
  font-size: .72rem; font-weight: 700; padding: 4px 12px; border-radius: 99px;
}
.statut-on  { background: rgba(37,211,102,.1); color: #25d366; border: 1px solid rgba(37,211,102,.2); }
.statut-off { background: rgba(255,255,255,.06); color: rgba(255,255,255,.3); border: 1px solid rgba(255,255,255,.1); }
.statut-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor;
  animation: sp 1.5s ease-in-out infinite;
}
@keyframes sp { 0%,100%{opacity:1} 50%{opacity:.3} }

.header-last   { text-align: right; }
.last-label    { color: rgba(255,255,255,.25); font-size: .65rem; text-transform: uppercase; letter-spacing: .08em; }
.last-val      { color: #f5d57a; font-size: .82rem; font-weight: 600; margin-top: 2px; }

/* ── Body ── */
.session-body { padding: 24px 28px; position: relative; z-index: 1; }

/* ── KPI mini ── */
.kpi-row  { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
.kpi-mini {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px; padding: 14px 16px;
}
.kpi-gold { border-color: rgba(212,175,55,.2); background: rgba(212,175,55,.05); }
.kpi-mini-val   { color: white; font-size: 1.5rem; font-weight: 900; }
.kpi-gold .kpi-mini-val { color: #f5d57a; }
.kpi-mini-label { color: rgba(255,255,255,.3); font-size: .72rem; margin-top: 2px; }

/* ── Card ── */
.card {
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px; padding: 20px;
}
.mt-4      { margin-top: 16px; }
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.card-titre { color: white; font-weight: 700; font-size: .95rem; }
.card-badge {
  background: rgba(212,175,55,.1); color: #f5d57a;
  font-size: .65rem; font-weight: 700; padding: 3px 8px; border-radius: 99px;
}

/* ── Filtres ── */
.filtres { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.filtre-btn {
  padding: 5px 14px; border-radius: 99px; font-size: .78rem; font-weight: 600;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
  color: rgba(255,255,255,.4); cursor: pointer; transition: all .2s;
}
.filtre-btn:hover { color: rgba(255,255,255,.7); }
.filtre-on {
  background: rgba(212,175,55,.15) !important;
  border-color: rgba(212,175,55,.3) !important;
  color: #f5d57a !important;
}

/* ── Tableau ── */
.table-wrap   { overflow-x: auto; }
.tbl          { width: 100%; border-collapse: collapse; }
.tbl thead th {
  text-align: left; padding: 8px 12px;
  color: rgba(255,255,255,.25); font-size: .68rem;
  text-transform: uppercase; letter-spacing: .07em;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.tbl-row td   { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
.tbl-row:hover td { background: rgba(255,255,255,.02); }
.tbl-row:last-child td { border-bottom: none; }
.tbl-grey     { color: rgba(255,255,255,.35); font-size: .82rem; }
.tbl-non      { color: rgba(255,255,255,.15); font-size: .8rem; }
.tbl-vide     { text-align: center; color: rgba(255,255,255,.2); padding: 24px; }

.prod-nom   { color: white; font-size: .85rem; font-weight: 600; }
.prod-ville { color: rgba(255,255,255,.25); font-size: .68rem; }

.cat-chip {
  background: rgba(255,255,255,.06); color: rgba(255,255,255,.6);
  font-size: .72rem; padding: 3px 8px; border-radius: 6px;
}

/* Prix colorés */
.prix-chip { font-weight: 700; font-size: .85rem; padding: 3px 8px; border-radius: 7px; }
.prix-bas  { background: rgba(37,211,102,.1); color: #4ade80; }
.prix-mid  { background: rgba(212,175,55,.1); color: #f5d57a; }
.prix-haut { background: rgba(255,107,107,.1); color: #ff8080; }

.badge-fire   { background: rgba(212,175,55,.12); color: #f5d57a; font-size: .72rem; font-weight: 700; padding: 3px 8px; border-radius: 99px; }
.badge-dispo  { background: rgba(37,211,102,.1); color: #25d366; font-size: .78rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
.badge-indispo { background: rgba(255,80,80,.08); color: #ff8080; font-size: .78rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; }

/* Légende */
.legende { display:flex; gap:16px; flex-wrap:wrap; padding:12px 0 0; border-top:1px solid rgba(255,255,255,.06); margin-top:8px; font-size:.72rem; color:rgba(255,255,255,.3); }
.dot-vert  { display:inline-block; width:8px; height:8px; border-radius:50%; background:#4ade80; margin-right:4px; vertical-align:middle; }
.dot-or    { display:inline-block; width:8px; height:8px; border-radius:50%; background:#d4af37; margin-right:4px; vertical-align:middle; }
.dot-rouge { display:inline-block; width:8px; height:8px; border-radius:50%; background:#ff8080; margin-right:4px; vertical-align:middle; }
.text-amber-400 { color: #f5d57a; }

/* ── Catégories grid ── */
.cats-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr));
  gap: 10px; margin-top: 4px;
}
.cat-stat {
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
  border-radius: 10px; padding: 12px; text-align: center;
}
.cat-stat-emoji { font-size: 1.5rem; margin-bottom: 4px; }
.cat-stat-nom   { color: white; font-size: .8rem; font-weight: 700; }
.cat-stat-nb    { color: rgba(255,255,255,.35); font-size: .7rem; margin: 2px 0; }
.cat-stat-prix  { color: #f5d57a; font-size: .78rem; font-weight: 700; margin-bottom: 6px; }
.cat-bar-track  { height: 3px; background: rgba(255,255,255,.08); border-radius: 99px; overflow: hidden; }
.cat-bar-fill   { height: 100%; background: linear-gradient(90deg, #d4af37, #f5d57a); border-radius: 99px; }

/* ── Loading ── */
.loading-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px; gap:12px; }
.loading-fish { font-size:2.5rem; animation: lf 1.2s ease-in-out infinite; }
@keyframes lf { 0%,100%{transform:translateX(0) rotate(0)} 25%{transform:translateX(8px) rotate(6deg)} 75%{transform:translateX(-8px) rotate(-6deg)} }
.loading-txt  { color: rgba(255,255,255,.25); font-size:.88rem; }

@media (max-width: 768px) {
  .kpi-row { grid-template-columns: 1fr 1fr; }
  .session-header { padding: 14px 16px; }
  .session-body   { padding: 16px; }
  .header-last    { display: none; }
}
</style>
