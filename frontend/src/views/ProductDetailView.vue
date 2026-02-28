<!-- =============================================================
  views/ProductDetailView.vue
  Page de détail d'un produit
  ============================================================= -->

<template>
  <div class="min-h-screen bg-blue-50">
    <NavBar />

    <div class="max-w-4xl mx-auto px-4 py-8">

      <!-- Chargement -->
      <div v-if="chargement" class="text-center py-20">
        <div class="text-5xl animate-bounce">🐟</div>
        <p class="text-gray-500 mt-4">Chargement...</p>
      </div>

      <!-- Produit trouvé -->
      <div v-else-if="produit" class="grid md:grid-cols-2 gap-8">

        <!-- Image -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border">
          <img
            v-if="produit.images?.[0]"
            :src="produit.images[0]"
            :alt="produit.name"
            class="w-full h-80 object-cover"
          />
          <div v-else class="h-80 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-9xl">
            🐟
          </div>
        </div>

        <!-- Infos produit -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border">

          <!-- Nom + catégorie -->
          <div class="mb-4">
            <span class="text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full">
              {{ produit.category }}
            </span>
            <h1 class="text-2xl font-bold text-gray-800 mt-2">{{ produit.name }}</h1>
            <p class="text-gray-400 text-sm mt-1">📍 {{ produit.city }}</p>
          </div>

          <!-- Prix -->
          <div class="border-t border-b border-gray-100 py-4 mb-4">
            <span class="text-4xl font-extrabold text-blue-900">{{ produit.price }}</span>
            <span class="text-gray-400 ml-1">MAD / {{ produit.unit }}</span>
          </div>

          <!-- Description -->
          <p v-if="produit.description" class="text-gray-600 mb-6 leading-relaxed">
            {{ produit.description }}
          </p>

          <!-- Vendeur -->
          <div v-if="produit.seller" class="bg-gray-50 rounded-xl p-4 mb-6">
            <p class="text-xs text-gray-400 font-semibold uppercase mb-2">Vendeur</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                {{ produit.seller.name?.charAt(0) }}
              </div>
              <div>
                <p class="font-semibold text-gray-800">{{ produit.seller.name }}</p>
                <p class="text-gray-400 text-sm">📍 {{ produit.seller.city }}</p>
              </div>
            </div>
          </div>

          <!-- Boutons de contact -->
          <div class="flex gap-3">
            <a
              v-if="produit.seller?.whatsapp"
              :href="lienWhatsApp"
              target="_blank"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-center transition"
            >
              📱 Contacter sur WhatsApp
            </a>
            <a
              v-if="produit.seller?.phone"
              :href="`tel:${produit.seller.phone}`"
              class="flex-1 bg-blue-800 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-center transition"
            >
              📞 Appeler
            </a>
          </div>

          <!-- Vues -->
          <p class="text-gray-400 text-xs text-center mt-4">
            👁️ {{ produit.views_count }} vues
          </p>

        </div>
      </div>

      <!-- Produit non trouvé -->
      <div v-else class="text-center py-20">
        <div class="text-5xl mb-4">😕</div>
        <p class="text-gray-500">Produit introuvable</p>
        <RouterLink to="/" class="mt-4 inline-block text-blue-700 hover:underline">
          ← Retour à la marketplace
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import NavBar from '../components/NavBar.vue'

const route   = useRoute()
const produit = ref(null)
const chargement = ref(true)

// Lien WhatsApp dynamique
const lienWhatsApp = computed(() => {
  const num = produit.value?.seller?.whatsapp?.replace(/[\s\-\+\(\)]/g, '') || ''
  const msg = encodeURIComponent(`Bonjour, je suis intéressé par votre produit "${produit.value?.name}" sur SamakMarket.`)
  return `https://wa.me/${num}?text=${msg}`
})

onMounted(async () => {
  try {
    const { data } = await api.get(`/products/${route.params.id}`)
    produit.value = data.produit
  } catch {
    produit.value = null
  } finally {
    chargement.value = false
  }
})
</script>
