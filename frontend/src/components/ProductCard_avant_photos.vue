<!-- =============================================================
  components/ProductCard.vue — 3 modes d'affichage
  mode="grille4" → 4 colonnes | mode="grille2" → 2 colonnes | mode="liste"
  ============================================================= -->

<template>

  <!-- ── MODE LISTE : image gauche + tout le détail à droite ── -->
  <div v-if="mode === 'liste'"
    class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex">

    <!-- Image fixe 160px à gauche -->
    <div class="w-40 flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
      <img v-if="produit.images?.length" :src="produit.images[0]" :alt="produit.name"
        class="w-full h-full object-cover" @error="imageErreur" />
      <span v-else class="text-5xl">🐟</span>
      <div v-if="produit.is_featured" class="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
        ⭐
      </div>
    </div>

    <!-- Contenu à droite -->
    <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
      <div>
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-bold text-gray-800 text-base leading-tight">{{ produit.name }}</h3>
          <div class="flex-shrink-0 text-right">
            <span class="text-xl font-extrabold text-blue-900">{{ formaterPrix(produit.price) }}</span>
            <span class="text-gray-400 text-xs ml-1">MAD / {{ produit.unit }}</span>
          </div>
        </div>
        <p class="text-gray-400 text-xs mt-1">{{ produit.category }} • 📍 {{ produit.city }}</p>
        <!-- Description visible uniquement en mode liste -->
        <p v-if="produit.description" class="text-gray-500 text-sm mt-2 line-clamp-2">{{ produit.description }}</p>
      </div>
      <div class="flex items-center justify-between mt-3 flex-wrap gap-2">
        <div v-if="produit.seller" class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs">
            {{ produit.seller.name?.charAt(0)?.toUpperCase() }}
          </div>
          <span class="text-gray-600 text-sm">{{ produit.seller.name }}</span>
        </div>
        <div class="flex gap-2">
          <a v-if="produit.seller?.whatsapp" :href="lienWhatsApp" target="_blank" rel="noopener noreferrer"
            class="bg-green-500 hover:bg-green-600 text-white py-1.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-1">
            📱 WhatsApp
          </a>
          <a v-if="produit.seller?.phone" :href="`tel:${produit.seller.phone}`"
            class="bg-blue-800 hover:bg-blue-900 text-white py-1.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-1">
            📞 Appeler
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- ── MODE GRILLE 2 ou GRILLE 4 : carte verticale ── -->
  <div v-else class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
    <div v-if="produit.is_featured" class="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 text-center tracking-wide">
      ⭐ SPONSORISÉ
    </div>
    <!-- Image plus haute en grille2 -->
    <div :class="['bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden flex items-center justify-center',
        mode === 'grille2' ? 'h-64' : 'h-48']">
      <img v-if="produit.images?.length" :src="produit.images[0]" :alt="produit.name"
        class="w-full h-full object-cover" @error="imageErreur" />
      <span v-else :class="mode === 'grille2' ? 'text-8xl' : 'text-7xl'">🐟</span>
    </div>
    <div :class="mode === 'grille2' ? 'p-5' : 'p-4'">
      <h3 :class="['font-bold text-gray-800 leading-tight', mode === 'grille2' ? 'text-lg' : 'text-base']">
        {{ produit.name }}
      </h3>
      <p class="text-gray-400 text-xs mt-1">{{ produit.category }} • 📍 {{ produit.city }}</p>
      <!-- Description visible en grille2 -->
      <p v-if="mode === 'grille2' && produit.description" class="text-gray-500 text-sm mt-2 line-clamp-2">
        {{ produit.description }}
      </p>
      <div class="mt-3 flex items-baseline gap-1">
        <span :class="['font-extrabold text-blue-900', mode === 'grille2' ? 'text-3xl' : 'text-2xl']">
          {{ formaterPrix(produit.price) }}
        </span>
        <span class="text-gray-400 text-sm">/ {{ produit.unit }}</span>
      </div>
      <div v-if="produit.seller" class="mt-3 flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs flex-shrink-0">
          {{ produit.seller.name?.charAt(0)?.toUpperCase() }}
        </div>
        <span class="text-gray-600 text-sm truncate">{{ produit.seller.name }}</span>
      </div>
      <div class="mt-4 flex gap-2">
        <a v-if="produit.seller?.whatsapp" :href="lienWhatsApp" target="_blank" rel="noopener noreferrer"
          class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1">
          📱 WhatsApp
        </a>
        <a v-if="produit.seller?.phone" :href="`tel:${produit.seller.phone}`"
          class="flex-1 bg-blue-800 hover:bg-blue-900 text-white py-2 px-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1">
          📞 Appeler
        </a>
        <span v-if="!produit.seller?.whatsapp && !produit.seller?.phone" class="text-gray-400 text-xs italic">
          Coordonnées non disponibles
        </span>
      </div>
    </div>
  </div>

</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  produit: { type: Object, required: true },
  /*
    mode reçu du parent MarketplaceView :
    'grille4' → 4 colonnes (défaut)
    'grille2' → 2 colonnes avec plus de détails
    'liste'   → une ligne avec image à gauche
  */
  mode: { type: String, default: 'grille4' },
})

const lienWhatsApp = computed(() => {
  const propre = (props.produit.seller?.whatsapp || '').replace(/[\s\-\+\(\)]/g, '')
  const msg = encodeURIComponent(`Bonjour, je suis intéressé par "${props.produit.name}" sur SamakMarket. Disponible ?`)
  return `https://wa.me/${propre}?text=${msg}`
})
const photosDefaut = {
  'Sardine':   '/images/poissons/sardine/sardine_1.jpg',
  'Thon':      '/images/poissons/thon/thon_1.jpg',
  'Crevette':  '/images/poissons/crevette/crevette_1.jpg',
  'Mérou':     '/images/poissons/merou/merou_1.jpg',
  'Homard':    '/images/poissons/homard/homard_1.jpg',
  'Capitaine': '/images/poissons/capitaine/capitaine_1.jpg',
  'Dorade':    '/images/poissons/dorade/dorade_1.jpg',
  'Calamar':   '/images/poissons/calamar/calamar_1.jpg',
}

const imageAffichee = computed(() =>
  props.produit.images?.[0] ||
  photosDefaut[props.produit.category] ||
  null
)

const formaterPrix = (prix) => Number(prix).toLocaleString('fr-FR')
const imageErreur  = (e)    => { e.target.style.display = 'none' }
</script>
