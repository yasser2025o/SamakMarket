<!-- =============================================================
  components/NavBar.vue
  Barre de navigation principale
  ============================================================= -->

<template>
  <nav class="bg-blue-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">

    <!-- Logo animé 3D WebM -->
    <RouterLink to="/" class="flex items-center hover:opacity-90">
      <span class="text-3xl">🐟</span>
      <!--
        Le logo est une vidéo WebM 3D (640x128px).
        autoplay = démarre seul
        loop     = tourne en boucle
        muted    = obligatoire pour autoplay dans Chrome
        playsinline = évite le plein écran sur iPhone

        IMPORTANT : place les fichiers dans /public/ de ton projet Vite :
          frontend/public/logo-samak.webm
          frontend/public/logo-samak.mp4  (fallback pour Safari)
      -->
     <!-- <video
        autoplay
        loop
        muted
        playsinline
        class="logo-video"
      >
       WebM = format moderne, léger, supporté par Chrome/Firefox 
        <source src="/logo-samak.webm" type="video/webm" />
         MP4 = fallback pour Safari qui ne supporte pas WebM 
        <source src="/logo-samak.mp4"  type="video/mp4" />
      </video> --> 
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

<style scoped>
/*
  Logo vidéo dans la navbar.
  La vidéo originale fait 640x128px (ratio 5:1).
  On la redimensionne à 160px de large → 32px de haut
  parfait pour une navbar sans prendre trop de place.
*/
.logo-video {
  height: 44px;       /* Hauteur fixe dans la navbar */
  width: auto;        /* Largeur calculée automatiquement (ratio conservé) */
  object-fit: contain;
  display: block;

  /* Fond transparent si la vidéo a un fond noir */
  mix-blend-mode: screen; /* Rend le fond noir transparent sur fond sombre */
}

/* Sur mobile : légèrement plus petit */
@media (max-width: 640px) {
  .logo-video {
    height: 34px;
  }
}
</style>
