<!-- =============================================================
  components/ProductPromo.vue
  Slider de promotions dynamique
  =============================================================
  Remplace le bloc statique avec des données réelles depuis MySQL.

  Fonctionnement :
    1. Au montage, appelle GET /api/products/promos
    2. L'API retourne uniquement les produits où is_promo = 1
    3. On affiche chaque produit dans le slider défilant
    4. Le bouton "Contact" ouvre WhatsApp avec message pré-rempli

  Pour mettre un produit en promo :
    UPDATE products SET is_promo = 1 WHERE id = X;
  ============================================================= -->

<template>
  <section class="max-w-6xl mx-auto px-4 py-6">

    <h2 class="text-xl font-bold text-blue-800 mb-4">🎉 Promotions du jour</h2>

    <!-- ── État : Chargement ── -->
    <div v-if="chargement" class="flex gap-4 overflow-hidden">
      <!--
        Skeleton loader : des blocs gris animés qui simulent les cartes
        pendant que l'API répond. Évite un écran vide.
        animate-pulse = Tailwind fait clignoter l'opacité
      -->
      <div
        v-for="n in 4"
        :key="n"
        class="promo-item bg-white rounded-lg shadow-md overflow-hidden min-w-[250px] animate-pulse"
      >
        <div class="w-full h-40 bg-gray-200"></div>
        <div class="p-4 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          <div class="h-9 bg-gray-200 rounded w-full mt-3"></div>
        </div>
      </div>
    </div>

    <!-- ── État : Aucune promo active ── -->
    <!--
      v-else-if = affiché si chargement=false ET produits est vide
      Cas normal : aucun produit n'a is_promo=1 en base de données
    -->
    <div
      v-else-if="produits.length === 0"
      class="text-center py-8 text-gray-400"
    >
      Aucune promotion disponible pour le moment
    </div>

    <!-- ── État : Produits chargés ── -->
    <div v-else class="promo-container overflow-hidden rounded-lg">
      <!--
        Le slider utilise le même CSS que l'original (animate-slide).
        On boucle sur le tableau "produits" chargé depuis l'API.
        v-for="produit in produits" remplace les 5 blocs statiques.
      -->
      <div class="promo-slider flex gap-4 animate-slide">

        <!--
          :key="produit.id" = identifiant unique obligatoire pour Vue
          Sans ça, Vue ne peut pas optimiser les mises à jour du DOM

          On double la liste pour un défilement sans fin apparent :
          quand la première passe, la deuxième prend le relais.
          C'est pourquoi on voit [...produits, ...produits] plus bas.
        -->
        <div
          v-for="(produit, index) in produitsDoubles"
          :key="`${produit.id}-${index}`"
          class="promo-item bg-white rounded-lg shadow-md overflow-hidden min-w-[250px] flex-shrink-0"
        >

          <!-- Image du produit -->
          <!--
            produit.images est un tableau JSON stocké en DB.
            [0] = première image du tableau.
            Si pas d'image → on affiche l'emoji poisson par défaut.
          -->
          <div class="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden flex items-center justify-center">
            <img
              v-if="produit.images && produit.images.length > 0"
              :src="produit.images[0]"
              :alt="produit.name"
              class="w-full h-full object-cover"
              @error="(e) => e.target.style.display = 'none'"
            />
            <span v-else class="text-5xl">🐟</span>
          </div>

          <!-- Infos du produit -->
          <div class="p-4">

            <!-- Badge PROMO -->
            <span class="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full mb-2">
              🔥 PROMO
            </span>

            <!-- Nom du produit (depuis products.name en DB) -->
            <h3 class="font-semibold text-lg text-blue-900 leading-tight">
              {{ produit.name }}
            </h3>

            <!-- Ville du vendeur -->
            <p class="text-gray-400 text-xs mt-0.5">
              📍 {{ produit.city || produit.seller?.city }}
            </p>

            <!--
              Prix depuis la base de données :
              produit.price = colonne products.price (DECIMAL)
              produit.unit  = colonne products.unit (ex: "kg")

              Au lieu de "Prix: 25 MAD/kg" en dur dans le HTML,
              la valeur est lue depuis MySQL et mise à jour automatiquement.
            -->
            <p class="text-blue-700 font-bold mt-2 text-base">
              {{ Number(produit.price).toLocaleString('fr-FR') }} MAD
              <span class="text-gray-400 font-normal text-sm">/ {{ produit.unit }}</span>
            </p>

            <!--
              Bouton WhatsApp à la place du texte "Contact: 0612345678"

              :href="genererLienWhatsApp(produit)"
              → Le ":" signifie que href est lié à une expression Vue,
                pas un texte fixe. La valeur est calculée par la fonction.

              target="_blank" → ouvre dans un nouvel onglet
              rel="noopener"  → sécurité standard pour les liens externes
            -->
            <a
              :href="genererLienWhatsApp(produit)"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-3 flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold text-sm py-2 px-3 rounded-lg transition-colors"
            >
              <!-- Icône WhatsApp en SVG (pas de dépendance externe) -->
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.852L.057 23.25a.75.75 0 0 0 .916.948l5.604-1.47A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.493-5.178-1.354l-.37-.214-3.827 1.004 1.021-3.73-.228-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Contacter
            </a>

          </div>
        </div>

      </div>
    </div>

  </section>
</template>


<script setup>
// =============================================================
// Script du composant ProductPromo
// =============================================================

import { ref, computed, onMounted } from 'vue'
import api from '@/services/api' // Axios configuré avec baseURL + token auto

// ── State ──────────────────────────────────────────────────

// Tableau des produits en promo (rempli par l'API)
// ref([]) = tableau réactif vide au départ
const produits   = ref([])

// true = requête API en cours → affiche les skeletons
const chargement = ref(true)

// ── Données doublées pour le défilement infini ──────────────
/*
  Pour que le slider défile en boucle sans saut visible,
  on duplique la liste : [A, B, C, A, B, C]
  Quand l'animation arrive à la fin de la première série,
  la deuxième série commence exactement pareil → illusion de boucle.

  computed() = recalculé automatiquement quand produits.value change
*/
const produitsDoubles = computed(() => [
  ...produits.value,
  ...produits.value,
])

// ── Chargement des promos depuis l'API ──────────────────────
onMounted(async () => {
  try {
    /*
      GET /api/products/promos
      → Le controller filtre : WHERE is_promo = 1 AND is_available = 1
      → Retourne aussi les infos du vendeur (seller.whatsapp, seller.phone)
         grâce au include: [{ model: User, as: 'seller' }] dans le controller
    */
    const { data } = await api.get('/products/promos')

    // data.produits = tableau des produits en promo
    produits.value = data.produits

  } catch (erreur) {
    console.error('Erreur chargement promos :', erreur)
    // En cas d'erreur API, on laisse produits = [] → affiche "Aucune promo"
  } finally {
    // "finally" s'exécute toujours, succès ou erreur
    // Cache les skeletons dans tous les cas
    chargement.value = false
  }
})

// ── Génération du lien WhatsApp ──────────────────────────────
/*
  Fonction (pas computed) car elle reçoit un "produit" en paramètre.
  Appelée dans le template : :href="genererLienWhatsApp(produit)"

  Construit : https://wa.me/212612345678?text=Message+pré-rempli
*/
const genererLienWhatsApp = (produit) => {

  // Récupérer le numéro depuis seller.whatsapp (colonne users.whatsapp en DB)
  const numero = produit.seller?.whatsapp || produit.seller?.phone || ''

  // Nettoyer : "+212 612-345 678" → "212612345678"
  const numeroNettoye = numero.replace(/[\s\-\+\(\)]/g, '')

  // Message pré-rempli avec les vraies données du produit
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé par votre promotion "${produit.name}" `
    + `à ${produit.price} MAD/${produit.unit} sur SamakMarket. `
    + `Est-il encore disponible ?`
  )

  // Si pas de numéro → lien générique WhatsApp
  if (!numeroNettoye) return 'https://wa.me/'

  return `https://wa.me/${numeroNettoye}?text=${message}`
}
</script>


<style scoped>
/*
  CSS du slider défilant — même comportement que l'original.

  Le slider se déplace de gauche à droite en continu.
  "scoped" = ces styles s'appliquent UNIQUEMENT à ce composant,
  pas aux autres composants de la page.
*/

/* Masque ce qui dépasse du conteneur */
.promo-container {
  overflow: hidden;
}

/*
  Largeur = nombre de produits × largeur d'une carte.
  La duplication (produitsDoubles) permet la boucle infinie.
*/
.promo-slider {
  display: flex;
  gap: 16px;
  width: max-content;      /* S'étend autant que nécessaire */
  animation: slide 25s linear infinite;
}

/* Pause du défilement quand la souris est sur le slider */
.promo-slider:hover {
  animation-play-state: paused;
}

/*
  L'animation déplace le slider de 0 à -50% :
  → -50% parce que la liste est doublée
  → Quand on arrive à -50%, on revient à 0 → boucle invisible
*/
@keyframes slide {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Largeur fixe de chaque carte promo */
.promo-item {
  min-width: 250px;
  flex-shrink: 0; /* Empêche les cartes de rétrécir */
}
</style>
