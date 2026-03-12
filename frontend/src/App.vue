<template>
  <!-- Splash screen au premier chargement -->
  <SplashScreen v-if="showSplash" @done="showSplash = false" />
<template v-else>
<!-- App principale -->
  
  <FlashBanner />
<RouterView />
</template>
  
</template>

<script setup>
import { ref } from 'vue'
import SplashScreen from './components/SplashScreen.vue'
import FlashBanner from './components/FlashBanner.vue'
// Affiche le splash uniquement à la première visite de la session
// const deja = sessionStorage.getItem('splashVu')
// const showSplash = ref(!deja)
const showSplash = ref(true)

// if (!deja) {
//   sessionStorage.setItem('splashVu', '1')
// }
</script>
