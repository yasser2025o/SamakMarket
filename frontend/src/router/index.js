// // =============================================================
// // src/router/index.js — SamakMarket
// // Routes + gardes de sécurité par rôle
// // =============================================================

// import { createRouter, createWebHistory } from 'vue-router'
// import MarketplaceView from '../views/MarketplaceView.vue'

// const router = createRouter({
//   history: createWebHistory(),
//   routes: [

//     // ── Page publique ──────────────────────────────────────
//     {
//       path: '/',
//       name: 'marketplace',
//       component: MarketplaceView,
//       meta: { title: 'SamakMarket - Poisson Frais' },
//     },

//     // ── Auth ───────────────────────────────────────────────
//     {
//       path: '/login',
//       name: 'login',
//       component: () => import('../views/LoginView.vue'),
//       meta: { title: 'Connexion - SamakMarket' },
//     },
//     {
//       path: '/register',
//       name: 'register',
//       component: () => import('../views/RegisterView.vue'),
//       meta: { title: 'Inscription - SamakMarket' },
//     },

//     // ── Dashboard vendeur ──────────────────────────────────
//     // Accessible uniquement aux vendeurs (role = 'seller')
//     {
//       path: '/dashboard',
//       name: 'dashboard',
//       component: () => import('../views/DashboardView.vue'),
//       meta: {
//         title: 'Mon Dashboard - SamakMarket',
//         requiresAuth: true,
//         requiresRole: 'seller',  // ← SEULS les sellers entrent ici
//       },
//     },

//     // ── Dashboard admin ────────────────────────────────────
//     // Accessible uniquement aux admins (role = 'admin')
//     {
//       path: '/admin',
//       name: 'admin',
//       component: () => import('../views/AdminDashboardView.vue'),
//       meta: {
//         title: 'Admin - SamakMarket',
//         requiresAuth: true,
//         requiresRole: 'admin',   // ← SEULS les admins entrent ici
//       },
//     },

//     // ── Produit ────────────────────────────────────────────
//     {
//       path: '/products/:id',
//       name: 'product-detail',
//       component: () => import('../views/ProductDetailView.vue'),
//       meta: { title: 'Produit - SamakMarket' },
//     },

//     // ── 404 ────────────────────────────────────────────────
//     {
//       path: '/:pathMatch(.*)*',
//       redirect: '/',
//     },
//     {
//   path: '/carte',
//   name: 'carte',
//   component: () => import('../views/VendeurCarteView.vue'),
// },
//     // --- User session dashboard ---
// {
//   path: '/admin/vendeur/:id',
//   name: 'vendeur-session',
//   component: () => import('../views/VendeurSessionView.vue'),
//   meta: { requiresAuth: true, requiresRole: 'admin' }
// },
//   ],
// })

// // =============================================================
// // GARDE DE NAVIGATION
// // Vérifie les droits AVANT chaque changement de page
// // =============================================================
// router.beforeEach((to, from, next) => {

//   // 1. Titre de l'onglet
//   if (to.meta.title) document.title = to.meta.title

//   // 2. Récupérer l'utilisateur connecté depuis localStorage
//   const token = localStorage.getItem('token')
//   const user  = JSON.parse(localStorage.getItem('user') || 'null')

//   // 3. Page protégée mais pas connecté → Login
//   if (to.meta.requiresAuth && !token) {
//     return next({ name: 'login', query: { redirect: to.fullPath } })
//   }
//   // 4. Page avec rôle requis → vérifier le rôle
//   if (to.meta.requiresRole) {
//     const roleRequis = to.meta.requiresRole
//     const roleUser   = user?.role

//     if (roleUser !== roleRequis) {
//       // Mauvais rôle → rediriger vers le bon endroit
//       if (roleUser === 'admin')  return next({ name: 'admin' })
//       if (roleUser === 'seller') return next({ name: 'dashboard' })
//       return next({ name: 'marketplace' })
//     }
//   }
  

//   // 5. Tout est OK
//     next()
//     { path: '/carte', name: 'carte', component: () => import('../views/VendeurCarteView.vue') }
// })

// export default router
// =============================================================
// src/router/index.js — SamakMarket
// Routes + gardes de sécurité par rôle
// =============================================================

import { createRouter, createWebHistory } from 'vue-router'
import MarketplaceView from '../views/MarketplaceView.vue'
import LegalView from '../views/LegalView.vue'

const routes = [
  // ... vos autres routes
  {
    path: '/conditions-generales',
    name: 'Legal',
    component: LegalView
  }
]

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
