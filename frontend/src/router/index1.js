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
// =============================================================
// src/router/index.js — SamakMarket
// Routes + gardes de sécurité par rôle
// =============================================================

import { createRouter, createWebHistory } from 'vue-router'
import MarketplaceView from '../views/MarketplaceView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [

    // ── Page publique ──────────────────────────────────────
    {
      path: '/',
      name: 'marketplace',
      component: MarketplaceView,
      meta: { title: 'SamakMarket - Poisson Frais' },
    },

    // ── Auth ───────────────────────────────────────────────
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Connexion - SamakMarket' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: 'Inscription - SamakMarket' },
    },

    // ── Dashboard vendeur ──────────────────────────────────
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: {
        title: 'Mon Dashboard - SamakMarket',
        requiresAuth: true,
        requiresRole: 'seller',
      },
    },

    // ── Dashboard admin ────────────────────────────────────
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboardView.vue'),
      meta: {
        title: 'Admin - SamakMarket',
        requiresAuth: true,
        requiresRole: 'admin',
      },
    },

    // ── Produit ────────────────────────────────────────────
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetailView.vue'),
      meta: { title: 'Produit - SamakMarket' },
    },

    // ── Carte vendeurs ─────────────────────────────────────
    {
      path: '/carte',
      name: 'carte',
      component: () => import('../views/VendeurCarteView.vue'),
      meta: { title: 'Carte des vendeurs - SamakMarket' },
    },

    // ── Session vendeur (admin) ────────────────────────────
    {
      path: '/admin/vendeur/:id',
      name: 'vendeur-session',
      component: () => import('../views/VendeurSessionView.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },

    // ── 404 ────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },

  ],
})

// =============================================================
// GARDE DE NAVIGATION
// =============================================================
router.beforeEach((to, from, next) => {

  if (to.meta.title) document.title = to.meta.title

  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresRole) {
    const roleRequis = to.meta.requiresRole
    const roleUser   = user?.role
    if (roleUser !== roleRequis) {
      if (roleUser === 'admin')  return next({ name: 'admin' })
      if (roleUser === 'seller') return next({ name: 'dashboard' })
      return next({ name: 'marketplace' })
    }
  }

  next()
})


export default router
