<!-- =============================================================
  views/LoginView.vue
  Page de connexion
  ============================================================= -->

<template>
  <div class="min-h-screen bg-blue-50 flex items-center justify-center px-4">

    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

      <!-- Logo -->
      <div class="text-center mb-8">
        <span class="text-5xl">🐟</span>
        <h1 class="text-2xl font-bold text-blue-900 mt-2">SamakMarket</h1>
        <p class="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
      </div>

      <!-- Message d'erreur -->
      <div
        v-if="messageErreur"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm"
      >
        ❌ {{ messageErreur }}
      </div>

      <!-- Formulaire de connexion -->
      <!-- @submit.prevent = intercepter la soumission et empêcher le rechargement -->
      <form @submit.prevent="soumettre" class="space-y-4">

        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            v-model="formulaire.email"
            type="email"
            placeholder="vous@exemple.com"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <!-- Mot de passe -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            v-model="formulaire.password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <!-- Bouton de connexion -->
        <button
          type="submit"
          :disabled="chargement"
          class="w-full bg-blue-800 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
        >
          {{ chargement ? 'Connexion...' : 'Se connecter' }}
        </button>

      </form>

      <!-- Lien vers inscription -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?
        <RouterLink to="/register" class="text-blue-700 font-semibold hover:underline">
          S'inscrire
        </RouterLink>
      </p>

      <!-- Retour accueil -->
      <div class="text-center mt-4">
        <RouterLink to="/" class="text-gray-400 text-sm hover:text-gray-600">
          ← Retour à la marketplace
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useAuthStore()

// Données du formulaire (réactives)
const formulaire = ref({
  email:    '',
  password: '',
})

// États de l'interface
const chargement    = ref(false) // Bouton désactivé pendant la requête
const messageErreur = ref('')    // Message d'erreur à afficher

// Soumettre le formulaire de connexion
const soumettre = async () => {
  chargement.value    = true
  messageErreur.value = ''

  // Appeler l'action du store Pinia
  const resultat = await auth.seConnecter(
    formulaire.value.email,
    formulaire.value.password
  )

  if (resultat.succes) {
    // Connexion réussie → rediriger
    const destination = router.currentRoute.value.query.redirect || '/'
    router.push(destination)
  } else {
    // Afficher l'erreur
    messageErreur.value = resultat.message
  }

  chargement.value = false
}
</script>
