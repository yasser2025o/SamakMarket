// =============================================================
// src/router/index.js
// Configuration de Vue Router - Navigation entre les pages
// =============================================================
// Vue Router gère la navigation dans l'application.
// Chaque "route" lie une URL à un composant Vue (une page).
//
// Sans rechargement de page → l'application reste rapide (SPA)
// SPA = Single Page Application
// =============================================================

import { createRouter, createWebHistory } from 'vue-router'

// Import des pages (on utilise l'import dynamique pour la performance)
// Le composant n'est chargé que quand on navigue vers cette page
import MarketplaceView from '../views/MarketplaceView.vue'

const router = createRouter({
  // createWebHistory = URLs propres sans # (ex: /products au lieu de /#/products)
  // Nécessite une configuration serveur en production
  history: createWebHistory(),

  routes: [
    {
      path: '/',                    // URL
      name: 'marketplace',          // Nom de la route (pour la navigation)
      component: MarketplaceView,   // Composant à afficher
      meta: { title: 'SamakMarket - Poisson Frais' }, // Métadonnées
    },
    {
      path: '/login',
      name: 'login',
      // Import dynamique : le fichier est chargé seulement quand nécessaire
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Connexion - SamakMarket' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: 'Inscription - SamakMarket' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: {
        title: 'Mon Dashboard - SamakMarket',
        requiresAuth: true,   // Cette page nécessite d'être connecté
        requiresSeller: true, // Et d'être vendeur
      },
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetailView.vue'),
      meta: { title: 'Produit - SamakMarket' },
    },
  ],
})

// =============================================================
// GARDE DE NAVIGATION (Navigation Guard)
// S'exécute avant chaque changement de page
// =============================================================
router.beforeEach((to, from, next) => {
  // Mettre à jour le titre de l'onglet du navigateur
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Vérifier les routes protégées
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      // Pas connecté → rediriger vers login
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }
  }

  next() // Autoriser la navigation
})

export default router
