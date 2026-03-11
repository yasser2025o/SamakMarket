<!-- =============================================================
  views/VendeurCarteView.vue — SamakMarket
  Carte interactive des vendeurs géolocalisés
  Librairie : Leaflet (via CDN dans index.html)
============================================================= -->
<template>
  <div class="carte-page">
    <NavBar />

    <!-- ── HEADER ── -->
    <div class="carte-header">
      <div class="carte-header-left">
        <RouterLink to="/" class="btn-retour">← Marketplace</RouterLink>
        <div>
          <h1 class="carte-titre">🗺️ Vendeurs sur la carte</h1>
          <p class="carte-sous">
            <span class="dot-live"></span>
            {{ vendeurs.length }} vendeur{{ vendeurs.length > 1 ? 's' : '' }} géolocalisé{{ vendeurs.length > 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Bouton GPS -->
      <button @click="centrerSurMoi" :class="['btn-gps', gpsActif && 'btn-gps-on']" :disabled="chargementGPS">
        <span v-if="chargementGPS" class="spin">⟳</span>
        <span v-else>📡</span>
        {{ chargementGPS ? 'Localisation...' : gpsActif ? 'Ma position' : 'Près de moi' }}
      </button>
    </div>

    <!-- ── BODY : liste + carte ── -->
    <div class="carte-body">

      <!-- Liste latérale -->
      <div class="carte-liste">

        <!-- Info GPS actif -->
        <div v-if="gpsActif" class="gps-info">
          <span class="gps-info-dot"></span>
          Triés par distance depuis vous
        </div>

        <!-- Recherche -->
        <div class="liste-search">
          <span>🔍</span>
          <input v-model="recherche" placeholder="Chercher un vendeur..." class="liste-search-input" />
        </div>

        <!-- Skeleton chargement -->
        <div v-if="chargement" class="skeletons">
          <div v-for="n in 5" :key="n" class="skeleton-item">
            <div class="sk-av"></div>
            <div class="sk-lines">
              <div class="sk-l1"></div>
              <div class="sk-l2"></div>
            </div>
          </div>
        </div>

        <!-- Vide -->
        <div v-else-if="vendeursFiltres.length === 0" class="liste-vide">
          <span class="text-3xl">🐟</span>
          <p>Aucun vendeur géolocalisé</p>
          <p class="liste-vide-sous">Les vendeurs doivent activer leur position lors de l'inscription</p>
        </div>

        <!-- Items vendeurs -->
        <div v-else class="liste-items">
          <div
            v-for="v in vendeursFiltres" :key="v.id"
            @click="centrerSurVendeur(v)"
            :class="['liste-item', vendeurActif?.id === v.id && 'liste-item-on']"
          >
            <div class="item-av">{{ v.name.charAt(0).toUpperCase() }}</div>
            <div class="item-info">
              <div class="item-nom">{{ v.name }}</div>
              <div class="item-ville">📍 {{ v.city || 'Maroc' }}</div>
              <div class="item-stats">
                🐟 {{ v.nb_produits }} produit{{ v.nb_produits > 1 ? 's' : '' }}
                <span v-if="v.nb_promos" class="item-promo">🔥 {{ v.nb_promos }}</span>
              </div>
            </div>
            <div v-if="v.distance !== undefined" class="item-dist">
              {{ v.distance < 1 ? Math.round(v.distance * 1000) + 'm' : v.distance.toFixed(1) + 'km' }}
            </div>
            <div v-else class="item-chevron">›</div>
          </div>
        </div>

      </div>

      <!-- Carte Leaflet -->
      <div class="carte-map-wrap">
        <div id="samak-map" class="carte-map"></div>

        <!-- Légende -->
        <div class="carte-legende">
          <div class="leg-item"><span class="leg-dot leg-or"></span> Vendeur actif</div>
          <div class="leg-item"><span class="leg-dot leg-rouge"></span> Promotions 🔥</div>
          <div v-if="gpsActif" class="leg-item"><span class="leg-dot leg-bleu"></span> Votre position</div>
        </div>

        <!-- Message si carte pas chargée -->
        <div v-if="!mapPrete" class="carte-loading">
          <div class="fish-bounce">🗺️</div>
          <p>Chargement de la carte...</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import api    from '@/services/api'

// ── État ────────────────────────────────────────────────────
const vendeurs      = ref([])
const chargement    = ref(true)
const mapPrete      = ref(false)
const vendeurActif  = ref(null)
const gpsActif      = ref(false)
const chargementGPS = ref(false)
const maPosition    = ref(null)
const recherche     = ref('')

let map       = null
let markers   = {}
let markerMoi = null

// ── Haversine distance ──────────────────────────────────────
const haversine = (lat1, lng1, lat2, lng2) => {
  const R  = 6371
  const dL = (lat2 - lat1) * Math.PI / 180
  const dG = (lng2 - lng1) * Math.PI / 180
  const a  = Math.sin(dL/2) ** 2
           + Math.cos(lat1 * Math.PI / 180)
           * Math.cos(lat2 * Math.PI / 180)
           * Math.sin(dG/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Vendeurs filtrés + triés ────────────────────────────────
const vendeursFiltres = computed(() => {
  let liste = vendeurs.value

  // Filtre recherche
  const q = recherche.value.toLowerCase().trim()
  if (q) liste = liste.filter(v =>
    v.name.toLowerCase().includes(q) ||
    (v.city || '').toLowerCase().includes(q)
  )

  // Ajoute distance si GPS actif
  if (maPosition.value) {
    liste = liste.map(v => ({
      ...v,
      distance: v.latitude && v.longitude
        ? haversine(maPosition.value.lat, maPosition.value.lng, parseFloat(v.latitude), parseFloat(v.longitude))
        : undefined
    })).sort((a, b) => {
      if (a.distance === undefined) return 1
      if (b.distance === undefined) return -1
      return a.distance - b.distance
    })
  }

  return liste
})

// ── Icône marker personnalisée ──────────────────────────────
const creerIcone = (promo = false) => {
  const couleur = promo ? '#e74c3c' : '#d4af37'
  const emoji   = promo ? '🔥' : '🐟'
  return window.L.divIcon({
    className: '',
    html: `<div style="
      width:38px; height:38px; border-radius:50% 50% 50% 0;
      background:${couleur}; border:3px solid white;
      box-shadow:0 4px 14px rgba(0,0,0,.4);
      transform:rotate(-45deg);
      display:flex; align-items:center; justify-content:center;
    "><span style="transform:rotate(45deg);font-size:15px">${emoji}</span></div>`,
    iconSize:   [38, 38],
    iconAnchor: [19, 38],
    popupAnchor:[0, -42],
  })
}

// ── Popup HTML d'un vendeur ─────────────────────────────────
const creerPopup = (v) => {
  const num     = (v.whatsapp || v.phone || '').replace(/[\s\-\+\(\)]/g, '')
  const prodList = (v.produits || []).slice(0, 3)
    .map(p => `<div style="display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid #f3f4f6">
      <span style="color:#374151;font-size:.78rem">${p.name}</span>
      <span style="color:#d4af37;font-weight:700;font-size:.78rem;white-space:nowrap">${p.price} MAD</span>
    </div>`).join('')

  return `
    <div style="font-family:'Segoe UI',sans-serif;min-width:220px;padding:4px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#f5d57a);color:#020e23;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.9rem">
          ${v.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight:800;font-size:.9rem;color:#111">${v.name}</div>
          <div style="color:#9ca3af;font-size:.72rem">📍 ${v.city || 'Maroc'}</div>
        </div>
      </div>

      ${prodList ? `
      <div style="background:#f9fafb;border-radius:8px;padding:8px;margin-bottom:10px">
        ${prodList}
        ${(v.produits || []).length > 3 ? `<div style="color:#9ca3af;font-size:.7rem;margin-top:4px">+${v.produits.length - 3} autre(s)...</div>` : ''}
      </div>` : ''}

      ${num ? `
      <a href="https://wa.me/${num}?text=${encodeURIComponent(`Bonjour ${v.name.split(' ')[0]} ! 🐟 Je vous ai trouvé sur SamakMarket, êtes-vous disponible ?`)}"
        target="_blank"
        style="display:flex;align-items:center;justify-content:center;gap:6px;background:#25d366;color:white;text-decoration:none;padding:8px;border-radius:8px;font-weight:700;font-size:.82rem">
        💬 Contacter sur WhatsApp
      </a>` : '<div style="color:#9ca3af;font-size:.75rem;text-align:center">Pas de contact disponible</div>'}
    </div>
  `
}

// ── Place tous les markers ──────────────────────────────────
const placerMarkers = () => {
  if (!map || !window.L) return
  Object.values(markers).forEach(m => map.removeLayer(m))
  markers = {}

  vendeurs.value.forEach(v => {
    if (!v.latitude || !v.longitude) return
    const marker = window.L.marker(
      [parseFloat(v.latitude), parseFloat(v.longitude)],
      { icon: creerIcone(v.nb_promos > 0) }
    )
    marker.bindPopup(window.L.popup({ maxWidth: 280 }).setContent(creerPopup(v)))
    marker.on('click', () => { vendeurActif.value = v })
    marker.addTo(map)
    markers[v.id] = marker
  })
}

// ── Init carte Leaflet ──────────────────────────────────────
const initCarte = () => {
  if (!window.L) { setTimeout(initCarte, 300); return }

  map = window.L.map('samak-map', {
    center: [31.5, -7.0],
    zoom:   6,
    zoomControl: true,
  })

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  mapPrete.value = true
  placerMarkers()
}

// ── Centrer sur un vendeur ──────────────────────────────────
const centrerSurVendeur = (v) => {
  vendeurActif.value = v
  if (!v.latitude || !v.longitude || !map) return
  map.flyTo([parseFloat(v.latitude), parseFloat(v.longitude)], 14, { duration: 1.2 })
  setTimeout(() => markers[v.id]?.openPopup(), 1300)
}

// ── GPS ─────────────────────────────────────────────────────
const centrerSurMoi = () => {
  if (!navigator.geolocation) return
  chargementGPS.value = true

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      maPosition.value    = { lat, lng }
      gpsActif.value      = true
      chargementGPS.value = false

      if (markerMoi) map.removeLayer(markerMoi)
      markerMoi = window.L.circleMarker([lat, lng], {
        radius: 10, fillColor: '#0dcaf0', color: 'white',
        weight: 3, fillOpacity: 1,
        pane: 'markerPane',
      }).addTo(map).bindPopup('<b>📍 Vous êtes ici</b>')

      map.flyTo([lat, lng], 10, { duration: 1.5 })
    },
    () => { chargementGPS.value = false },
    { timeout: 8000, enableHighAccuracy: true }
  )
}

// ── Chargement données ──────────────────────────────────────
onMounted(async () => {
  try {
    const { data } = await api.get('/vendeurs/carte')
    vendeurs.value = data
  } catch (e) {
    console.error('Erreur chargement vendeurs carte:', e)
  } finally {
    chargement.value = false
  }

  await new Promise(r => setTimeout(r, 150))
  initCarte()
})

onUnmounted(() => {
  if (map) { map.remove(); map = null }
})
</script>

<style scoped>
/* ══ PAGE ════════════════════════════════════════════════ */
.carte-page {
  height: 100vh; display: flex; flex-direction: column;
  background: #020c1b; overflow: hidden;
}

/* ══ HEADER ══════════════════════════════════════════════ */
.carte-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; flex-shrink: 0;
  background: rgba(2,14,35,.95); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,.07);
  flex-wrap: wrap; gap: 10px;
}
.carte-header-left { display: flex; align-items: center; gap: 14px; }
.btn-retour {
  color: rgba(255,255,255,.35); font-size: .78rem; text-decoration: none;
  padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.1);
  transition: all .2s; white-space: nowrap;
}
.btn-retour:hover { color: white; border-color: rgba(255,255,255,.25); }
.carte-titre { color: white; font-size: .95rem; font-weight: 800; }
.carte-sous  { color: rgba(255,255,255,.3); font-size: .72rem; display: flex; align-items: center; gap: 5px; margin-top: 2px; }
.dot-live {
  width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

.btn-gps {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 99px;
  background: rgba(13,202,240,.08); border: 1px solid rgba(13,202,240,.2);
  color: #0dcaf0; font-size: .8rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
}
.btn-gps:hover     { background: rgba(13,202,240,.15); border-color: rgba(13,202,240,.4); }
.btn-gps-on        { background: rgba(13,202,240,.18) !important; border-color: rgba(13,202,240,.45) !important; }
.btn-gps:disabled  { opacity: .6; cursor: not-allowed; }
.spin { animation: sp .8s linear infinite; display: inline-block; }
@keyframes sp { to { transform: rotate(360deg); } }

/* ══ BODY ════════════════════════════════════════════════ */
.carte-body {
  display: flex; flex: 1; overflow: hidden;
}

/* ══ LISTE LATÉRALE ══════════════════════════════════════ */
.carte-liste {
  width: 300px; flex-shrink: 0;
  background: #040f20;
  border-right: 1px solid rgba(255,255,255,.07);
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* GPS info */
.gps-info {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; font-size: .72rem; color: #0dcaf0;
  background: rgba(13,202,240,.06); border-bottom: 1px solid rgba(13,202,240,.1);
  flex-shrink: 0;
}
.gps-info-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #0dcaf0; flex-shrink: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Recherche */
.liste-search {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,.05);
  flex-shrink: 0;
}
.liste-search span { color: rgba(255,255,255,.25); font-size: .85rem; }
.liste-search-input {
  background: none; border: none; outline: none;
  color: white; font-size: .82rem; width: 100%;
}
.liste-search-input::placeholder { color: rgba(255,255,255,.2); }

/* Skeletons */
.skeletons { padding: 8px; }
.skeleton-item {
  display: flex; gap: 10px; padding: 12px 10px;
  border-bottom: 1px solid rgba(255,255,255,.04);
  animation: shimmer 1.2s ease-in-out infinite;
}
@keyframes shimmer { 0%,100%{opacity:.4} 50%{opacity:.8} }
.sk-av    { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.08); flex-shrink:0; }
.sk-lines { flex:1; display:flex; flex-direction:column; gap:6px; justify-content:center; }
.sk-l1    { height:9px; background:rgba(255,255,255,.08); border-radius:4px; width:65%; }
.sk-l2    { height:7px; background:rgba(255,255,255,.05); border-radius:4px; width:40%; }

/* Vide */
.liste-vide {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; flex: 1; gap: 8px;
  color: rgba(255,255,255,.2); font-size: .85rem; text-align: center; padding: 24px;
}
.liste-vide-sous { font-size: .72rem; color: rgba(255,255,255,.12); margin-top: -4px; }

/* Items */
.liste-items { flex:1; overflow-y:auto; }
.liste-items::-webkit-scrollbar { width:3px; }
.liste-items::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:2px; }

.liste-item {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 14px; border-bottom: 1px solid rgba(255,255,255,.04);
  cursor: pointer; transition: all .15s;
}
.liste-item:hover   { background: rgba(255,255,255,.04); }
.liste-item-on      {
  background: rgba(212,175,55,.07) !important;
  border-left: 3px solid #d4af37;
  padding-left: 11px;
}

.item-av {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23; font-weight: 900; font-size: .82rem;
  display: flex; align-items: center; justify-content: center;
}
.item-info    { flex:1; min-width:0; }
.item-nom     { color:white; font-size:.82rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.item-ville   { color:rgba(255,255,255,.3); font-size:.68rem; }
.item-stats   { color:rgba(255,255,255,.25); font-size:.68rem; margin-top:1px; }
.item-promo   { color:#f5d57a; margin-left:4px; }
.item-dist    { color:#0dcaf0; font-size:.72rem; font-weight:700; flex-shrink:0; }
.item-chevron { color:rgba(255,255,255,.15); font-size:1.1rem; flex-shrink:0; }

/* ══ CARTE ═══════════════════════════════════════════════ */
.carte-map-wrap { flex:1; position:relative; }
.carte-map      { width:100%; height:100%; z-index:1; }

.carte-loading {
  position: absolute; inset: 0; z-index: 2;
  background: #040f20;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; color: rgba(255,255,255,.3); font-size: .85rem;
}
.fish-bounce { font-size: 2.5rem; animation: fb 1s ease-in-out infinite; }
@keyframes fb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

/* Légende */
.carte-legende {
  position: absolute; bottom: 20px; right: 20px; z-index: 999;
  background: rgba(2,14,35,.88); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.1); border-radius: 10px;
  padding: 10px 14px; display: flex; flex-direction: column; gap: 6px;
}
.leg-item { display:flex; align-items:center; gap:7px; color:rgba(255,255,255,.5); font-size:.72rem; }
.leg-dot  { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.leg-or   { background:#d4af37; }
.leg-rouge{ background:#e74c3c; }
.leg-bleu { background:#0dcaf0; }

/* ══ RESPONSIVE ══════════════════════════════════════════ */
@media (max-width: 768px) {
  .carte-body   { flex-direction: column; }
  .carte-liste  { width:100%; height:220px; border-right:none; border-bottom:1px solid rgba(255,255,255,.07); }
  .carte-map    { height:calc(100vh - 320px); }
}
</style>
