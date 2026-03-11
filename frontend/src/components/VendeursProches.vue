<!-- =============================================================
  components/VendeursProches.vue
  Section "Vendeurs près de vous" — comparaison GPS visiteur vs DB
  
  USAGE dans MarketplaceView.vue (après le hero) :
    <VendeursProches />
    
  LOGIQUE :
    1. Demande la position GPS du visiteur
    2. Appelle GET /api/vendeurs/proches?lat=X&lng=Y&limit=5
    3. Le backend calcule la distance Haversine en SQL
    4. Affiche 5 vendeurs les + proches avec leurs produits
============================================================= -->
<template>
  <section class="vp-section">

    <!-- ── État : GPS pas encore demandé ── -->
    <div v-if="etat === 'idle'" class="vp-invite">
      <div class="vp-invite-icon">📍</div>
      <div class="vp-invite-txt">
        <h3>Vendeurs près de vous</h3>
        <p>Activez la localisation pour voir les 5 vendeurs les plus proches</p>
      </div>
      <button @click="localiser" class="btn-invite">
        📡 Trouver près de moi
      </button>
    </div>

    <!-- ── État : Chargement GPS ── -->
    <div v-else-if="etat === 'gps'" class="vp-loading">
      <div class="vp-loading-fish">📡</div>
      <p>Détection de votre position...</p>
    </div>

    <!-- ── État : Chargement API ── -->
    <div v-else-if="etat === 'api'" class="vp-loading">
      <div class="vp-loading-fish">🐟</div>
      <p>Recherche des vendeurs proches...</p>
    </div>

    <!-- ── État : Erreur ── -->
    <div v-else-if="etat === 'erreur'" class="vp-erreur">
      <span>⚠️ {{ erreurMsg }}</span>
      <button @click="etat = 'idle'" class="btn-retry">Réessayer</button>
    </div>

    <!-- ── État : Résultats ── -->
    <template v-else-if="etat === 'ok'">

      <!-- Header -->
      <div class="vp-header">
        <div class="vp-header-left">
          <span class="vp-pin">📍</span>
          <div>
            <h2 class="vp-titre">Vendeurs près de vous</h2>
            <p class="vp-sous">{{ vendeurs.length }} vendeur{{ vendeurs.length > 1 ? 's' : '' }} trouvé{{ vendeurs.length > 1 ? 's' : '' }} dans votre zone</p>
          </div>
        </div>
        <button @click="etat = 'idle'" class="btn-reset">✕ Réinitialiser</button>
      </div>

      <!-- Grille des 5 vendeurs proches -->
      <div class="vp-grille">
        <div v-for="v in vendeurs" :key="v.id" class="vp-card">

          <!-- Badge distance -->
          <div class="dist-badge">
            {{ v.distance_km < 1
              ? Math.round(v.distance_km * 1000) + ' m'
              : v.distance_km.toFixed(1) + ' km' }}
          </div>

          <!-- Header vendeur -->
          <div class="vp-card-head">
            <div class="vp-av">{{ v.name.charAt(0).toUpperCase() }}</div>
            <div class="vp-meta">
              <div class="vp-nom">{{ v.name }}</div>
              <div class="vp-ville">📍 {{ v.city }}</div>
            </div>
            <div v-if="v.nb_promos" class="vp-promo-badge">🔥 {{ v.nb_promos }}</div>
          </div>

          <!-- Produits du vendeur -->
          <div class="vp-produits">
            <div v-for="p in v.produits.slice(0, 3)" :key="p.id" class="vp-prod-ligne">
              <span class="vp-prod-emoji">{{ emojiCat(p.category) }}</span>
              <span class="vp-prod-nom">{{ p.name }}</span>
              <span class="vp-prod-prix">{{ Number(p.price).toLocaleString('fr-FR') }} MAD/{{ p.unit }}</span>
            </div>
            <div v-if="v.produits.length > 3" class="vp-plus">
              +{{ v.produits.length - 3 }} autre{{ v.produits.length - 3 > 1 ? 's' : '' }} produit{{ v.produits.length - 3 > 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Bouton WhatsApp -->
          <a :href="waLien(v)" target="_blank" class="vp-wa">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.852L.057 23.25a.75.75 0 0 0 .916.948l5.604-1.47A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.493-5.178-1.354l-.37-.214-3.827 1.004 1.021-3.73-.228-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Contacter {{ v.name.split(' ')[0] }}
          </a>

        </div>
      </div>

      <!-- Lien vers la carte complète -->
      <div class="vp-voir-carte">
        <RouterLink to="/carte" class="btn-carte">
          🗺️ Voir tous les vendeurs sur la carte
        </RouterLink>
      </div>

    </template>

  </section>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const etat      = ref('idle') // idle | gps | api | ok | erreur
const erreurMsg = ref('')
const vendeurs  = ref([])

// ── Emoji catégorie ─────────────────────────────────────────
const emojiCat = (cat) => ({
  Sardine:'🐟', Thon:'🐠', Crevette:'🦐', Mérou:'🐡',
  Homard:'🦞', Calamar:'🦑', Dorade:'🐠', Bar:'🐟',
  Pieuvre:'🐙', Moule:'🦪', Sole:'🐟', Capitaine:'🐟',
})[cat] || '🐟'

// ── Lien WhatsApp ───────────────────────────────────────────
const waLien = (v) => {
  const num = (v.whatsapp || v.phone || '').replace(/[\s\-\+\(\)]/g, '')
  const prodList = v.produits.slice(0, 3).map(p => `• ${p.name} ${p.price} MAD/${p.unit}`).join('\n')
  const msg = encodeURIComponent(`Bonjour ${v.name.split(' ')[0]} ! 🐟\nJe suis près de vous et intéressé par vos produits :\n${prodList}\nDisponible ? (SamakMarket)`)
  return num ? `https://wa.me/${num}?text=${msg}` : 'https://wa.me/'
}

// ── Localisation + appel API ────────────────────────────────
const localiser = () => {
  if (!navigator.geolocation) {
    erreurMsg.value = 'Géolocalisation non supportée par votre navigateur'
    etat.value = 'erreur'
    return
  }

  etat.value = 'gps'

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      etat.value = 'api'
      try {
        const { data } = await api.get('/vendeurs/proches', {
          params: {
            lat:   pos.coords.latitude,
            lng:   pos.coords.longitude,
            limit: 5,
          }
        })
        vendeurs.value = data
        etat.value     = vendeurs.value.length ? 'ok' : 'erreur'
        if (!vendeurs.value.length) erreurMsg.value = 'Aucun vendeur géolocalisé dans votre zone pour le moment'
      } catch (e) {
        etat.value = 'erreur'
        erreurMsg.value = 'Impossible de charger les vendeurs proches'
      }
    },
    (err) => {
      etat.value = 'erreur'
      const msgs = { 1: 'Accès refusé à la localisation', 2: 'Position indisponible', 3: 'Délai dépassé' }
      erreurMsg.value = msgs[err.code] || 'Erreur de localisation'
    },
    { timeout: 10000, enableHighAccuracy: true }
  )
}
</script>

<style scoped>
.vp-section {
  background: #020e23;
  border-top: 1px solid rgba(255,255,255,.06);
  border-bottom: 1px solid rgba(255,255,255,.06);
  padding: 24px;
}

/* ── Invite ── */
.vp-invite {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  max-width: 860px; margin: 0 auto;
}
.vp-invite-icon { font-size: 2rem; flex-shrink: 0; }
.vp-invite-txt  { flex: 1; min-width: 200px; }
.vp-invite-txt h3 { color: white; font-weight: 800; font-size: .95rem; }
.vp-invite-txt p  { color: rgba(255,255,255,.35); font-size: .8rem; margin-top: 2px; }

.btn-invite {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 99px;
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23; font-weight: 800; font-size: .85rem;
  border: none; cursor: pointer; transition: all .2s; white-space: nowrap;
  box-shadow: 0 4px 16px rgba(212,175,55,.3);
}
.btn-invite:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,175,55,.4); }

/* ── Loading ── */
.vp-loading {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 24px; color: rgba(255,255,255,.3); font-size: .85rem;
}
.vp-loading-fish { font-size: 2rem; animation: fish 1.2s ease-in-out infinite; }
@keyframes fish {
  0%,100% { transform: translateX(0) rotate(0); }
  25%     { transform: translateX(8px) rotate(5deg); }
  75%     { transform: translateX(-8px) rotate(-5deg); }
}

/* ── Erreur ── */
.vp-erreur {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 16px; color: rgba(255,200,100,.7); font-size: .85rem; flex-wrap: wrap;
}
.btn-retry {
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
  color: rgba(255,255,255,.5); font-size: .78rem; padding: 5px 14px;
  border-radius: 99px; cursor: pointer; transition: all .2s;
}
.btn-retry:hover { color: white; }

/* ── Header résultats ── */
.vp-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; flex-wrap: wrap; gap: 10px;
}
.vp-header-left { display: flex; align-items: center; gap: 10px; }
.vp-pin    { font-size: 1.4rem; }
.vp-titre  { color: white; font-weight: 800; font-size: 1rem; }
.vp-sous   { color: rgba(255,255,255,.3); font-size: .72rem; }
.btn-reset {
  background: none; border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.3); font-size: .75rem; padding: 4px 10px;
  border-radius: 99px; cursor: pointer; transition: all .2s;
}
.btn-reset:hover { color: rgba(255,255,255,.6); }

/* ── Grille vendeurs ── */
.vp-grille {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px; margin-bottom: 16px;
}

/* ── Carte vendeur ── */
.vp-card {
  background: linear-gradient(145deg, #0d1f3c, #071428);
  border: 1px solid rgba(212,175,55,.15);
  border-radius: 14px; padding: 14px;
  position: relative; transition: transform .2s, box-shadow .2s;
}
.vp-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,.4), 0 0 16px rgba(212,175,55,.08);
}

/* Badge distance */
.dist-badge {
  position: absolute; top: 10px; right: 10px;
  background: rgba(13,202,240,.12); border: 1px solid rgba(13,202,240,.25);
  color: #0dcaf0; font-size: .65rem; font-weight: 800;
  padding: 3px 8px; border-radius: 99px;
}

/* Header carte vendeur */
.vp-card-head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.vp-av {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23; font-weight: 900; font-size: .85rem;
  display: flex; align-items: center; justify-content: center;
}
.vp-meta  { flex: 1; min-width: 0; }
.vp-nom   { color: white; font-weight: 700; font-size: .82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vp-ville { color: rgba(255,255,255,.35); font-size: .68rem; }
.vp-promo-badge {
  background: rgba(212,175,55,.12); color: #f5d57a;
  font-size: .65rem; font-weight: 700; padding: 2px 6px; border-radius: 99px;
}

/* Produits */
.vp-produits {
  background: rgba(0,0,0,.25); border-radius: 8px;
  border: 1px solid rgba(255,255,255,.05);
  margin-bottom: 10px; overflow: hidden;
}
.vp-prod-ligne {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,.04);
  font-size: .75rem;
}
.vp-prod-ligne:last-child { border-bottom: none; }
.vp-prod-emoji { font-size: .9rem; flex-shrink: 0; }
.vp-prod-nom   { color: rgba(255,255,255,.7); flex: 1; }
.vp-prod-prix  { color: #f5d57a; font-weight: 700; white-space: nowrap; }
.vp-plus       { padding: 5px 10px; color: rgba(255,255,255,.2); font-size: .7rem; font-style: italic; }

/* WhatsApp */
.vp-wa {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 8px;
  background: linear-gradient(135deg, #128c7e, #25d366);
  color: white; font-weight: 700; font-size: .78rem;
  border-radius: 8px; text-decoration: none; transition: all .2s;
}
.vp-wa:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,211,102,.3); }

/* Voir carte */
.vp-voir-carte { text-align: center; margin-top: 6px; }
.btn-carte {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px; border-radius: 99px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.4); font-size: .78rem; font-weight: 600;
  text-decoration: none; transition: all .2s;
}
.btn-carte:hover { color: white; background: rgba(255,255,255,.1); }

@media (max-width: 640px) {
  .vp-grille { grid-template-columns: 1fr; }
  .vp-invite { flex-direction: column; text-align: center; }
}
</style>
