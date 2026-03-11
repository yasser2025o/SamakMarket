<!-- =============================================================
  components/ProductCard.vue — avec photos par défaut par type
  ============================================================= -->
<template>

  <!-- MODE LISTE -->
  <div v-if="mode === 'liste'"
    class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex">
    <div class="w-40 flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
      <!--
        imageAffichee = photo vendeur → photo défaut catégorie → emoji
        On ne montre plus jamais l'emoji 🐟 si une photo existe
      -->
      <img v-if="imageAffichee" :src="imageAffichee" :alt="produit.name"
        class="w-full h-full object-cover"
        @error="(e) => { e.target.style.display='none'; imageEchouee = true }" />
      <span v-else class="text-5xl">{{ emojiCategorie }}</span>
      <div v-if="produit.is_featured" class="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">⭐</div>
    </div>
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
            class="bg-green-500 hover:bg-green-600 text-white py-1.5 px-4 rounded-xl text-xs font-semibold">📱 WhatsApp</a>
            <a class="bg-blue-800 hover:bg-blue-900 text-white py-1.5 px-4 rounded-xl text-xs font-semibold">
            <BtnPartagerFB :produit="produit" />
          </a>
          <!-- <a v-if="produit.seller?.phone" :href="`tel:${produit.seller.phone}`"
            class="bg-blue-800 hover:bg-blue-900 text-white py-1.5 px-4 rounded-xl text-xs font-semibold">📞 Appeler</a> -->
        </div>
      </div>
    </div>
  </div>
        

  <!-- MODE GRILLE 2 ou GRILLE 4 -->
  <div v-else class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
    <div v-if="produit.is_featured" class="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 text-center tracking-wide">⭐ SPONSORISÉ</div>
    <div :class="['bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden flex items-center justify-center',
        mode === 'grille2' ? 'h-64' : 'h-48']">
      <img v-if="imageAffichee" :src="imageAffichee" :alt="produit.name"
        class="w-full h-full object-cover"
        @error="(e) => { e.target.style.display='none'; imageEchouee = true }" />
      <span v-else :class="mode === 'grille2' ? 'text-8xl' : 'text-7xl'">{{ emojiCategorie }}</span>
    </div>
    <div :class="mode === 'grille2' ? 'p-5' : 'p-4'">
      <h3 :class="['font-bold text-gray-800 leading-tight', mode === 'grille2' ? 'text-lg' : 'text-base']">
        {{ produit.name }}
      </h3>
      <p class="text-gray-400 text-xs mt-1">{{ produit.category }} • 📍 {{ produit.city }}</p>
      <p v-if="mode === 'grille2' && produit.description" class="text-gray-500 text-sm mt-2 line-clamp-2">{{ produit.description }}</p>
      <div class="mt-3 flex items-baseline gap-1">
        <span :class="['font-extrabold text-blue-900', mode === 'grille2' ? 'text-3xl' : 'text-2xl']">{{ formaterPrix(produit.price) }}</span>
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
          class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-xl text-xs font-semibold text-center">📱 WhatsApp</a>
          <a class="bg-blue-800 hover:bg-blue-900 text-white py-2 px-3 rounded-xl text-xs font-semibold">
          <BtnPartagerFB :produit="produit" />
        </a>
        <!-- <a v-if="produit.seller?.phone" :href="`tel:${produit.seller.phone}`"
          class="flex-1 bg-blue-800 hover:bg-blue-900 text-white py-2 px-3 rounded-xl text-xs font-semibold text-center">📞 Appeler</a> -->
        <span v-if="!produit.seller?.whatsapp && !produit.seller?.phone" class="text-gray-400 text-xs italic">Coordonnées non disponibles</span>
      </div>
    </div>
  </div>

</template>

<script setup>
import BtnPartagerFB from './BtnPartagerFB.vue'

import { computed, ref } from 'vue'

const props = defineProps({
  produit: { type: Object, required: true },
  mode:    { type: String, default: 'grille4' },
})

// =============================================================
// PHOTOS PAR DÉFAUT PAR CATÉGORIE
// =============================================================
// Clé = valeur exacte du champ "category" dans la DB
// Valeur = chemin local depuis /public/
//
// Structure des dossiers :
//   frontend/public/images/poissons/{type}/marche/marche_1.jpg
//   frontend/public/images/poissons/{type}/cuisine/cuisine_1.jpg
//
// On utilise "marche" = photo du poisson frais entier
// (plus parlant pour un marché de poisson)
// =============================================================
const photosDefaut = {
  // Poissons ronds
  'Sardine':    '/images/poissons/sardine/marche/marche_1.jpg',
  'Thon':       '/images/poissons/thon/marche/marche_1.jpg',
  'Mérou':      '/images/poissons/merou/marche/marche_1.jpg',
  'Dorade':     '/images/poissons/dorade/marche/marche_1.jpg',
  'Bar':        '/images/poissons/bar/marche/marche_1.jpg',
  'Rouget':     '/images/poissons/rouget/marche/marche_1.jpg',
  'Saumon':     '/images/poissons/saumon/marche/marche_1.jpg',
  'Maquereau':  '/images/poissons/maquereau/marche/marche_1.jpg',
  'Mulet':      '/images/poissons/mulet/marche/marche_1.jpg',
  'Capitaine':  '/images/poissons/capitaine/marche/marche_1.jpg',
  // Fruits de mer
  'Crevette':   '/images/poissons/crevette/marche/marche_1.jpg',
  'Homard':     '/images/poissons/homard/marche/marche_1.jpg',
  'Calamar':    '/images/poissons/calamar/marche/marche_1.jpg',
  'Pieuvre':    '/images/poissons/pieuvre/marche/marche_1.jpg',
  'Moule':      '/images/poissons/moule/marche/marche_1.jpg',
  'Huître':     '/images/poissons/huitre/marche/marche_1.jpg',
  'Seiche':     '/images/poissons/seiche/marche/marche_1.jpg',
  'Langouste':  '/images/poissons/langouste/marche/marche_1.jpg',
  'Palourde':   '/images/poissons/palourde/marche/marche_1.jpg',
  // Poissons plats
  'Sole':       '/images/poissons/sole/marche/marche_1.jpg',
  'Turbot':     '/images/poissons/turbot/marche/marche_1.jpg',
}

// Emojis par catégorie (fallback si image manquante)
const emojisCategorie = {
  'Sardine': '🐟', 'Thon': '🐠', 'Mérou': '🐡', 'Dorade': '🐠',
  'Bar': '🐟', 'Rouget': '🐟', 'Saumon': '🐟', 'Maquereau': '🐟',
  'Mulet': '🐟', 'Capitaine': '🐟', 'Crevette': '🦐', 'Homard': '🦞',
  'Calamar': '🦑', 'Pieuvre': '🐙', 'Moule': '🦪', 'Huître': '🦪',
  'Seiche': '🦑', 'Langouste': '🦞', 'Palourde': '🦪',
  'Sole': '🐟', 'Turbot': '🐟',
}

// true si l'image a planté au chargement
const imageEchouee = ref(false)

// Photo finale :
// 1. Image uploadée par le vendeur (produit.images[0])
// 2. Photo par défaut selon la catégorie
// 3. null → affiche l'emoji
const imageAffichee = computed(() => {
  if (imageEchouee.value) return null
  return (
    props.produit.images?.[0] ||
    photosDefaut[props.produit.category] ||
    '/images/poissons/default/marche/marche_1.jpg'
  )
})

// Emoji selon la catégorie du produit
const emojiCategorie = computed(() =>
  emojisCategorie[props.produit.category] || '🐟'
)


// Lien WhatsApp
const lienWhatsApp = computed(() => {
  const propre = (props.produit.seller?.whatsapp || '').replace(/[\s\-\+\(\)]/g, '')
  const msg = encodeURIComponent(`Bonjour, je suis intéressé par "${props.produit.name}" sur SamakMarket. Disponible ?`)
  return `https://wa.me/${propre}?text=${msg}`
})

const formaterPrix = (prix) => Number(prix).toLocaleString('fr-FR')
</script>
