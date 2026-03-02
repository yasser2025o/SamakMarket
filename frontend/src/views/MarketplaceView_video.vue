<!-- =============================================================
  views/MarketplaceView.vue
  Page principale de la marketplace (page d'accueil)
  =============================================================
  Cette page affiche :
  1. La barre de navigation
  2. Le hero banner avec barre de recherche
  2. SECTION PROMOTIONS - Défilement des offres spéciales
  3. Les filtres par catégorie
  4. La grille de produits (chargés depuis l'API)
  5. La pagination
  ============================================================= -->

<template>
  <div class="min-h-screen bg-blue-50">

    <!-- Barre de navigation (composant réutilisable) -->
    <NavBar />
<!-- ==========================================
     SECTION PROMOTIONS - Défilement des offres spéciales
========================================== -->
<!-- <section class="max-w-6xl mx-auto px-4 py-6">
  <h2 class="text-xl font-bold text-blue-800 mb-4">🎉 Promotions du jour</h2>
  <div class="promo-container overflow-hidden rounded-lg">
    <div class="promo-slider flex gap-4 animate-slide">
      
      <div class="promo-item bg-white rounded-lg shadow-md overflow-hidden min-w-[250px]">
        <img
          src="https://via.placeholder.com/250x160/0077b6/FFFFFF?text=Sardines+Fraîches"
          alt="Sardines Fraîches"
          class="w-full h-40 object-cover"
        >
        <div class="p-4">
          <h3 class="font-semibold text-lg text-blue-900">Sardines Fraîches</h3>
          <p class="text-blue-600 mt-1">Prix: 25 MAD/kg</p>
          <p class="text-blue-600">Contact: 0612345678</p>
        </div>
      </div>

     
      <div class="promo-item bg-white rounded-lg shadow-md overflow-hidden min-w-[250px]">
        <img
          src="https://via.placeholder.com/250x160/00b4d8/FFFFFF?text=Thon+Frais"
          alt="Thon Frais"
          class="w-full h-40 object-cover"
        >
        <div class="p-4">
          <h3 class="font-semibold text-lg text-blue-900">Thon Frais</h3>
          <p class="text-blue-600 mt-1">Prix: 60 MAD/kg</p>
          <p class="text-blue-600">Contact: 0687654321</p>
        </div>
      </div>

      
      <div class="promo-item bg-white rounded-lg shadow-md overflow-hidden min-w-[250px]">
        <img
          src="https://via.placeholder.com/250x160/48cae4/FFFFFF?text=Mérou+Frais"
          alt="Mérou Frais"
          class="w-full h-40 object-cover"
        >
        <div class="p-4">
          <h3 class="font-semibold text-lg text-blue-900">Mérou Frais</h3>
          <p class="text-blue-600 mt-1">Prix: 120 MAD/kg</p>
          <p class="text-blue-600">Contact: 0645678912</p>
        </div>
      </div>

      
      <div class="promo-item bg-white rounded-lg shadow-md overflow-hidden min-w-[250px]">
        <img
          src="./images/1.png"
          alt="Crevettes Fraîches"
          class="w-full h-40 object-cover"
        >
        <div class="p-4">
          <h3 class="font-semibold text-lg text-blue-900">Crevettes Fraîches</h3>
          <p class="text-blue-600 mt-1">Prix: 150 MAD/kg</p>
          <p class="text-blue-600">Contact: 0634567890</p>
        </div>
      </div>

      
      <div class="promo-item bg-white rounded-lg shadow-md overflow-hidden min-w-[250px]">
        <img
          src="http://picsum.photos/id/74/42148"
          alt="Calamar Frais"
          class="w-full h-40 object-cover"
        >
        <div class="p-4">
          <h3 class="font-semibold text-lg text-blue-900">Calamar Frais</h3>
          <p class="text-blue-600 mt-1">Prix: 90 MAD/kg</p>
          <p class="text-blue-600">Contact: 0678901234</p>
        </div>
      </div>
    </div>
  </div>
</section> -->
  <!-- Slider promotions dynamique (données depuis DB où is_promo = 1) -->
   <!-- ==========================================
         SECTION Promotion vue 
    ========================================== -->
<ProductPromo />
    <!-- ==========================================
         SECTION HERO - Bannière principale
    ========================================== -->
    <section class="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 px-4 text-center">

      <h1 class="text-4xl md:text-5xl font-extrabold mb-3">
        <div class="flex justify-center mb-4">
  <video class="logo-hero-video">...</video>
</div>
       <video
        autoplay
        loop
        muted
        playsinline
        class="logo-video"
      >
       
        <!--<source src="/logo-samak.webm" type="video/webm" />-->
        
        <source src="/logo-samak.mp4"  type="video/mp4" />
      </video>  
        🌊 Poisson frais,
        <span class="text-amber-400">prix direct pêcheur</span>
      </h1>
      <p class="text-blue-200 mb-10 text-lg">
        Contactez les vendeurs directement — aucun intermédiaire
      </p>

      <!-- Barre de recherche -->
      <div class="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">

        <!-- Input de recherche -->
        <input
          v-model="filtres.search"
          @input="rechercherAvecDelai"
          placeholder="🔍 Sardine, thon, crevettes..."
          class="flex-1 min-w-64 bg-white/10 border border-white/30 text-white placeholder-blue-200 rounded-xl px-5 py-3 backdrop-blur focus:outline-none focus:ring-2 focus:ring-amber-400"
        />

        <!-- Filtre par ville -->
        <select
          v-model="filtres.city"
          @change="chargerProduits"
          class="bg-white/10 border border-white/30 text-white rounded-xl px-4 py-3 backdrop-blur focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="" class="text-gray-800">📍 Toutes les villes</option>
          <option value="Tanger" class="text-gray-800">Tanger</option>
          <option value="Casablanca" class="text-gray-800">Casablanca</option>
          <option value="Agadir" class="text-gray-800">Agadir</option>
          <option value="Rabat" class="text-gray-800">Rabat</option>
          <option value="Dakhla" class="text-gray-800">Dakhla</option>
        </select>

        <!-- Bouton rechercher -->
        <button
          @click="chargerProduits"
          class="bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold px-6 py-3 rounded-xl transition"
        >
          Chercher
        </button>

      </div>
    </section>


    <!-- ==========================================
         STATS (nombre de produits, vendeurs...)
    ========================================== -->
    <div class="bg-white border-b border-blue-100 px-8 py-3 flex justify-center gap-10 text-sm font-semibold text-blue-800">
      <span>🐟 <strong>{{ store.pagination.total }}</strong> produits disponibles</span>
      <span class="hidden md:block">📍 Maroc & Afrique de l'Ouest</span>
    </div>

    <!-- ==========================================
         FILTRES PAR CATÉGORIE
    ========================================== -->
    <div class="max-w-6xl mx-auto px-4 py-5 flex flex-wrap gap-2 items-center">
      <span class="text-sm text-gray-500 mr-2">Catégorie :</span>

      <!-- Bouton "Tout" -->
      <button
        @click="filtrerCategorie('')"
        :class="[
          'px-4 py-2 rounded-full text-sm font-semibold transition border',
          filtres.category === ''
            ? 'bg-blue-800 text-white border-blue-800'
            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
        ]"
      >
        Tout
      </button>

      <!-- Boutons par catégorie -->
      <button
        v-for="cat in categories"
        :key="cat.valeur"
        @click="filtrerCategorie(cat.valeur)"
        :class="[
          'px-4 py-2 rounded-full text-sm font-semibold transition border',
          filtres.category === cat.valeur
            ? 'bg-blue-800 text-white border-blue-800'
            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
        ]"
      >
        {{ cat.emoji }} {{ cat.label }}
      </button>
    </div>

    <!-- ==========================================
         GRILLE DES PRODUITS
    ========================================== -->
    <main class="max-w-6xl mx-auto px-4 pb-16">

      <!-- État : Chargement en cours -->
      <div v-if="store.chargement" class="text-center py-20">
        <div class="text-5xl mb-4 animate-bounce">🐟</div>
        <p class="text-gray-500">Chargement des produits...</p>
      </div>

      <!-- État : Erreur -->
      <div v-else-if="store.erreur" class="text-center py-20">
        <div class="text-5xl mb-4">😕</div>
        <p class="text-red-500 font-medium">{{ store.erreur }}</p>
        <button
          @click="chargerProduits"
          class="mt-4 bg-blue-800 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>

      <!-- État : Aucun résultat -->
      <div v-else-if="store.produits.length === 0" class="text-center py-20">
        <div class="text-5xl mb-4">🔍</div>
        <p class="text-gray-500 font-medium">Aucun produit trouvé</p>
        <p class="text-gray-400 text-sm mt-1">Essayez avec d'autres filtres</p>
      </div>

      <!-- Grille des produits -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
      >
        <!-- Boucle sur les produits du store -->
        <!-- :key = identifiant unique pour que Vue optimise le rendu -->
        <!-- :produit = passage du produit en prop au composant ProductCard -->
        <ProductCard
          v-for="produit in store.produits"
          :key="produit.id"
          :produit="produit"
        />
      </div>

      <!-- ==========================================
           PAGINATION
      ========================================== -->
      <div
        v-if="store.pagination.pages > 1"
        class="flex justify-center gap-2 mt-10"
      >
        <!-- Bouton page précédente -->
        <button
          @click="changerPage(store.pagination.page - 1)"
          :disabled="store.pagination.page === 1"
          class="px-4 py-2 rounded-xl border bg-white disabled:opacity-30 hover:border-blue-400"
        >
          ← Précédent
        </button>

        <!-- Numéros de pages -->
        <button
          v-for="p in store.pagination.pages"
          :key="p"
          @click="changerPage(p)"
          :class="[
            'px-4 py-2 rounded-xl border font-semibold transition',
            p === store.pagination.page
              ? 'bg-blue-800 text-white border-blue-800'
              : 'bg-white text-gray-600 hover:border-blue-400'
          ]"
        >
          {{ p }}
        </button>

        <!-- Bouton page suivante -->
        <button
          @click="changerPage(store.pagination.page + 1)"
          :disabled="store.pagination.page === store.pagination.pages"
          class="px-4 py-2 rounded-xl border bg-white disabled:opacity-30 hover:border-blue-400"
        >
          Suivant →
        </button>
      </div>

    </main>
 <FooterSamak /> 
  </div>
  <ChatBot />
</template>

<script setup>
// =============================================================
// Script de la page Marketplace
// =============================================================

import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import NavBar      from '../components/NavBar.vue'
import ProductCard from '../components/ProductCard.vue'
import ProductPromo from '../components/ProductPromo.vue'
import FooterSamak from '../components/FooterSamak.vue'
import ChatBot     from '../components/ChatBot.vue'

// Récupérer le store des produits
const store = useProductStore()

// =============================================================
// Filtres de recherche
// ref() = données réactives : quand elles changent, Vue met à jour l'interface
// =============================================================
const filtres = ref({
  search:   '',  // Texte de recherche
  city:     '',  // Ville sélectionnée
  category: '',  // Catégorie sélectionnée
  page:     1,   // Page actuelle
  limit:    12,  // Produits par page
})

// Catégories disponibles
const categories = [
  { valeur: 'Sardine',  label: 'Sardine',  emoji: '🐟' },
  { valeur: 'Thon',     label: 'Thon',     emoji: '🐠' },
  { valeur: 'Crevette', label: 'Crevette', emoji: '🦐' },
  { valeur: 'Mérou',    label: 'Mérou',    emoji: '🐡' },
  { valeur: 'Homard',   label: 'Homard',   emoji: '🦞' },
  { valeur: 'Capitaine',label: 'Capitaine',emoji: '🐟' },
]

// =============================================================
// Fonctions
// =============================================================

// Charger les produits avec les filtres actuels
const chargerProduits = () => {
  // On envoie seulement les filtres non vides
  const params = {}
  if (filtres.value.search)   params.search   = filtres.value.search
  if (filtres.value.city)     params.city     = filtres.value.city
  if (filtres.value.category) params.category = filtres.value.category
  params.page  = filtres.value.page
  params.limit = filtres.value.limit

  store.chargerProduits(params)
}

// Filtrer par catégorie
const filtrerCategorie = (categorie) => {
  filtres.value.category = categorie
  filtres.value.page = 1 // Revenir à la page 1
  chargerProduits()
}

// Changer de page
const changerPage = (page) => {
  filtres.value.page = page
  chargerProduits()
  // Remonter en haut de la page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Recherche avec délai (éviter trop d'appels API pendant la frappe)
let timeoutRecherche = null
const rechercherAvecDelai = () => {
  clearTimeout(timeoutRecherche)
  timeoutRecherche = setTimeout(() => {
    filtres.value.page = 1
    chargerProduits()
  }, 500) // Attendre 500ms après la dernière frappe
}

// =============================================================
// Cycle de vie du composant
// onMounted = s'exécute quand le composant est affiché
// =============================================================
onMounted(() => {
  chargerProduits() // Charger les produits au démarrage
})
</script>
<style scoped>
/*
  Logo vidéo dans le HERO (différent du logo navbar)

  Vidéo originale = 640x128px (ratio 5:1)
  On affiche en 320px de large → 64px de hauteur automatique

  Sur mobile (< 640px) → 200px de large → 40px de haut
*/
.logo-hero-video {
  width: 64px;          /* Largeur fixe */
  height: 64px;          /* Hauteur calculée automatiquement (ratio 5:1 → 64px) */
  object-fit: contain;
  display: block;

  /*
    mix-blend-mode: screen = MAGIE pour fond noir transparent
    
    Comment ça marche :
    - Fond noir de la vidéo (RGB 0,0,0) → devient invisible
    - Texte blanc/coloré de la vidéo → reste visible
    - Fonctionne UNIQUEMENT sur un fond sombre (bleu/noir)
    - Sur fond blanc ça ne marche pas → utilise "multiply" à la place
  */
  mix-blend-mode: screen;
}

/* Mobile : vidéo plus petite */
@media (max-width: 640px) {
  .logo-hero-video {
    width: 200px;   /* → hauteur auto = 40px */
  }
}
</style>
