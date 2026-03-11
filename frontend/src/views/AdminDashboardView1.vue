<!-- =================================================================
  views/AdminDashboardView.vue
  Dashboard Admin — SamakMarket
  
  DESIGN : Luxury nautique marocain · Fond nuit océan · Accents or
  
  SECTIONS :
    1. Vue d'ensemble — 4 KPI + graphes barres
    2. Vendeurs       — tableau avec mini-barres articles
    3. Comparateur    — prix par catégorie entre vendeurs
  
  DONNÉES : données de démo intégrées
             → remplacer par api.get('/admin/...') quand backend prêt
  
  INTÉGRATION :
    1. Copie ce fichier dans src/views/AdminDashboardView.vue
    2. Dans router/index.js ajoute :
         { path: '/admin', name: 'admin', component: () => import('../views/AdminDashboardView.vue') }
    3. Accède via http://localhost:5173/admin
================================================================= -->

<template>
  <div class="shell">

    <!-- Grain texture overlay — effet papier luxueux -->
    <div class="grain-overlay"></div>

    <!-- ══════════════════════════════════════════════════════
         SIDEBAR
    ══════════════════════════════════════════════════════ -->
    <aside class="sidebar" :class="{ open: menuOpen }">

      <!-- Logo -->
      <div class="sb-logo">
        <div class="sb-logo-icon">
          <svg viewBox="0 0 40 40" width="36" height="36">
            <!-- S stylisé SamakMarket -->
            <circle cx="20" cy="20" r="18" fill="none" stroke="#d4af37" stroke-width="1.5" opacity=".4"/>
            <text x="20" y="26" text-anchor="middle" fill="#d4af37"
              font-size="18" font-weight="900" font-family="serif">S</text>
          </svg>
        </div>
        <div>
          <div class="sb-logo-name">SamakMarket</div>
          <div class="sb-logo-role">Administration</div>
        </div>
      </div>

      <!-- Date -->
      <div class="sb-date">{{ dateStr }}</div>

      <!-- Nav -->
      <nav class="sb-nav">
        <button v-for="item in nav" :key="item.id"
          @click="page = item.id; menuOpen = false"
          :class="['sb-link', page === item.id && 'sb-link-active']">
          <span class="sb-link-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span v-if="page === item.id" class="sb-link-dot"></span>
        </button>
      </nav>

      <!-- Bas sidebar : retour site -->
      <div class="sb-bottom">
        <a href="/" class="sb-back-btn">
          <span>←</span> Retour au site
        </a>
      </div>

    </aside>

    <!-- ══════════════════════════════════════════════════════
         CONTENU
    ══════════════════════════════════════════════════════ -->
    <div class="content">

      <!-- Topbar -->
      <header class="topbar">
        <!-- Burger mobile -->
        <button @click="menuOpen = !menuOpen" class="burger">☰</button>

        <div class="topbar-left">
          <h1 class="topbar-title">{{ nav.find(n => n.id === page)?.label }}</h1>
          <p class="topbar-sub">Tableau de bord · SamakMarket</p>
        </div>

        <div class="topbar-right">
          <!-- Indicateur live -->
          <div class="live-pill">
            <span class="live-dot"></span> En direct
          </div>
          <!-- Avatar admin -->
          <div class="admin-pill">
            <div class="admin-av">A</div>
            <span>Admin</span>
          </div>
        </div>
      </header>

      <!-- ────────────────────────────────────────────────────
           PAGE : VUE D'ENSEMBLE
      ──────────────────────────────────────────────────── -->
      <div v-show="page === 'overview'" class="page-body">

        <!-- Chargement global -->
        <div v-if="chargement" class="loading-state">
          <div class="loading-fish">🐟</div>
          <p class="loading-txt">Chargement des données...</p>
        </div>

        <!-- Erreur API -->
        <div v-else-if="erreurApi" class="erreur-state">
          <div class="text-3xl mb-2">⚠️</div>
          <p class="text-red-400 font-semibold">{{ erreurApi }}</p>
          <p class="text-white/30 text-sm mt-1">Vérifiez que le backend tourne sur le port 3000</p>
        </div>

        <!-- KPI row (affiché seulement quand données chargées) -->
        <template v-else>

        <!-- KPI row -->
        <div class="kpi-row">

          <div class="kpi kpi-ocean" style="--delay:.05s">
            <div class="kpi-top">
              <div class="kpi-ico">🛒</div>
              <div class="kpi-num">{{ d.totalProduits }}</div>
            </div>
            <div class="kpi-label">Produits actifs</div>
            <div class="kpi-sub">+ {{ d.produitsAujourdhui }} aujourd'hui</div>
            <div class="kpi-glow kpi-glow-blue"></div>
          </div>

          <div class="kpi kpi-gold-card" style="--delay:.1s">
            <div class="kpi-top">
              <div class="kpi-ico">🔥</div>
              <div class="kpi-num kpi-num-gold">{{ d.totalPromos }}</div>
            </div>
            <div class="kpi-label">Promos actives</div>
            <div class="kpi-sub">diffusées aujourd'hui</div>
            <div class="kpi-glow kpi-glow-gold"></div>
          </div>

          <div class="kpi kpi-ocean" style="--delay:.15s">
            <div class="kpi-top">
              <div class="kpi-ico">👤</div>
              <div class="kpi-num">{{ d.totalVendeurs }}</div>
            </div>
            <div class="kpi-label">Vendeurs inscrits</div>
            <div class="kpi-sub">{{ d.vendeursActifs }} actifs</div>
            <div class="kpi-glow kpi-glow-blue"></div>
          </div>

          <div class="kpi kpi-ocean" style="--delay:.2s">
            <div class="kpi-top">
              <div class="kpi-ico">👁️</div>
              <div class="kpi-num">{{ (d.totalVues/1000).toFixed(1) }}k</div>
            </div>
            <div class="kpi-label">Vues totales</div>
            <div class="kpi-sub">sur tous les produits</div>
            <div class="kpi-glow kpi-glow-blue"></div>
          </div>

        </div>

        <!-- Graphes row -->
        <div class="charts-row">

          <!-- Promos par ville -->
          <div class="card" style="--delay:.25s">
            <div class="card-head">
              <span class="card-title">🗺️ Promos par ville</span>
              <span class="card-badge">{{ d.totalPromos }} total</span>
            </div>
            <div class="bars-list">
              <div v-for="v in d.promoParVille" :key="v.ville" class="bar-item">
                <span class="bar-name">{{ v.ville }}</span>
                <div class="bar-track">
                  <div class="bar-fill bar-gold"
                    :style="{ width: (v.count / d.totalPromos * 100) + '%' }">
                    <span class="bar-num">{{ v.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top catégories -->
          <div class="card" style="--delay:.3s">
            <div class="card-head">
              <span class="card-title">🐟 Top catégories</span>
              <span class="card-badge">{{ d.topCategories.reduce((s,c)=>s+c.count,0) }} annonces</span>
            </div>
            <div class="bars-list">
              <div v-for="(c, i) in d.topCategories" :key="c.cat" class="bar-item">
                <span class="bar-name">{{ c.cat }}</span>
                <div class="bar-track">
                  <div class="bar-fill"
                    :class="i===0?'bar-gold':i===1?'bar-blue':'bar-teal'"
                    :style="{ width: (c.count / d.topCategories[0].count * 100) + '%' }">
                    <span class="bar-num">{{ c.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Promos actives par vendeur (donut visuel) -->
          <div class="card" style="--delay:.35s">
            <div class="card-head">
              <span class="card-title">🔥 Vendeurs en promo</span>
            </div>
            <div class="promo-list">
              <div v-for="v in d.vendeursEnPromo" :key="v.id" class="promo-item">
                <div class="promo-av">{{ v.name.charAt(0).toUpperCase() }}</div>
                <div class="promo-info">
                  <div class="promo-name">{{ v.name }}</div>
                  <div class="promo-ville">📍 {{ v.ville }}</div>
                </div>
                <div class="promo-count">{{ v.nbPromos }} promo{{ v.nbPromos > 1 ? 's' : '' }}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

        </template><!-- /v-else données chargées -->

      <!-- ────────────────────────────────────────────────────
           PAGE : VENDEURS
      ──────────────────────────────────────────────────── -->
      <div v-show="page === 'vendeurs'" class="page-body">

        <!-- Barre recherche -->
        <div class="search-row">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input v-model="qVendeur" placeholder="Rechercher un vendeur, une ville..."
              class="search-input" />
          </div>
          <div class="search-meta">{{ vendeursFiltres.length }} vendeur{{ vendeursFiltres.length > 1 ? 's' : '' }}</div>
        </div>

        <!-- Table vendeurs -->
        <div class="card card-full" style="--delay:.1s">
          <div class="card-head">
            <span class="card-title">👤 Vendeurs — articles & promos</span>
          </div>

          <div class="table-scroll">
            <table class="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vendeur</th>
                  <th>Ville</th>
                  <th>Articles</th>
                  <th>Promos</th>
                  <th>Vues</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(v, i) in vendeursFiltres" :key="v.id" class="tbl-row">
                  <td class="tbl-num">{{ i + 1 }}</td>
                  <td>
                    <div class="vend-cell">
                      <div class="vend-av">{{ v.name.charAt(0).toUpperCase() }}</div>
                      <div>
                        <div class="vend-name">{{ v.name }}</div>
                        <div class="vend-email">{{ v.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="tbl-city">📍 {{ v.city || '—' }}</td>
                  <td>
                    <!-- Mini barre articles -->
                    <div class="articles-cell">
                      <span class="articles-num">{{ v.nbProduits }}</span>
                      <div class="mini-track">
                        <div class="mini-fill"
                          :style="{ width: (v.nbProduits / vendeurs[0].nbProduits * 100) + '%' }">
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span v-if="v.nbPromos > 0" class="badge-fire">🔥 {{ v.nbPromos }}</span>
                    <span v-else class="tbl-none">—</span>
                  </td>
                  <td class="tbl-vues">{{ v.nbVues.toLocaleString('fr-FR') }}</td>
                  <td>
                    <span :class="v.is_active ? 'badge-on' : 'badge-off'">
                      {{ v.is_active ? '● Actif' : '○ Inactif' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────
           PAGE : COMPARATEUR PRIX
      ──────────────────────────────────────────────────── -->
      <div v-show="page === 'prix'" class="page-body">

        <!-- Sélecteur catégorie -->
        <div class="cat-row">
          <button v-for="cat in categoriesDispos" :key="cat"
            @click="catChoisie = cat"
            :class="['cat-btn', catChoisie === cat && 'cat-btn-on']">
            {{ emojisCat[cat] || '🐟' }} {{ cat }}
          </button>
        </div>

        <!-- Stats moyennes -->
        <div class="prix-stats-row">
          <div class="prix-stat">
            <div class="prix-stat-num">{{ Math.round(moyenneCat) }} MAD</div>
            <div class="prix-stat-label">Prix moyen</div>
          </div>
          <div class="prix-stat">
            <div class="prix-stat-num text-green-400">{{ Math.round(minCat) }} MAD</div>
            <div class="prix-stat-label">Prix le plus bas</div>
          </div>
          <div class="prix-stat">
            <div class="prix-stat-num text-red-400">{{ Math.round(maxCat) }} MAD</div>
            <div class="prix-stat-label">Prix le plus haut</div>
          </div>
          <div class="prix-stat">
            <div class="prix-stat-num">{{ produitsCat.length }}</div>
            <div class="prix-stat-label">Offres comparées</div>
          </div>
        </div>

        <!-- Tableau comparateur -->
        <div class="card card-full" style="--delay:.1s">
          <div class="card-head">
            <span class="card-title">⚖️ Comparatif prix — {{ catChoisie }}</span>
            <span class="card-badge">triés par prix ↑</span>
          </div>

          <div class="table-scroll">
            <table class="tbl">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Produit</th>
                  <th>Vendeur</th>
                  <th>Ville</th>
                  <th>Prix / unité</th>
                  <th>vs Moyenne</th>
                  <th>Positionnement</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in produitsCatTries" :key="p.id" class="tbl-row">
                  <!-- Rang avec médaille -->
                  <td class="tbl-rang">
                    <span v-if="i===0">🥇</span>
                    <span v-else-if="i===1">🥈</span>
                    <span v-else-if="i===2">🥉</span>
                    <span v-else class="tbl-num">{{ i + 1 }}</span>
                  </td>
                  <td>
                    <div class="vend-name">{{ p.name }}</div>
                    <div class="vend-email">{{ p.unit }}</div>
                  </td>
                  <td>
                    <div class="vend-cell">
                      <div class="vend-av vend-av-blue">{{ p.sellerName?.charAt(0) }}</div>
                      <span class="vend-name">{{ p.sellerName }}</span>
                    </div>
                  </td>
                  <td class="tbl-city">📍 {{ p.city }}</td>
                  <td>
                    <span :class="[
                      'prix-chip',
                      p.price <= moyenneCat * 0.9  ? 'prix-bas'  :
                      p.price >= moyenneCat * 1.1  ? 'prix-haut' : 'prix-mid'
                    ]">
                      {{ Number(p.price).toLocaleString('fr-FR') }} MAD
                    </span>
                  </td>
                  <td>
                    <span :class="[
                      'diff-chip',
                      p.price < moyenneCat ? 'diff-moins' :
                      p.price > moyenneCat ? 'diff-plus'  : 'diff-egal'
                    ]">
                      {{ p.price === moyenneCat ? '=' :
                         p.price < moyenneCat ? '↓ ' : '↑ ' }}
                      {{ Math.abs(Math.round((p.price-moyenneCat)/moyenneCat*100)) }}%
                    </span>
                  </td>
                  <td>
                    <!-- Barre positionnement entre min et max -->
                    <div class="pos-track">
                      <div class="pos-fill"
                        :style="{ width: ((p.price-minCat)/(maxCat-minCat||1)*100) + '%' }"
                        :class="p.price <= moyenneCat*0.9 ? 'pos-green' : p.price >= moyenneCat*1.1 ? 'pos-red' : 'pos-gold'">
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Légende -->
          <div class="legende">
            <span><span class="leg-dot dot-green"></span>Pas cher (−10%)</span>
            <span><span class="leg-dot dot-gold"></span>Prix moyen</span>
            <span><span class="leg-dot dot-red"></span>Cher (+10%)</span>
          </div>
        </div>
      </div>

    </div><!-- /content -->
  </div><!-- /shell -->
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'

// ── Navigation sidebar ────────────────────────────────────────
const page     = ref('overview')
const menuOpen = ref(false)
const nav = [
  { id: 'overview', icon: '◈', label: 'Vue d'ensemble' },
  { id: 'vendeurs', icon: '👤', label: 'Vendeurs'        },
  { id: 'prix',     icon: '⚖️',  label: 'Comparateur Prix' },
]

// ── Date ──────────────────────────────────────────────────────
const dateStr = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long'
})

// ── État de chargement ────────────────────────────────────────
const chargement = ref(true)
const erreurApi  = ref('')

// ── Données réactives (remplacent les données de démo) ────────
// reactive() = objet réactif, ses propriétés se mettent à jour dans le template
const d = reactive({
  totalProduits:       0,
  totalPromos:         0,
  totalVendeurs:       0,
  vendeursActifs:      0,
  totalVues:           0,
  produitsAujourdhui:  0,
  promoParVille:       [],
  topCategories:       [],
  vendeursEnPromo:     [],
})

const vendeurs = ref([])
const produits = ref([])

// ── Chargement API ────────────────────────────────────────────
onMounted(async () => {
  try {
    // 3 appels en parallèle = plus rapide qu'en séquence
    const [statsRes, vendeursRes, produitsRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/vendeurs'),
      api.get('/admin/produits'),
    ])

    // Copie les données de l'API dans d (reactive)
    Object.assign(d, statsRes.data)
    vendeurs.value = vendeursRes.data
    produits.value = produitsRes.data

    // Sélectionne la première catégorie disponible pour le comparateur
    if (categoriesDispos.value.length) {
      catChoisie.value = categoriesDispos.value[0]
    }

  } catch (e) {
    console.error('Erreur API admin :', e)
    erreurApi.value = e.response?.data?.message || 'Impossible de charger les données'
  } finally {
    chargement.value = false
  }
})

// ── Recherche vendeur ─────────────────────────────────────────
const qVendeur = ref('')
const vendeursFiltres = computed(() => {
  const q = qVendeur.value.toLowerCase()
  return vendeurs.value.filter(v =>
    v.name.toLowerCase().includes(q) || (v.city||'').toLowerCase().includes(q)
  )
})

// ── Comparateur prix ──────────────────────────────────────────
const emojisCat = { Sardine:'🐟', Thon:'🐠', Crevette:'🦐', Mérou:'🐡', Homard:'🦞', Dorade:'🐠', Calamar:'🦑' }

const catChoisie = ref('')
const categoriesDispos = computed(() =>
  [...new Set(produits.value.map(p => p.category))].sort()
)
const produitsCat = computed(() =>
  produits.value.filter(p => p.category === catChoisie.value)
)
const produitsCatTries = computed(() =>
  [...produitsCat.value].sort((a, b) => a.price - b.price)
)
const moyenneCat = computed(() => {
  if (!produitsCat.value.length) return 0
  return produitsCat.value.reduce((s, p) => s + Number(p.price), 0) / produitsCat.value.length
})
const minCat = computed(() => produitsCat.value.length ? Math.min(...produitsCat.value.map(p=>p.price)) : 0)
const maxCat = computed(() => produitsCat.value.length ? Math.max(...produitsCat.value.map(p=>p.price)) : 0)
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   VARIABLES — Thème SamakMarket
══════════════════════════════════════════════════════════ */
.shell {
  --nuit:    #020c1b;
  --ocean:   #040f20;
  --profond: #061428;
  --or:      #d4af37;
  --or2:     #f5d57a;
  --vert:    #25d366;
  --rouge:   #ff6b6b;
  --bleu:    #0dcaf0;

  display: flex;
  min-height: 100vh;
  background: var(--nuit);
  color: white;
  font-family: 'Segoe UI', system-ui, sans-serif;
  position: relative;
  overflow: hidden;
}

/* Grain texture subtile — caractère luxueux */
.grain-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 999;
  opacity: .025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px;
}

/* ══ SIDEBAR ══════════════════════════════════════════════ */
.sidebar {
  width: 230px; flex-shrink: 0;
  background: linear-gradient(180deg, #010b18 0%, #020e23 100%);
  border-right: 1px solid rgba(212,175,55,.12);
  display: flex; flex-direction: column;
  padding: 28px 16px;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
}

.sb-logo {
  display: flex; align-items: center; gap: 12px;
  padding-bottom: 20px; margin-bottom: 12px;
  border-bottom: 1px solid rgba(212,175,55,.08);
}
.sb-logo-name { color: white; font-weight: 800; font-size: .9rem; letter-spacing: .04em; }
.sb-logo-role { color: rgba(212,175,55,.55); font-size: .65rem; letter-spacing: .12em; text-transform: uppercase; margin-top: 2px; }

.sb-date { color: rgba(255,255,255,.2); font-size: .7rem; text-transform: capitalize; letter-spacing: .05em; margin-bottom: 24px; padding: 0 4px; }

.sb-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }

.sb-link {
  position: relative; display: flex; align-items: center; gap: 10px;
  padding: 11px 12px; border-radius: 10px;
  background: none; border: none; cursor: pointer; width: 100%;
  color: rgba(255,255,255,.35); font-size: .85rem; font-weight: 500;
  transition: all .2s; text-align: left;
}
.sb-link:hover { background: rgba(255,255,255,.04); color: rgba(255,255,255,.65); }
.sb-link-active {
  background: linear-gradient(135deg, rgba(212,175,55,.14), rgba(212,175,55,.04)) !important;
  color: var(--or2) !important;
  border: 1px solid rgba(212,175,55,.18);
}
.sb-link-icon { width: 18px; text-align: center; font-size: .95rem; }
.sb-link-dot  {
  margin-left: auto; width: 6px; height: 6px; border-radius: 50%;
  background: var(--or); box-shadow: 0 0 8px rgba(212,175,55,.6);
}

.sb-bottom { padding-top: 20px; border-top: 1px solid rgba(255,255,255,.05); }
.sb-back-btn {
  display: flex; align-items: center; gap: 8px;
  color: rgba(255,255,255,.25); font-size: .8rem;
  text-decoration: none; padding: 8px 12px; border-radius: 8px;
  transition: all .2s;
}
.sb-back-btn:hover { color: rgba(255,255,255,.6); background: rgba(255,255,255,.04); }

/* ══ CONTENU ══════════════════════════════════════════════ */
.content { flex: 1; display: flex; flex-direction: column; min-width: 0; }

/* ══ TOPBAR ═══════════════════════════════════════════════ */
.topbar {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 28px;
  background: rgba(2,14,35,.7); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,.05);
  position: sticky; top: 0; z-index: 10;
}
.burger { display: none; background: none; border: none; color: rgba(255,255,255,.5); font-size: 1.3rem; cursor: pointer; }
.topbar-left { flex: 1; }
.topbar-title { color: white; font-size: 1.1rem; font-weight: 700; letter-spacing: .02em; }
.topbar-sub   { color: rgba(255,255,255,.25); font-size: .72rem; letter-spacing: .05em; text-transform: uppercase; }
.topbar-right { display: flex; align-items: center; gap: 12px; }

.live-pill {
  display: flex; align-items: center; gap: 6px;
  background: rgba(37,211,102,.08); border: 1px solid rgba(37,211,102,.2);
  color: var(--vert); font-size: .72rem; font-weight: 600;
  padding: 5px 12px; border-radius: 99px;
}
.live-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--vert);
  animation: lp 1.5s ease-in-out infinite;
}
@keyframes lp { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }

.admin-pill {
  display: flex; align-items: center; gap: 8px;
  background: rgba(212,175,55,.08); border: 1px solid rgba(212,175,55,.15);
  padding: 5px 12px 5px 5px; border-radius: 99px;
  color: var(--or2); font-size: .8rem; font-weight: 600;
}
.admin-av {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, var(--or), var(--or2));
  color: #020e23; font-weight: 900; font-size: .75rem;
  display: flex; align-items: center; justify-content: center;
}

/* ══ PAGE BODY ════════════════════════════════════════════ */
.page-body { padding: 28px; overflow-y: auto; flex: 1; }

/* ══ KPI ROW ══════════════════════════════════════════════ */
.kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; margin-bottom: 20px;
}
.kpi {
  position: relative; border-radius: 16px; padding: 20px 20px 16px;
  border: 1px solid rgba(255,255,255,.06); overflow: hidden;
  animation: fadeUp .5s ease both; animation-delay: var(--delay);
}
.kpi-ocean     { background: linear-gradient(145deg, #071b38, #040e20); }
.kpi-gold-card { background: linear-gradient(145deg, #1a1200, #100c00); border-color: rgba(212,175,55,.2); }

.kpi-top  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.kpi-ico  { font-size: 1.5rem; }
.kpi-num  { font-size: 2.2rem; font-weight: 900; color: white; line-height: 1; }
.kpi-num-gold { color: var(--or2); }
.kpi-label { color: rgba(255,255,255,.35); font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; }
.kpi-sub   { color: rgba(255,255,255,.2); font-size: .7rem; margin-top: 3px; }

/* Halo coloré en bas-droite des KPI */
.kpi-glow {
  position: absolute; bottom: -20px; right: -20px;
  width: 80px; height: 80px; border-radius: 50%; filter: blur(25px); opacity: .25;
}
.kpi-glow-blue { background: #0dcaf0; }
.kpi-glow-gold { background: #d4af37; }

/* ══ CHARTS ROW ═══════════════════════════════════════════ */
.charts-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

/* ══ CARD ═════════════════════════════════════════════════ */
.card {
  background: linear-gradient(145deg, rgba(255,255,255,.04), rgba(212,175,55,.025));
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px; padding: 20px;
  animation: fadeUp .5s ease both; animation-delay: var(--delay, .1s);
}
.card-full { margin-top: 16px; }
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { color: white; font-weight: 700; font-size: .9rem; }
.card-badge {
  background: rgba(212,175,55,.1); color: var(--or2);
  font-size: .65rem; font-weight: 700; padding: 3px 8px; border-radius: 99px;
  letter-spacing: .05em;
}

/* ══ BARRES ═══════════════════════════════════════════════ */
.bars-list { display: flex; flex-direction: column; gap: 10px; }
.bar-item  { display: flex; align-items: center; gap: 10px; }
.bar-name  { color: rgba(255,255,255,.45); font-size: .78rem; width: 80px; flex-shrink: 0; }
.bar-track { flex: 1; height: 22px; background: rgba(255,255,255,.05); border-radius: 6px; overflow: hidden; }
.bar-fill  {
  height: 100%; border-radius: 6px; display: flex; align-items: center; justify-content: flex-end;
  padding-right: 8px; transition: width 1s cubic-bezier(.22,1,.36,1);
  min-width: 28px;
}
.bar-gold { background: linear-gradient(90deg, rgba(212,175,55,.4), rgba(245,213,122,.7)); }
.bar-blue { background: linear-gradient(90deg, rgba(13,202,240,.3), rgba(13,202,240,.6)); }
.bar-teal { background: linear-gradient(90deg, rgba(37,211,102,.3), rgba(37,211,102,.6)); }
.bar-num  { color: rgba(255,255,255,.7); font-size: .7rem; font-weight: 700; }

/* ══ LISTE PROMOS ═════════════════════════════════════════ */
.promo-list { display: flex; flex-direction: column; gap: 8px; }
.promo-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 10px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.05);
  transition: background .2s;
}
.promo-item:hover { background: rgba(212,175,55,.06); }
.promo-av {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--or), var(--or2));
  color: #020e23; font-weight: 900; font-size: .8rem;
  display: flex; align-items: center; justify-content: center;
}
.promo-info { flex: 1; min-width: 0; }
.promo-name { color: white; font-size: .82rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.promo-ville { color: rgba(255,255,255,.3); font-size: .7rem; }
.promo-count {
  background: rgba(212,175,55,.12); color: var(--or2);
  font-size: .7rem; font-weight: 700; padding: 3px 8px; border-radius: 99px; white-space: nowrap;
}

/* ══ SEARCH ═══════════════════════════════════════════════ */
.search-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.search-box {
  display: flex; align-items: center; gap: 10px; flex: 1;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px; padding: 10px 16px;
}
.search-icon { font-size: .9rem; opacity: .5; }
.search-input { background: none; border: none; outline: none; color: white; font-size: .85rem; flex: 1; }
.search-input::placeholder { color: rgba(255,255,255,.25); }
.search-meta { color: rgba(255,255,255,.25); font-size: .8rem; white-space: nowrap; }

/* ══ TABLEAU ══════════════════════════════════════════════ */
.table-scroll { overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl thead th {
  text-align: left; padding: 8px 14px;
  color: rgba(255,255,255,.25); font-size: .68rem;
  text-transform: uppercase; letter-spacing: .08em;
  border-bottom: 1px solid rgba(255,255,255,.07);
  white-space: nowrap;
}
.tbl-row td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
.tbl-row:hover td { background: rgba(255,255,255,.02); }
.tbl-row:last-child td { border-bottom: none; }
.tbl-num  { color: rgba(255,255,255,.2); font-size: .8rem; }
.tbl-rang { font-size: 1.1rem; text-align: center; }
.tbl-city { color: rgba(255,255,255,.4); font-size: .82rem; }
.tbl-vues { color: rgba(255,255,255,.4); font-size: .82rem; }
.tbl-none { color: rgba(255,255,255,.15); font-size: .8rem; }

.vend-cell  { display: flex; align-items: center; gap: 8px; }
.vend-av    { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg,var(--or),var(--or2)); color:#020e23; font-weight:900; font-size:.75rem; display:flex; align-items:center; justify-content:center; }
.vend-av-blue { background: linear-gradient(135deg, #0d6efd, #0dcaf0); color: white; }
.vend-name  { color: white; font-size: .85rem; font-weight: 600; }
.vend-email { color: rgba(255,255,255,.25); font-size: .72rem; }

/* Mini barre articles */
.articles-cell { display: flex; align-items: center; gap: 8px; }
.articles-num  { color: var(--or2); font-weight: 700; font-size: .9rem; width: 20px; }
.mini-track    { width: 50px; height: 4px; background: rgba(255,255,255,.07); border-radius: 99px; overflow: hidden; }
.mini-fill     { height: 100%; background: linear-gradient(90deg, var(--or), var(--or2)); border-radius: 99px; transition: width .8s; }

/* Badges statut */
.badge-on   { background:rgba(37,211,102,.1); color:var(--vert); font-size:.72rem; font-weight:700; padding:3px 9px; border-radius:99px; border:1px solid rgba(37,211,102,.2); white-space:nowrap; }
.badge-off  { background:rgba(255,255,255,.05); color:rgba(255,255,255,.25); font-size:.72rem; font-weight:700; padding:3px 9px; border-radius:99px; white-space:nowrap; }
.badge-fire { background:rgba(212,175,55,.12); color:var(--or2); font-size:.72rem; font-weight:700; padding:3px 9px; border-radius:99px; white-space:nowrap; }

/* ══ COMPARATEUR ══════════════════════════════════════════ */
.cat-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.cat-btn {
  padding: 7px 18px; border-radius: 99px; font-size: .82rem; font-weight: 600;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
  color: rgba(255,255,255,.4); cursor: pointer; transition: all .2s;
}
.cat-btn:hover { background: rgba(255,255,255,.08); color: rgba(255,255,255,.7); }
.cat-btn-on   { background: rgba(212,175,55,.15) !important; border-color: rgba(212,175,55,.3) !important; color: var(--or2) !important; }

/* Stats moyennes */
.prix-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 16px; }
.prix-stat      { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; padding: 14px 16px; }
.prix-stat-num  { color: white; font-size: 1.5rem; font-weight: 900; }
.prix-stat-label{ color: rgba(255,255,255,.3); font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; margin-top: 3px; }
.text-green-400 { color: #4ade80; }
.text-red-400   { color: #f87171; }

/* Badges prix */
.prix-chip { font-weight: 700; font-size: .85rem; padding: 4px 10px; border-radius: 8px; white-space: nowrap; }
.prix-bas  { background: rgba(37,211,102,.12); color: #4ade80; }
.prix-mid  { background: rgba(212,175,55,.12); color: var(--or2); }
.prix-haut { background: rgba(255,107,107,.12); color: var(--rouge); }

/* Badges différence */
.diff-chip  { font-size: .8rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; white-space: nowrap; }
.diff-moins { background: rgba(37,211,102,.1); color: #4ade80; }
.diff-plus  { background: rgba(255,107,107,.1); color: var(--rouge); }
.diff-egal  { background: rgba(255,255,255,.06); color: rgba(255,255,255,.3); }

/* Barre positionnement */
.pos-track { width: 80px; height: 5px; background: rgba(255,255,255,.07); border-radius: 99px; overflow: hidden; }
.pos-fill  { height: 100%; border-radius: 99px; transition: width .8s; }
.pos-green { background: linear-gradient(90deg, #25d366, #4ade80); }
.pos-gold  { background: linear-gradient(90deg, var(--or), var(--or2)); }
.pos-red   { background: linear-gradient(90deg, #ff6b6b, #f87171); }

/* Légende */
.legende { display:flex; gap:20px; flex-wrap:wrap; align-items:center; padding:12px 14px 0; border-top:1px solid rgba(255,255,255,.06); margin-top:8px; font-size:.72rem; color:rgba(255,255,255,.3); }
.leg-dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:5px; vertical-align: middle; }
.dot-green{ background:#4ade80; }
.dot-gold { background:var(--or); }
.dot-red  { background:var(--rouge); }

/* ══ ÉTATS CHARGEMENT / ERREUR ═══════════════════════════ */
.loading-state, .erreur-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 20px; text-align: center;
}
.loading-fish {
  font-size: 3rem;
  animation: fishSwim 1.2s ease-in-out infinite;
}
.loading-txt { color: rgba(255,255,255,.3); font-size: .9rem; margin-top: 12px; }
@keyframes fishSwim {
  0%,100% { transform: translateX(0) rotate(0deg); }
  25%     { transform: translateX(10px) rotate(8deg); }
  75%     { transform: translateX(-10px) rotate(-8deg); }
}

/* ══ ANIMATIONS ═══════════════════════════════════════════ */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ══ RESPONSIVE ═══════════════════════════════════════════ */
@media (max-width: 1100px) {
  .charts-row { grid-template-columns: 1fr 1fr; }
  .kpi-row    { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .sidebar { position:fixed; left:-250px; z-index:100; transition:left .3s; height:100vh; }
  .sidebar.open { left: 0; }
  .burger { display: block; }
  .kpi-row { grid-template-columns: 1fr 1fr; }
  .charts-row { grid-template-columns: 1fr; }
  .prix-stats-row { grid-template-columns: 1fr 1fr; }
  .live-pill { display: none; }
  .page-body { padding: 16px; }
}
@media (max-width: 480px) {
  .kpi-row { grid-template-columns: 1fr; }
}
</style>
