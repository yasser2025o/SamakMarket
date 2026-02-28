// =============================================================
// src/main.js
// Point d'entrée de l'application Vue.js
// =============================================================
// Ce fichier :
// 1. Crée l'application Vue
// 2. Installe les plugins (Router, Pinia)
// 3. Monte l'application dans le HTML (div#app)
// =============================================================

import { createApp } from 'vue'       // Fonction pour créer une app Vue
import { createPinia } from 'pinia'   // Gestionnaire d'état global

import App from './App.vue'           // Composant racine
import router from './router/index.js' // Système de navigation
import './style.css'                   // Styles Tailwind + globaux

// 1. Créer l'application Vue avec le composant racine App.vue
const app = createApp(App)

// 2. Installer Pinia (pour le state management global)
//    Pinia remplace Vuex dans Vue 3
//    Il permet de partager des données entre tous les composants
app.use(createPinia())

// 3. Installer Vue Router (pour la navigation entre pages)
app.use(router)

// 4. Monter l'application dans la balise <div id="app"> de index.html
app.mount('#app')
