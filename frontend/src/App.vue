<template>
  <!-- Splash screen au premier chargement -->
  <SplashScreen v-if="showSplash" @done="showSplash = false" />

  <!-- App principale -->
  <RouterView v-else />
</template>

<script setup>
import { ref } from 'vue'
import SplashScreen from './components/SplashScreen.vue'

// Affiche le splash uniquement à la première visite de la session
// const deja = sessionStorage.getItem('splashVu')
// const showSplash = ref(!deja)
const showSplash = ref(true)

// if (!deja) {
//   sessionStorage.setItem('splashVu', '1')
// }
</script>
