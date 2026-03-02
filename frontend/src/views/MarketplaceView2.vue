<!-- =============================================================
  views/MarketplaceView.vue
  ============================================================= -->

<template>
  <div class="min-h-screen bg-blue-50">

    <NavBar />

    <!-- ================= HERO ================= -->
    <section class="hero-ocean relative overflow-hidden">
Fpro
      <div class="hero-bg absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=1600&q=80&auto=format&fit=crop"
          alt="Océan Atlantique Tanger"
          class="w-full h-full object-cover object-center"
        />
        <div class="absolute inset-0 hero-overlay"></div>
        <div class="absolute bottom-0 left-0 right-0 h-32 hero-reflet"></div>
      </div>

      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="wave-line wave-1"></div>
        <div class="wave-line wave-2"></div>
        <div class="wave-line wave-3"></div>
      </div>

      <div class="relative z-10 px-4 pt-16 pb-10 max-w-5xl mx-auto text-center">

        <div class="badge-tanger inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          📍 Tanger · Maroc
        </div>

        <h1 class="text-4xl md:text-6xl font-black text-white mb-4">
          Direct du <span class="text-gradient-ocean">Port de Tanger</span>
        </h1>

        <p class="text-blue-200 mb-8">
          Pêché à l'aube, livré le jour même.
        </p>

        <!-- Recherche -->
        <div class="search-glass max-w-2xl mx-auto rounded-2xl p-2">
          <div class="flex flex-wrap gap-2">

            <input
              v-model="filtres.search"
              @input="rechercherAvecDelai"
              placeholder="Rechercher un poisson..."
              class="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none"
            />

            <select
              v-model="filtres.city"
              @change="chargerProduits"
              class="bg-transparent text-white px-4 py-3 focus:outline-none"
            >
              <option value="">Toutes les villes</option>
              <option value="Tanger">Tanger</option>
              <option value="Casablanca">Casablanca</option>
              <option value="Agadir">Agadir</option>
            </select>

            <button
              @click="chargerProduits"
              class="btn-search px-6 py-3 rounded-xl font-bold"
            >
              Chercher
            </button>

          </div>
        </div>

      </div>
    </section>

    <!-- ================= STATS ================= -->
    <div class="bg-white border-b px-8 py-3 text-center font-semibold text-blue-800">
      🐟 {{ store.pagination.total }} produits disponibles
    </div>

    <!-- ================= CATEGORIES ================= -->
    <div class="max-w-6xl mx-auto px-4 py-5 flex flex-wrap gap-2">
      <button
        @click="filtrerCategorie('')"
        :class="btnCategorie('')"
      >
        Tout
      </button>

      <button
        v-for="cat in categories"
        :key="cat.valeur"
        @click="filtrerCategorie(cat.valeur)"
        :class="btnCategorie(cat.valeur)"
      >
        {{ cat.emoji }} {{ cat.label }}
      </button>
    </div>

    <!-- ================= PRODUITS ================= -->
    <main class="max-w-6xl mx-auto px-4 pb-16">

      <div v-if="store.chargement" class="text-center py-20">
        Chargement...
      </div>

      <div v-else-if="store.erreur" class="text-center py-20 text-red-500">
        {{ store.erreur }}
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
      >
        <ProductCard
          v-for="produit in store.produits"
          :key="produit.id"
          :produit="produit"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="store.pagination.pages > 1"
        class="flex justify-center gap-2 mt-10"
      >
        <button
          @click="changerPage(store.pagination.page - 1)"
          :disabled="store.pagination.page === 1"
        >
          ←
        </button>

        <button
          v-for="p in store.pagination.pages"
          :key="p"
          @click="changerPage(p)"
        >
          {{ p }}
        </button>

        <button
          @click="changerPage(store.pagination.page + 1)"
          :disabled="store.pagination.page === store.pagination.pages"
        >
          →
        </button>
      </div>

    </main>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import NavBar from '../components/NavBar.vue'
import ProductCard from '../components/ProductCard.vue'

const store = useProductStore()

const filtres = ref({
  search: '',
  city: '',
  category: '',
  page: 1,
  limit: 12,
})

const categories = [
  { valeur: 'Sardine', label: 'Sardine', emoji: '🐟' },
  { valeur: 'Thon', label: 'Thon', emoji: '🐠' },
  { valeur: 'Crevette', label: 'Crevette', emoji: '🦐' },
]

const chargerProduits = () => {
  store.chargerProduits({ ...filtres.value })
}

const filtrerCategorie = (cat) => {
  filtres.value.category = cat
  filtres.value.page = 1
  chargerProduits()
}

const changerPage = (page) => {
  filtres.value.page = page
  chargerProduits()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const btnCategorie = (cat) => {
  return [
    'px-4 py-2 rounded-full text-sm font-semibold border transition',
    filtres.value.category === cat
      ? 'bg-blue-800 text-white border-blue-800'
      : 'bg-white text-gray-600 border-gray-200'
  ]
}

let timeoutRecherche = null
const rechercherAvecDelai = () => {
  clearTimeout(timeoutRecherche)
  timeoutRecherche = setTimeout(() => {
    filtres.value.page = 1
    chargerProduits()
  }, 500)
}

onMounted(() => {
  chargerProduits()
})
</script>

<style scoped>
.hero-ocean {
  min-height: 520px;
  background: #020e23;
}

.hero-overlay {
  background: linear-gradient(160deg, rgba(2,14,35,0.85), rgba(8,50,90,0.6));
}

.hero-reflet {
  background: linear-gradient(to top, rgba(0,180,216,0.15), transparent);
}

.wave-line {
  position: absolute;
  left: -100%;
  width: 300%;
  height: 2px;
  border-radius: 9999px;
  opacity: 0.08;
  background: linear-gradient(90deg, transparent, #00b4d8, #90e0ef, #00b4d8, transparent);
  animation: waveDrift 8s ease-in-out infinite;
}

.wave-1 { top: 40%; }
.wave-2 { top: 55%; }
.wave-3 { top: 70%; }

@keyframes waveDrift {
  0% { transform: translateX(0); }
  50% { transform: translateX(8%); }
  100% { transform: translateX(0); }
}

.badge-tanger {
  background: rgba(0,180,216,0.12);
  border: 1px solid rgba(0,180,216,0.3);
  color: #90e0ef;
}

.text-gradient-ocean {
  background: linear-gradient(90deg, #00b4d8, #48cae4, #90e0ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.search-glass {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.14);
  backdrop-filter: blur(20px);
}

.btn-search {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #1c1400;
}
</style>