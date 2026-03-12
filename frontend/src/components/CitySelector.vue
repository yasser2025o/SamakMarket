<!-- =============================================================
  components/CitySelector.vue
  Sélecteur de ville visuel — SamakMarket

  USAGE dans MarketplaceView.vue :
    <CitySelector v-model="filtres.city" @change="chargerProduits" />

  PROPS :
    modelValue : string — ville sélectionnée (v-model)

  EVENTS :
    update:modelValue — ville choisie
    change            — déclenche le rechargement des produits
============================================================= -->
<template>
  <div class="city-selector">

    <!-- Label -->
    <div class="cs-label">
      <span class="cs-label-icon"> 📍 Villes  📍 </span>
      <span>Où cherchez-vous ?</span>
      <span v-if="villeActive" class="cs-label-active">— {{ villeActive }}</span>
    </div>

    <!-- Chips de villes -->
    <div class="cs-chips-row">

      <!-- Chip "Toutes les villes" -->
      <!-- <button>
        @click="choisir('')"
        :class="['cs-chip cs-chip-all', modelValue === '' && 'cs-chip-on']">
        🌍 Toutes
      </button> -->

       Chip GPS "Près de moi"
      <button
        @click="geoLocaliser"
        :class="['cs-chip cs-chip-gps', gpsActif && 'cs-chip-on']"
        :disabled="chargementGPS">
        <span v-if="chargementGPS" class="gps-spinner">⟳</span>
        <span v-else>📡</span>
        {{ chargementGPS ? 'Localisation...' : villeGPS ? villeGPS : 'Près de moi' }}
      </button> -->

      <!-- Séparateur -->
      <div class="cs-sep"></div>

      <!-- Chips villes marocaines -->
      <button
        v-for="v in villes"
        :key="v.nom"
        @click="choisir(v.nom)"
        :class="['cs-chip', modelValue === v.nom && 'cs-chip-on']">
        <span class="cs-chip-emoji">{{ v.emoji }}</span>
        <span class="cs-chip-nom">{{ v.nom }}</span>
        <!-- Nombre de produits si disponible -->
        <span v-if="v.count" class="cs-chip-count">{{ v.count }}</span>
      </button>

    </div>

    <!-- Message erreur GPS -->
    <div v-if="erreurGPS" class="cs-gps-err">
      ⚠️ {{ erreurGPS }}
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  // Optionnel : counts par ville depuis l'API
  countsByCity: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'change'])

// ── Villes disponibles ──────────────────────────────────────
const villes = computed(() => [
  { nom: 'Tanger',      emoji: '🌊', count: props.countsByCity['Tanger'] },
  { nom: 'Casablanca',  emoji: '🏙️', count: props.countsByCity['Casablanca'] },
  { nom: 'Agadir',      emoji: '🏖️', count: props.countsByCity['Agadir'] },
  { nom: 'Rabat',       emoji: '🏛️', count: props.countsByCity['Rabat'] },
  { nom: 'Dakhla',      emoji: '🏜️', count: props.countsByCity['Dakhla'] },
  { nom: 'Safi',        emoji: '⚓', count: props.countsByCity['Safi'] },
  { nom: 'Nador',       emoji: '🐟', count: props.countsByCity['Nador'] },
  { nom: 'Essaouira',   emoji: '🌬️', count: props.countsByCity['Essaouira'] },
  { nom: 'Al Hoceima',  emoji: '🏔️', count: props.countsByCity['Al Hoceima'] },
  { nom: 'Larache',     emoji: '🚢', count: props.countsByCity['Larache'] },
])

// Label de la ville active pour l'affichage
const villeActive = computed(() => props.modelValue || null)

// ── GPS ────────────────────────────────────────────────────
const villeGPS      = ref('')
const gpsActif      = ref(false)
const chargementGPS = ref(false)
const erreurGPS     = ref('')

// Table de correspondance coordonnées → ville marocaine
const coordsVersVille = (lat, lng) => {
  const zones = [
    { nom: 'Tanger',     latMin: 35.5, latMax: 36.1, lngMin: -5.9, lngMax: -5.6 },
    { nom: 'Casablanca', latMin: 33.4, latMax: 33.7, lngMin: -7.7, lngMax: -7.4 },
    { nom: 'Agadir',     latMin: 30.2, latMax: 30.6, lngMin: -9.7, lngMax: -9.4 },
    { nom: 'Rabat',      latMin: 33.9, latMax: 34.1, lngMin: -6.9, lngMax: -6.6 },
    { nom: 'Dakhla',     latMin: 23.5, latMax: 24.0, lngMin: -15.9, lngMax: -15.6 },
    { nom: 'Safi',       latMin: 32.2, latMax: 32.4, lngMin: -9.3, lngMax: -9.1 },
    { nom: 'Nador',      latMin: 35.0, latMax: 35.3, lngMin: -3.1, lngMax: -2.8 },
    { nom: 'Essaouira',  latMin: 31.4, latMax: 31.6, lngMin: -9.9, lngMax: -9.6 },
    { nom: 'Al Hoceima', latMin: 35.1, latMax: 35.3, lngMin: -4.0, lngMax: -3.7 },
    { nom: 'Larache',    latMin: 35.1, latMax: 35.3, lngMin: -6.2, lngMax: -6.0 },
  ]
  const trouve = zones.find(z =>
    lat >= z.latMin && lat <= z.latMax &&
    lng >= z.lngMin && lng <= z.lngMax
  )
  return trouve?.nom || null
}

const geoLocaliser = () => {
  if (!navigator.geolocation) {
    erreurGPS.value = 'Géolocalisation non supportée par votre navigateur'
    return
  }

  chargementGPS.value = true
  erreurGPS.value     = ''

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const ville = coordsVersVille(pos.coords.latitude, pos.coords.longitude)
      chargementGPS.value = false

      if (ville) {
        villeGPS.value = ville
        gpsActif.value = true
        choisir(ville)
      } else {
        // Hors zone connue → cherche quand même par "Toutes"
        villeGPS.value = 'Ma position'
        erreurGPS.value = 'Ville non reconnue — affichage de toutes les offres'
        choisir('')
      }
    },
    (err) => {
      chargementGPS.value = false
      gpsActif.value = false
      const msgs = {
        1: 'Accès à la localisation refusé',
        2: 'Position indisponible',
        3: 'Délai de localisation dépassé',
      }
      erreurGPS.value = msgs[err.code] || 'Erreur de localisation'
    },
    { timeout: 8000, maximumAge: 300000 }
  )
}

// ── Sélection d'une ville ──────────────────────────────────
const choisir = (ville) => {
  // Si on choisit manuellement une ville → désactive GPS
  if (ville !== villeGPS.value) gpsActif.value = false
  emit('update:modelValue', ville)
  emit('change')
}
</script>

<style scoped>
/* ══ Container ════════════════════════════════════════════ */
.city-selector {
  width: 100%;
  margin-bottom: 8px;
}

/* ══ Label ════════════════════════════════════════════════ */
.cs-label {
  display: flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,.4); font-size: .72rem;
  text-transform: uppercase; letter-spacing: .1em;
  margin-bottom: 10px; padding-left: 2px;
}
.cs-label-icon   { font-size: .9rem; }
.cs-label-active { color: #f5d57a; font-size: .75rem; text-transform: none; letter-spacing: 0; font-weight: 700; }

/* ══ Chips row ════════════════════════════════════════════ */
.cs-chips-row {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
}

/* Séparateur vertical entre GPS et villes */
.cs-sep {
  width: 1px; height: 28px; align-self: center;
  background: rgba(255,255,255,.1);
  flex-shrink: 0;
}

/* ══ Chip base ════════════════════════════════════════════ */
.cs-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 99px;
  font-size: .8rem; font-weight: 600;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.55);
  cursor: pointer; transition: all .2s;
  white-space: nowrap;
}
.cs-chip:hover {
  background: rgba(255,255,255,.12);
  color: white;
  border-color: rgba(255,255,255,.25);
  transform: translateY(-1px);
}

/* Chip "Toutes" */
.cs-chip-all {
  background: rgba(255,255,255,.08);
  border-color: rgba(255,255,255,.15);
}

/* Chip GPS */
.cs-chip-gps {
  background: rgba(13,202,240,.08);
  border-color: rgba(13,202,240,.2);
  color: #0dcaf0;
}
.cs-chip-gps:hover {
  background: rgba(13,202,240,.15);
  border-color: rgba(13,202,240,.35);
  color: #0dcaf0;
}
.cs-chip-gps:disabled { opacity: .6; cursor: not-allowed; transform: none; }

/* ══ Chip ACTIVE (ville sélectionnée) ═════════════════════ */
.cs-chip-on {
  background: linear-gradient(135deg, rgba(212,175,55,.25), rgba(245,213,122,.15)) !important;
  border-color: rgba(212,175,55,.5) !important;
  color: #f5d57a !important;
  box-shadow: 0 0 12px rgba(212,175,55,.2), inset 0 1px 0 rgba(255,255,255,.1);
  transform: translateY(-2px);
}

/* GPS actif */
.cs-chip-gps.cs-chip-on {
  background: linear-gradient(135deg, rgba(13,202,240,.2), rgba(13,202,240,.1)) !important;
  border-color: rgba(13,202,240,.4) !important;
  color: #0dcaf0 !important;
  box-shadow: 0 0 12px rgba(13,202,240,.2) !important;
}

/* Spinner GPS */
.gps-spinner {
  display: inline-block;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Emoji et nom dans chip */
.cs-chip-emoji { font-size: .85rem; }
.cs-chip-nom   { }

/* Compteur produits */
.cs-chip-count {
  background: rgba(255,255,255,.15);
  color: rgba(255,255,255,.5);
  font-size: .62rem; font-weight: 700;
  padding: 1px 5px; border-radius: 99px;
  min-width: 18px; text-align: center;
}
.cs-chip-on .cs-chip-count {
  background: rgba(212,175,55,.25);
  color: #f5d57a;
}

/* Erreur GPS */
.cs-gps-err {
  margin-top: 8px; padding: 6px 12px;
  background: rgba(255,100,100,.08); border: 1px solid rgba(255,100,100,.15);
  border-radius: 8px; color: #ff8080; font-size: .72rem;
}

/* ══ Mobile ═══════════════════════════════════════════════ */
@media (max-width: 640px) {
  .cs-chip { padding: 6px 11px; font-size: .75rem; }
  .cs-sep  { display: none; }
}
</style>
