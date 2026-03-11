<!-- =============================================================
  views/RegisterView.vue
  Page d'inscription (vendeur ou acheteur)
  ============================================================= -->

<template>
  <div class="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-8">

    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">

      <!-- Logo -->
      <div class="text-center mb-6">
        <span class="text-5xl">🐟</span>
        <h1 class="text-2xl font-bold text-blue-900 mt-2">Rejoindre SamakMarket</h1>
        <p class="text-gray-500 text-sm">Créez votre compte gratuitement</p>
      </div>

      <!-- Message d'erreur -->
      <div
        v-if="messageErreur"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm"
      >
        ❌ {{ messageErreur }}
      </div>

      <!-- Message de succès -->
      <div
        v-if="messageSucces"
        class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm"
      >
        ✅ {{ messageSucces }}
      </div>

      <form @submit.prevent="soumettre" class="space-y-4">

        <!-- Nom -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Nom complet *</label>
          <input
            v-model="formulaire.name"
            type="text" placeholder="Mohamed Diallo" required
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
          <input
            v-model="formulaire.email"
            type="email" placeholder="vous@exemple.com" required
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <!-- Mot de passe -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Mot de passe *</label>
          <input
            v-model="formulaire.password"
            type="password" placeholder="Minimum 6 caractères" required minlength="6"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <!-- Téléphone + WhatsApp -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
            <input
              v-model="formulaire.phone"
              type="tel" placeholder="0612345678"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
            <input
              v-model="formulaire.whatsapp"
              type="tel" placeholder="212612345678"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <!-- Ville -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Ville</label>
          <input
            v-model="formulaire.city"
            type="text" placeholder="Tanger, Casablanca, Agadir..."
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <!-- Rôle -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Je suis un(e) *</label>
          <div class="grid grid-cols-2 gap-3">
            <label
              :class="[
                'border-2 rounded-xl p-3 text-center cursor-pointer transition',
                formulaire.role === 'buyer'
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <input type="radio" v-model="formulaire.role" value="buyer" class="sr-only" />
              <div class="text-2xl">🛒</div>
              <div class="font-semibold text-sm mt-1">Acheteur</div>
              <div class="text-xs text-gray-500">Je cherche du poisson</div>
            </label>
            <label
              :class="[
                'border-2 rounded-xl p-3 text-center cursor-pointer transition',
                formulaire.role === 'seller'
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <input type="radio" v-model="formulaire.role" value="seller" class="sr-only" />
              <div class="text-2xl">🏪</div>
              <div class="font-semibold text-sm mt-1">Vendeur</div>
              <div class="text-xs text-gray-500">Je vends du poisson</div>
            </label>
          </div>
        </div>

        <!-- Bouton -->
        <button
          type="submit"
          :disabled="chargement"
          class="w-full bg-blue-800 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 mt-2"
        >
          {{ chargement ? 'Création du compte...' : 'Créer mon compte 🎉' }}
        </button>

      </form>

      <p class="text-center text-sm text-gray-500 mt-5">
        Déjà un compte ?
        <RouterLink to="/login" class="text-blue-700 font-semibold hover:underline">Se connecter</RouterLink>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const formulaire = ref({
  name: '', email: '', password: '',
  phone: '', whatsapp: '', city: '',
  role: 'buyer',
})

const chargement    = ref(false)
const messageErreur = ref('')
const messageSucces = ref('')

const soumettre = async () => {
  chargement.value    = true
  messageErreur.value = ''

  const resultat = await auth.sInscrire(formulaire.value)

  if (resultat.succes) {
    messageSucces.value = 'Compte créé ! Redirection...'
    setTimeout(() => {
      router.push(formulaire.value.role === 'seller' ? '/dashboard' : '/')
    }, 1500)
  } else {
    messageErreur.value = resultat.message
  }

  chargement.value = false
}
</script>
