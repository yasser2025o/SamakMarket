<!-- =============================================================
  components/ProductCard.vue
  Carte d'affichage d'un produit dans la grille marketplace
  =============================================================
  Ce composant reçoit un "produit" en prop et affiche :
  - L'image (ou une icône par défaut)
  - Le nom, catégorie, ville
  - Le prix
  - Le vendeur
  - Les boutons de contact (WhatsApp et téléphone)
  ============================================================= -->

<template>
  <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">

    <!-- Badge "Sponsorisé" - visible seulement si is_featured = true -->
    <div
      v-if="produit.is_featured"
      class="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 text-center tracking-wide"
    >
      ⭐ SPONSORISÉ
    </div>

    <!-- Zone image du produit -->
    <div class="h-48 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden flex items-center justify-center">
      <!-- Afficher l'image si elle existe -->
      <img
        v-if="produit.images && produit.images.length > 0"
        :src="produit.images[0]"
        :alt="produit.name"
        class="w-full h-full object-cover"
        @error="imageErreur"
      />
      <!-- Sinon afficher l'émoji poisson par défaut -->
      <span v-else class="text-7xl">🐟</span>
    </div>

    <!-- Contenu de la carte -->
    <div class="p-4">

      <!-- Nom du produit -->
      <h3 class="font-bold text-gray-800 text-base leading-tight">
        {{ produit.name }}
      </h3>

      <!-- Catégorie et ville -->
      <p class="text-gray-400 text-xs mt-1">
        {{ produit.category }} • 📍 {{ produit.city }}
      </p>

      <!-- Prix -->
      <div class="mt-3 flex items-baseline gap-1">
        <span class="text-2xl font-extrabold text-blue-900">
          {{ formaterPrix(produit.price) }}
        </span>
        <span class="text-gray-400 text-sm">/ {{ produit.unit }}</span>
      </div>

      <!-- Vendeur -->
      <div v-if="produit.seller" class="mt-3 flex items-center gap-2">
        <!-- Avatar : première lettre du nom -->
        <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs flex-shrink-0">
          {{ produit.seller.name?.charAt(0)?.toUpperCase() }}
        </div>
        <span class="text-gray-600 text-sm truncate">{{ produit.seller.name }}</span>
      </div>

      <!-- Boutons de contact direct -->
      <!-- L'acheteur contacte le vendeur sans intermédiaire -->
      <div class="mt-4 flex gap-2">

        <!-- Bouton WhatsApp -->
        <!-- v-if : afficher seulement si le vendeur a un WhatsApp -->
        <a
          v-if="produit.seller?.whatsapp"
          :href="lienWhatsApp"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1"
        >
          📱 WhatsApp
        </a>

        <!-- Bouton Appeler -->
        <a
          v-if="produit.seller?.phone"
          :href="`tel:${produit.seller.phone}`"
          class="flex-1 bg-blue-800 hover:bg-blue-900 text-white py-2 px-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1"
        >
          📞 Appeler
        </a>

        <!-- Si ni WhatsApp ni téléphone → message -->
        <span
          v-if="!produit.seller?.whatsapp && !produit.seller?.phone"
          class="text-gray-400 text-xs italic"
        >
          Coordonnées non disponibles
        </span>

      </div>
    </div>

  </div>
</template>

<script setup>
// =============================================================
// Script du composant ProductCard
// =============================================================

// defineProps : déclaration des données reçues du composant parent
// Le parent passe le produit ainsi : <ProductCard :produit="monProduit" />
const props = defineProps({
  produit: {
    type: Object,       // Type attendu : un objet JavaScript
    required: true,     // Obligatoire : le composant ne fonctionne pas sans
  },
})

// =============================================================
// Propriété calculée : générer le lien WhatsApp
// =============================================================
// computed() = valeur qui se recalcule automatiquement quand
// les données dont elle dépend changent
import { computed } from 'vue'

const lienWhatsApp = computed(() => {
  const numero = props.produit.seller?.whatsapp || ''

  // Nettoyer le numéro : enlever espaces, tirets, +, parenthèses
  const numeroNettoye = numero.replace(/[\s\-\+\(\)]/g, '')

  // Message pré-rempli en arabe/français
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé par votre produit "${props.produit.name}" sur SamakMarket. Est-il encore disponible ?`
  )

  // Format : https://wa.me/212612345678?text=Message
  return `https://wa.me/${numeroNettoye}?text=${message}`
})

// =============================================================
// Fonctions utilitaires
// =============================================================

// Formater le prix (ajouter séparateur de milliers)
const formaterPrix = (prix) => {
  return Number(prix).toLocaleString('fr-FR')
}

// Gérer l'erreur de chargement d'image
// Si l'image ne charge pas → afficher l'image par défaut
const imageErreur = (event) => {
  event.target.style.display = 'none' // Cacher l'image cassée
}
</script>
