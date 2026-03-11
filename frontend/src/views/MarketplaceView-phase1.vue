<template>
  <div class="min-h-screen bg-blue-50">

    <NavBar />
    

    <!-- ══ HERO avec fond dynamique par ville ══ -->
    <section class="hero-section relative overflow-hidden text-white py-16 px-4 text-center">

      <!-- FOND : utilise background-image CSS inline = garanti de fonctionner -->
      <!--
        On utilise un div avec background-image au lieu de <img>
        Car background-image ne "casse" pas si le fichier manque
        Et supporte le cross-fade via opacity transition
      -->

      <!-- Couche A -->
      <div
        class="ville-bg-div"
        :class="{ 'is-visible': bgCouche.a.visible }"
        :style="{ backgroundImage: `url('${bgCouche.a.src}')` }"
      ></div>
      <!-- Couche B -->
      <div
        class="ville-bg-div"
        :class="{ 'is-visible': bgCouche.b.visible }"
        :style="{ backgroundImage: `url('${bgCouche.b.src}')` }"
      ></div>

      <!-- Overlay bleu permanent -->
      <div class="absolute inset-0 z-[1]"
        style="background:linear-gradient(160deg,rgba(2,14,35,0.88) 0%,rgba(4,26,60,0.78) 45%,rgba(8,50,90,0.60) 70%,rgba(2,14,35,0.82) 100%);">
      </div>

      <!-- Flash spectaculaire au changement -->
      <div class="ville-flash z-[2]" :class="{ 'flash-actif': villeChange }"></div>

      <!-- Contenu au-dessus de tout -->
      <div class="relative z-[3]">

        <!-- Badge ville -->
        <div class="flex justify-center mb-6">
          <div class="badge-ville inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
               :class="{ 'badge-pop': villeChange }">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            📍 {{ filtres.city && filtres.city !== '__ici__' ? filtres.city + ' · Maroc' : 'Maroc · Poisson frais direct' }}
          </div>
        </div>

        <!-- Titre -->
        <h1 class="text-4xl md:text-5xl font-extrabold mb-3"
            :class="{ 'titre-glide': villeChange }">
          🌊 Poisson frais,
          <span class="text-amber-400">prix direct pêcheur</span>
        </h1>

        <p class="text-blue-200 mb-10 text-lg">
          Contactez les vendeurs directement — aucun intermédiaire
        </p>

        <!-- Barre de recherche -->
        <div class="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          <input
            v-model="filtres.search"
            @input="rechercherAvecDelai"
            placeholder="🔍 Sardine, thon, crevettes..."
            class="flex-1 min-w-64 bg-white/10 border border-white/30 text-white placeholder-blue-200 rounded-xl px-5 py-3 backdrop-blur focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <select
            v-model="filtres.city"
            @change="onVilleChange"
            class="bg-white/10 border border-white/30 text-white rounded-xl px-4 py-3 backdrop-blur focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value=""           class="text-gray-800 bg-white">📍 Toutes les villes</option>
            <option value="Tanger"     class="text-gray-800 bg-white">🌊 Tanger</option>
            <option value="Casablanca" class="text-gray-800 bg-white">Casablanca</option>
            <option value="Agadir"     class="text-gray-800 bg-white">Agadir</option>
             <option value="Rabat"     class="text-gray-800 bg-white">Rabat</option>
              <option value="Eljadida"     class="text-gray-800 bg-white">Eljadida</option>
               <option value="larache"     class="text-gray-800 bg-white">larache</option>
            <option value="Safi"      class="text-gray-800 bg-white">Safi</option>
            <option value="Dakhla"     class="text-gray-800 bg-white">Dakhla</option>
          </select>
          <button @click="chargerProduits"
            class="bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold px-6 py-3 rounded-xl transition">
            Chercher
          </button>
        </div>

      </div>
    </section>
<ProductPromo />
    <!-- STATS -->
    <div class="bg-white border-b border-blue-100 px-8 py-3 flex justify-center gap-10 text-sm font-semibold text-blue-800">
      <span>🐟 <strong>{{ store.pagination.total }}</strong> produits disponibles</span>
      <span class="hidden md:block">📍 Maroc & Afrique </span>
    </div>

    <!-- FILTRES + SÉLECTEUR VUE -->
    <div class="max-w-6xl mx-auto px-4 py-5 flex flex-wrap gap-2 items-center justify-between">
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-sm text-gray-500 mr-2">Catégorie :</span>
        <button @click="filtrerCategorie('')"
          :class="['px-4 py-2 rounded-full text-sm font-semibold transition border',
            filtres.category === '' ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400']">
          Tout
        </button>
        <button v-for="cat in categories" :key="cat.valeur" @click="filtrerCategorie(cat.valeur)"
          :class="['px-4 py-2 rounded-full text-sm font-semibold transition border',
            filtres.category === cat.valeur ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400']">
          {{ cat.emoji }} {{ cat.label }}
        </button>
      </div>
      <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
        <button @click="modeVue = 'grille4'" :class="['p-2 rounded-lg transition', modeVue === 'grille4' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-blue-800']" title="Grille 4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="10" y="1" width="7" height="7" rx="1"/><rect x="1" y="10" width="7" height="7" rx="1"/><rect x="10" y="10" width="7" height="7" rx="1"/></svg>
        </button>
        <button @click="modeVue = 'grille2'" :class="['p-2 rounded-lg transition', modeVue === 'grille2' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-blue-800']" title="Grille 2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="1" width="7" height="16" rx="1"/><rect x="10" y="1" width="7" height="16" rx="1"/></svg>
        </button>
        <button @click="modeVue = 'liste'" :class="['p-2 rounded-lg transition', modeVue === 'liste' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-blue-800']" title="Liste">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="2" width="4" height="4" rx="0.5"/><rect x="7" y="3" width="10" height="2" rx="1"/><rect x="1" y="7" width="4" height="4" rx="0.5"/><rect x="7" y="8" width="10" height="2" rx="1"/><rect x="1" y="12" width="4" height="4" rx="0.5"/><rect x="7" y="13" width="10" height="2" rx="1"/></svg>
        </button>
      </div>
    </div>

    <!-- GRILLE PRODUITS -->
    <main class="max-w-6xl mx-auto px-4 pb-16">
      <div v-if="store.chargement" class="text-center py-20">
        <div class="text-5xl mb-4 animate-bounce">🐟</div>
        <p class="text-gray-500">Chargement des produits...</p>
      </div>
      <div v-else-if="store.erreur" class="text-center py-20">
        <div class="text-5xl mb-4">😕</div>
        <p class="text-red-500 font-medium">{{ store.erreur }}</p>
        <button @click="chargerProduits" class="mt-4 bg-blue-800 text-white px-6 py-2 rounded-xl hover:bg-blue-700">Réessayer</button>
      </div>
      <div v-else-if="store.produits.length === 0" class="text-center py-20">
        <div class="text-5xl mb-4">🔍</div>
        <p class="text-gray-500 font-medium">Aucun produit trouvé</p>
      </div>
      <div v-else :class="[
          modeVue === 'grille4' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5' :
          modeVue === 'grille2' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'flex flex-col gap-4']">
        <ProductCard v-for="produit in store.produits" :key="produit.id" :produit="produit" :mode="modeVue" />
      </div>
      <div v-if="store.pagination.pages > 1" class="flex justify-center gap-2 mt-10">
        <button @click="changerPage(store.pagination.page - 1)" :disabled="store.pagination.page === 1"
          class="px-4 py-2 rounded-xl border bg-white disabled:opacity-30 hover:border-blue-400">← Précédent</button>
        <button v-for="p in store.pagination.pages" :key="p" @click="changerPage(p)"
          :class="['px-4 py-2 rounded-xl border font-semibold transition', p === store.pagination.page ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 hover:border-blue-400']">{{ p }}</button>
        <button @click="changerPage(store.pagination.page + 1)" :disabled="store.pagination.page === store.pagination.pages"
          class="px-4 py-2 rounded-xl border bg-white disabled:opacity-30 hover:border-blue-400">Suivant →</button>
      </div>
    </main>

    <FooterSamak />
  </div>
  <ChatBot />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import NavBar       from '../components/NavBar.vue'
import ProductCard  from '../components/ProductCard.vue'
import ProductPromo from '../components/ProductPromo.vue'
import FooterSamak  from '../components/FooterSamak.vue'
import ChatBot      from '../components/ChatBot.vue'

const store   = useProductStore()
const modeVue = ref('grille4')
const filtres = ref({ search: '', city: '', category: '', page: 1, limit: 12 })

const categories = [
  { valeur: 'Sardine',   label: 'Sardine',   emoji: '🐟' },
  { valeur: 'Thon',      label: 'Thon',      emoji: '🐠' },
  { valeur: 'Crevette',  label: 'Crevette',  emoji: '🦐' },
  { valeur: 'Mérou',     label: 'Mérou',     emoji: '🐡' },
  { valeur: 'Homard',    label: 'Homard',    emoji: '🦞' },
  { valeur: 'Capitaine', label: 'Capitaine', emoji: '🐟' },
]

// ── Photos par ville ─────────────────────────────────────────
// Mets tes images dans : frontend/public/images/villes/
// Si le fichier manque → fond bleu uni s'affiche (pas d'erreur)
//
// Tes photos sont accessibles via /public/images/villes/
// (car elles sont dans frontend/public/public/images/villes/)
const photoVilles = {
  '':           '/images/Villes/default.jpg',
  'Tanger':     '/images/Villes/tanger.jpg',
  'Casablanca': '/images/Villes/casablanca.jpg',
  'Agadir':     '/images/Villes/agadir.jpg',
  'Rabat':      '/images/Villes/rabat.jpg',
  'Dakhla':     '/images/Villes/dakhla.jpg', 
  'eljadida':     '/images/Villes/eljadida.jpg',
  'safi':     '/images/Villes/safi.jpg', 
'larache':     '/images/Villes/larache.jpg', 
  'Dakhla':     '/images/Villes/dakhla.jpg', 
}

// 2 couches pour cross-fade permanent
// Principe :
//   - couche active   = toujours visible (opacity 1), ne disparaît JAMAIS
//   - couche suivante = on la prépare en dessous, puis on la fait monter
//   - une fois la transition finie, on swap et l'ancienne devient la "réserve"
const bgCouche = ref({
  a: { src: photoVilles[''], visible: true  },
  b: { src: photoVilles[''], visible: false },
})
let coucheActive  = 'a'
const villeChange = ref(false)

const changerFond = (ville) => {
  const src  = photoVilles[ville] ?? photoVilles['']
  const next = coucheActive === 'a' ? 'b' : 'a'

  // 1. Charge la nouvelle image dans la couche cachée
  bgCouche.value[next].src     = src
  bgCouche.value[next].visible = false

  // 2. Flash spectaculaire
  villeChange.value = false
  requestAnimationFrame(() => {
    villeChange.value = true
    setTimeout(() => { villeChange.value = false }, 800)
  })

  // 3. Cross-fade : rend la nouvelle visible
  //    L'ancienne reste visible pendant toute la transition (pas de blanc)
  //    On ne cache l'ancienne QU'APRÈS la fin de la transition CSS (1.3s)
  // Affiche la nouvelle image
  setTimeout(() => {
    bgCouche.value[next].visible = true
  }, 50)

  // Cache l'ancienne SEULEMENT après que la nouvelle soit bien visible (2s)
  // Valeur haute volontairement : garantit qu'on ne voit JAMAIS de blanc
  setTimeout(() => {
    bgCouche.value[coucheActive].visible = false
    coucheActive = next
  }, 2000)
}

const onVilleChange = () => {
  changerFond(filtres.value.city)
  filtres.value.page = 1
  chargerProduits()
}

const chargerProduits = () => {
  const p = {}
  if (filtres.value.search)   p.search   = filtres.value.search
  if (filtres.value.city)     p.city     = filtres.value.city
  if (filtres.value.category) p.category = filtres.value.category
  p.page  = filtres.value.page
  p.limit = filtres.value.limit
  store.chargerProduits(p)
}

const filtrerCategorie = (cat) => { filtres.value.category = cat; filtres.value.page = 1; chargerProduits() }
const changerPage = (p) => { filtres.value.page = p; chargerProduits(); window.scrollTo({ top: 0, behavior: 'smooth' }) }

let timeout = null
const rechercherAvecDelai = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => { filtres.value.page = 1; chargerProduits() }, 500)
}

onMounted(() => chargerProduits())
</script>

<style scoped>
.hero-section {
  min-height: 340px;
}

/* ── Couches de fond (div au lieu de img = plus fiable avec Vite) ── */
.ville-bg-div {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transform: scale(1.06);
  transition: opacity 1.3s ease-in-out, transform 1.8s ease-out;
  will-change: opacity, transform;
}
.ville-bg-div.is-visible {
  opacity: 1;
  transform: scale(1); /* Ken Burns : zoom avant → arrêt */
}

/* ── Flash lumineux ── */
.ville-flash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    105deg,
    transparent 15%,
    rgba(0,180,216,0.25) 45%,
    rgba(255,255,255,0.12) 50%,
    rgba(0,180,216,0.15) 55%,
    transparent 85%
  );
  opacity: 0;
}
.ville-flash.flash-actif {
  animation: cityFlash 0.8s ease-out forwards;
}
@keyframes cityFlash {
  0%   { opacity: 0; transform: translateX(-110%); }
  30%  { opacity: 1; }
  70%  { opacity: 0.6; }
  100% { opacity: 0; transform: translateX(110%); }
}

/* ── Badge ville ── */
.badge-ville {
  background: rgba(0,180,216,0.15);
  border: 1px solid rgba(0,180,216,0.35);
  color: #90e0ef;
  backdrop-filter: blur(8px);
}
.badge-pop { animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes badgePop {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.18); }
}

/* ── Titre ── */
.titre-glide { animation: titreGlide 0.7s cubic-bezier(0.22,1,0.36,1); }
@keyframes titreGlide {
  0%   { opacity: 0.3; transform: translateY(10px); filter: blur(6px); }
  100% { opacity: 1;   transform: translateY(0);    filter: blur(0); }
}
</style>