<!-- =============================================================
  views/MarketplaceView.vue — VERSION CORRIGÉE
  ============================================================= -->

<template>
  <div class="min-h-screen bg-blue-50">

    <NavBar />
    <ProductPromo />

    <!-- HERO -->
    <section class="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 px-4 text-center">

      <!--
        ✅ UNE SEULE vidéo, HORS du h1, dans un div centré
        Avant : 2 vidéos + div DANS h1 = layout cassé
      -->
        <!-- -------------------video logo---------------------------- -->
      <!-- <div class="flex justify-center mb-6">
        <video
          autoplay
          loop
          muted
          playsinline
          class="logo-hero-video"
        >
          <source src="/logo-samak.webm" type="video/webm" />
          <source src="/logo-samak.mp4"  type="video/mp4" />
        </video>
      </div> -->

      <!-- Titre SANS vidéo dedans -->
      <h1 class="text-4xl md:text-5xl font-extrabold mb-3">
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
          @change="chargerProduits"
          class="bg-white/10 border border-white/30 text-white rounded-xl px-4 py-3 backdrop-blur focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="" class="text-gray-800">📍 Toutes les villes</option>
          <option value="Tanger"     class="text-gray-800">Tanger</option>
          <option value="Casablanca" class="text-gray-800">Casablanca</option>
          <option value="Agadir"     class="text-gray-800">Agadir</option>
          <option value="Rabat"      class="text-gray-800">Rabat</option>
          <option value="Dakhla"     class="text-gray-800">Dakhla</option>
        </select>
        <button
          @click="chargerProduits"
          class="bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold px-6 py-3 rounded-xl transition"
        >
          Chercher
        </button>
      </div>
    </section>

    <!-- STATS -->
    <div class="bg-white border-b border-blue-100 px-8 py-3 flex justify-center gap-10 text-sm font-semibold text-blue-800">
      <span>🐟 <strong>{{ store.pagination.total }}</strong> produits disponibles</span>
      <span class="hidden md:block">📍 Maroc & Afrique de l'Ouest</span>
    </div>

    <!-- FILTRES CATÉGORIE -->
    <!--
  ================================================================
  EXTRAIT À INSÉRER dans MarketplaceView.vue
  
  1. Dans <script setup> → ajouter modeVue
  2. Remplacer la section filtres catégorie + grille produits
  ================================================================
-->


<!-- ═══════════════════════════════════════════════════════
     DANS <script setup> — ajouter après les autres ref()
════════════════════════════════════════════════════════════
  
  // Mode d'affichage de la grille
  // 'grille4' = 4 colonnes (défaut)
  // 'grille2' = 2 colonnes
  // 'liste'   = liste détaillée
  const modeVue = ref('grille4')

══════════════════════════════════════════════════════════ -->


<!-- ═══════════════════════════════════════════════════════
     DANS <template> — Remplace la div des filtres catégorie
     (la div avec class="max-w-6xl mx-auto px-4 py-5 flex...")
════════════════════════════════════════════════════════════ -->

    <!-- FILTRES CATÉGORIE + SÉLECTEUR DE VUE -->
    <div class="max-w-6xl mx-auto px-4 py-5 flex flex-wrap gap-2 items-center justify-between">

      <!-- Filtres catégories (gauche) -->
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-sm text-gray-500 mr-2">Catégorie :</span>

        <button
          @click="filtrerCategorie('')"
          :class="['px-4 py-2 rounded-full text-sm font-semibold transition border',
            filtres.category === '' ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400']"
        >Tout</button>

        <button
          v-for="cat in categories" :key="cat.valeur"
          @click="filtrerCategorie(cat.valeur)"
          :class="['px-4 py-2 rounded-full text-sm font-semibold transition border',
            filtres.category === cat.valeur ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400']"
        >{{ cat.emoji }} {{ cat.label }}</button>
      </div>

      <!-- ─────────────────────────────────────────────────
        SÉLECTEUR DE VUE — 3 icônes (droite)
        
        Chaque bouton change modeVue.value
        :class dynamique = bouton actif en bleu, inactif en gris
        title = tooltip au survol pour expliquer le mode
      ───────────────────────────────────────────────────── -->
      <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">

        <!-- Mode Grille 4 colonnes -->
        <!--
          SVG = 4 petits carrés en 2x2
          Représente la vue grille dense (4 colonnes)
        -->
        <button
          @click="modeVue = 'grille4'"
          :class="['p-2 rounded-lg transition', modeVue === 'grille4' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-blue-800']"
          title="Grille 4 colonnes"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <!-- 4 carrés : haut-gauche, haut-droit, bas-gauche, bas-droit -->
            <rect x="1" y="1" width="7" height="7" rx="1"/>
            <rect x="10" y="1" width="7" height="7" rx="1"/>
            <rect x="1" y="10" width="7" height="7" rx="1"/>
            <rect x="10" y="10" width="7" height="7" rx="1"/>
          </svg>
        </button>

        <!-- Mode Grille 2 colonnes -->
        <!--
          SVG = 2 grands rectangles côte à côte
          Représente la vue grille large (2 colonnes)
        -->
        <button
          @click="modeVue = 'grille2'"
          :class="['p-2 rounded-lg transition', modeVue === 'grille2' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-blue-800']"
          title="Grille 2 colonnes"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <!-- 2 grands rectangles -->
            <rect x="1" y="1" width="7" height="16" rx="1"/>
            <rect x="10" y="1" width="7" height="16" rx="1"/>
          </svg>
        </button>

        <!-- Mode Liste détaillée -->
        <!--
          SVG = 3 lignes horizontales (style "hamburger")
          Représente la vue liste avec une ligne par produit
        -->
        <button
          @click="modeVue = 'liste'"
          :class="['p-2 rounded-lg transition', modeVue === 'liste' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-blue-800']"
          title="Liste détaillée"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <!-- 3 lignes horizontales avec petit carré à gauche -->
            <rect x="1" y="2"  width="4" height="4" rx="0.5"/>
            <rect x="7" y="3"  width="10" height="2" rx="1"/>
            <rect x="1" y="7"  width="4" height="4" rx="0.5"/>
            <rect x="7" y="8"  width="10" height="2" rx="1"/>
            <rect x="1" y="12" width="4" height="4" rx="0.5"/>
            <rect x="7" y="13" width="10" height="2" rx="1"/>
          </svg>
        </button>

      </div>
    </div>


    <!-- GRILLE DES PRODUITS — classe change selon modeVue -->
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
        <p class="text-gray-400 text-sm mt-1">Essayez avec d'autres filtres</p>
      </div>

      <!--
        La classe CSS du conteneur change selon modeVue :
        
        grille4 → grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
        grille2 → grid-cols-1 sm:grid-cols-2
        liste   → flex flex-col (une ligne par produit)
        
        :mode="modeVue" → passe le mode à chaque ProductCard
      -->
      <div
        v-else
        :class="[
          modeVue === 'grille4' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5' :
          modeVue === 'grille2' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' :
          'flex flex-col gap-4'
        ]"
      >
        <!--
          :mode="modeVue" = on passe le mode choisi à chaque ProductCard
          ProductCard utilise cette prop pour adapter son template
        -->
        <ProductCard
          v-for="produit in store.produits"
          :key="produit.id"
          :produit="produit"
          :mode="modeVue"
        />
      </div>

      <!-- PAGINATION -->
      <div v-if="store.pagination.pages > 1" class="flex justify-center gap-2 mt-10">
        <button @click="changerPage(store.pagination.page - 1)" :disabled="store.pagination.page === 1"
          class="px-4 py-2 rounded-xl border bg-white disabled:opacity-30 hover:border-blue-400">← Précédent</button>
        <button v-for="p in store.pagination.pages" :key="p" @click="changerPage(p)"
          :class="['px-4 py-2 rounded-xl border font-semibold transition',
            p === store.pagination.page ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-600 hover:border-blue-400']">{{ p }}</button>
        <button @click="changerPage(store.pagination.page + 1)" :disabled="store.pagination.page === store.pagination.pages"
          class="px-4 py-2 rounded-xl border bg-white disabled:opacity-30 hover:border-blue-400">Suivant →</button>
      </div>
    </main>

    <FooterSamak />
  </div>

  <!-- ChatBot flottant (en dehors du div principal) -->
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

const store = useProductStore()
const filtres = ref({ search: '', city: '', category: '', page: 1, limit: 12 })
const categories = [
  { valeur: 'Sardine',   label: 'Sardine',   emoji: '🐟' },
  { valeur: 'Thon',      label: 'Thon',      emoji: '🐠' },
  { valeur: 'Crevette',  label: 'Crevette',  emoji: '🦐' },
  { valeur: 'Mérou',     label: 'Mérou',     emoji: '🐡' },
  { valeur: 'Homard',    label: 'Homard',    emoji: '🦞' },
  { valeur: 'Capitaine', label: 'Capitaine', emoji: '🐟' },
]

const chargerProduits = () => {
  const p = {}
  if (filtres.value.search)   p.search   = filtres.value.search
  if (filtres.value.city)     p.city     = filtres.value.city
  if (filtres.value.category) p.category = filtres.value.category
  p.page = filtres.value.page
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
// pour affichage de grille
const modeVue = ref('grille4')
</script>

<style scoped>
/*
  Logo vidéo dans le HERO
  
  Vidéo originale : 640x128px → ratio 5:1
  Affiché à 300px de large → hauteur auto = 60px
  
  mix-blend-mode: screen
    = fond NOIR de la vidéo devient TRANSPARENT
    = parfait sur fond bleu/sombre
    = texte blanc et couleurs du logo restent visibles
*/
.logo-hero-video {
  width: 300px;
  height: auto;
  object-fit: contain;
  display: block;
  mix-blend-mode: normal;
}

@media (max-width: 640px) {
  .logo-hero-video { width: 200px; }
}
</style>
