<!-- =============================================================
  App.vue - Composant racine de l'application
  =============================================================
  Ce composant est le "conteneur" de toute l'application.
  RouterView affiche le composant correspondant à l'URL actuelle.

  Exemple :
    URL /          → affiche HomeView.vue (via RouterView)
    URL /login     → affiche LoginView.vue
    URL /products  → affiche MarketplaceView.vue
  ============================================================= -->

<template>
  <!-- RouterView est un composant spécial de Vue Router -->
  <!-- Il est remplacé dynamiquement par la vue courante -->
  <RouterView />
</template>

<script setup>
// RouterView est automatiquement disponible quand vue-router est installé
// Pas besoin de l'importer explicitement avec Vue Router 4
</script>
