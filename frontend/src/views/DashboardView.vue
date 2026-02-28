<!-- =============================================================
  views/DashboardView.vue
  Dashboard du vendeur - Gestion de ses produits
  ============================================================= -->

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="max-w-5xl mx-auto px-4 py-8">

      <!-- En-tête du dashboard -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Mon Dashboard 📊</h1>
          <p class="text-gray-500 mt-1">Gérez vos produits et annonces</p>
        </div>
        <!-- Bouton ajouter un produit -->
        <button
          @click="afficherFormulaire = !afficherFormulaire"
          class="bg-blue-800 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl transition"
        >
          + Ajouter un produit
        </button>
      </div>

      <!-- ==========================================
           FORMULAIRE D'AJOUT DE PRODUIT
      ========================================== -->
      <div
        v-if="afficherFormulaire"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
      >
        <h2 class="text-lg font-bold text-gray-800 mb-4">Nouveau produit</h2>

        <div v-if="messageSucces" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
          ✅ {{ messageSucces }}
        </div>

        <form @submit.prevent="ajouterProduit" class="grid grid-cols-2 gap-4">

          <!-- Nom -->
          <div class="col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Nom du produit *</label>
            <input v-model="nouveauProduit.name" type="text" placeholder="Sardine fraîche du jour" required
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <!-- Prix + Unité -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Prix *</label>
            <input v-model="nouveauProduit.price" type="number" step="0.01" placeholder="15.00" required
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Unité</label>
            <select v-model="nouveauProduit.unit"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>kg</option>
              <option>pièce</option>
              <option>lot</option>
              <option>caisse</option>
            </select>
          </div>

          <!-- Catégorie + Ville -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
            <select v-model="nouveauProduit.category"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Sardine</option>
              <option>Thon</option>
              <option>Crevette</option>
              <option>Mérou</option>
              <option>Homard</option>
              <option>Capitaine</option>
              <option>Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Ville</label>
            <input v-model="nouveauProduit.city" type="text" placeholder="Tanger"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <!-- Description -->
          <div class="col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea v-model="nouveauProduit.description" placeholder="Décrivez votre produit (origine, qualité...)" rows="3"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"></textarea>
          </div>

          <!-- Boutons -->
          <div class="col-span-2 flex gap-3 justify-end">
            <button type="button" @click="afficherFormulaire = false"
              class="px-5 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" :disabled="chargement"
              class="px-5 py-2 bg-blue-800 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60">
              {{ chargement ? 'Publication...' : 'Publier le produit 🚀' }}
            </button>
          </div>

        </form>
      </div>

      <!-- ==========================================
           LISTE DES PRODUITS DU VENDEUR
      ========================================== -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-bold text-gray-800">Mes produits ({{ store.produits.length }})</h2>
        </div>

        <!-- Chargement -->
        <div v-if="store.chargement" class="text-center py-12 text-gray-500">
          Chargement...
        </div>

        <!-- Aucun produit -->
        <div v-else-if="store.produits.length === 0" class="text-center py-12">
          <div class="text-4xl mb-3">📭</div>
          <p class="text-gray-500">Vous n'avez pas encore de produits</p>
          <p class="text-gray-400 text-sm mt-1">Cliquez sur "Ajouter un produit" pour commencer</p>
        </div>

        <!-- Tableau produits -->
        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="produit in store.produits"
            :key="produit.id"
            class="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-center gap-4">
              <!-- Image ou icône -->
              <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl overflow-hidden">
                <img v-if="produit.images?.[0]" :src="produit.images[0]" class="w-full h-full object-cover" />
                <span v-else>🐟</span>
              </div>
              <div>
                <p class="font-semibold text-gray-800">{{ produit.name }}</p>
                <p class="text-gray-400 text-sm">{{ produit.category }} • {{ produit.price }} / {{ produit.unit }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- Badge sponsorisé -->
              <span v-if="produit.is_featured" class="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full">⭐ Sponsorisé</span>

              <!-- Badge disponibilité -->
              <span :class="[
                'text-xs font-semibold px-2 py-1 rounded-full',
                produit.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              ]">
                {{ produit.is_available ? '✅ Disponible' : '❌ Indisponible' }}
              </span>

              <!-- Bouton supprimer -->
              <button
                @click="supprimerProduit(produit.id, produit.name)"
                class="text-red-400 hover:text-red-600 text-sm px-3 py-1 hover:bg-red-50 rounded-lg transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import NavBar from '../components/NavBar.vue'
import api from '../services/api'

const store = useProductStore()

const afficherFormulaire = ref(false)
const chargement         = ref(false)
const messageSucces      = ref('')

const nouveauProduit = ref({
  name: '', price: '', unit: 'kg', category: 'Sardine', city: '', description: '',
})

// Charger MES produits (route /products/mine)
const chargerMesProduits = async () => {
  try {
    const { data } = await api.get('/products/mine')
    store.produits = data.produits
  } catch (e) {
    console.error('Erreur chargement produits :', e)
  }
}

// Ajouter un produit
const ajouterProduit = async () => {
  chargement.value = true
  const resultat = await store.creerProduit(nouveauProduit.value)

  if (resultat.succes) {
    messageSucces.value = 'Produit publié avec succès ! 🎉'
    store.produits.unshift(resultat.produit) // Ajouter en haut de la liste
    nouveauProduit.value = { name: '', price: '', unit: 'kg', category: 'Sardine', city: '', description: '' }
    setTimeout(() => {
      messageSucces.value = ''
      afficherFormulaire.value = false
    }, 2000)
  }
  chargement.value = false
}

// Supprimer un produit avec confirmation
const supprimerProduit = async (id, nom) => {
  if (!confirm(`Supprimer "${nom}" ? Cette action est irréversible.`)) return

  await store.supprimerProduit(id)
}

onMounted(chargerMesProduits)
</script>
