// =============================================================
// src/services/api.js
// Configuration Axios — SamakMarket
// =============================================================

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ── Intercepteur REQUÊTE : ajoute le token JWT auto ───────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (erreur) => Promise.reject(erreur)
)

// ── Intercepteur RÉPONSE : gère les erreurs globales ──────────
api.interceptors.response.use(
  (response) => response,

  (erreur) => {
    if (erreur.response) {

      if (erreur.response.status === 401) {
        // ⚠️ IMPORTANT : ne PAS rediriger si on est déjà sur /login
        // Sinon : mauvais mot de passe → 401 → redirect /login → vide les champs
        const surPageLogin = window.location.pathname === '/login'

        if (!surPageLogin) {
          // Session expirée sur une autre page → déconnexion + redirect
          console.warn('⚠️ Session expirée, redirection vers login...')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        // Sur /login → on laisse le composant gérer l'erreur lui-même
      }

      if (erreur.response.status === 403) {
        console.warn('⚠️ Accès refusé : rôle insuffisant')
      }

      if (erreur.response.status >= 500) {
        console.error('❌ Erreur serveur :', erreur.response.data)
      }
    } else if (erreur.request) {
      console.error('❌ Serveur inaccessible. Vérifiez que le backend tourne.')
    }

    return Promise.reject(erreur)
  }
)

export default api