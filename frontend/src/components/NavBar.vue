<!-- =============================================================
  components/NavBar.vue
  Barre de navigation principale
  ============================================================= -->

<template>
  <nav class="bg-blue-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">

    <!-- Logo et titre -->
    <RouterLink to="/" class="flex items-center gap-3 hover:opacity-90">
      <span class="text-3xl">🐟</span>
      <div>
        <span class="font-bold text-xl tracking-tight">SamakMarket</span>
        <div class="text-blue-300 text-xs">Poisson frais • Contact direct</div>
      </div>
    </RouterLink>

    <!-- Boutons droite -->
    <div class="flex items-center gap-3">

      <!-- Si connecté : afficher le nom + déconnexion -->
      <template v-if="auth.estConnecte">
        <span class="text-blue-200 text-sm hidden sm:block">
          👋 {{ auth.user?.name }}
        </span>

        <!-- Dashboard vendeur -->
        <RouterLink
          v-if="auth.estVendeur || auth.estAdmin"
          to="/dashboard"
          class="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
        >
          Dashboard
        </RouterLink>

        <!-- Déconnexion -->
        <button
          @click="seDeconnecter"
          class="text-sm border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          Déconnexion
        </button>
      </template>

      <!-- Si non connecté : connexion + inscription -->
      <template v-else>
        <RouterLink
          to="/login"
          class="text-sm border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10 transition"
        >
          Connexion
        </RouterLink>
        <RouterLink
          to="/register"
          class="text-sm bg-amber-400 text-amber-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 transition"
        >
          Devenir vendeur
        </RouterLink>
      </template>

    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

const seDeconnecter = () => {
  auth.seDeconnecter()
  router.push('/') // Rediriger vers l'accueil après déconnexion
}
</script>
