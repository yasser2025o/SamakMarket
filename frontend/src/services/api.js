// =============================================================
// src/services/api.js
// Configuration de l'instance Axios pour les appels API
// =============================================================
// Axios est une bibliothèque pour faire des requêtes HTTP.
// On crée une instance personnalisée pour éviter de répéter
// l'URL de base et le token JWT dans chaque appel.
//
// Utilisation dans un composant ou store :
//   import api from '@/services/api'
//   const { data } = await api.get('/products')
//   const { data } = await api.post('/auth/login', { email, password })
// =============================================================

import axios from 'axios'

// Créer une instance Axios avec la configuration de base
const api = axios.create({
  // L'URL vient de la variable d'environnement .env
  // import.meta.env = façon Vite de lire les variables d'environnement
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',

  headers: {
    'Content-Type': 'application/json', // On envoie/reçoit du JSON
  },

  timeout: 10000, // Abandonner si pas de réponse après 10 secondes
})

// =============================================================
// INTERCEPTEURS
// Code qui s'exécute automatiquement avant/après chaque requête
// =============================================================

// Intercepteur de REQUÊTE : ajouter le token JWT automatiquement
// Avant chaque requête → on vérifie si un token est stocké
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      // Ajouter le token dans le header de la requête
      // Le backend le lira pour identifier l'utilisateur
      config.headers.Authorization = `Bearer ${token}`
    }

    return config // Laisser partir la requête
  },
  (erreur) => {
    // Erreur avant l'envoi (rare)
    return Promise.reject(erreur)
  }
)

// Intercepteur de RÉPONSE : gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response, // Tout va bien → laisser passer

  (erreur) => {
    // Analyser le type d'erreur
    if (erreur.response) {
      // Le serveur a répondu avec un code d'erreur (4xx, 5xx)

      if (erreur.response.status === 401) {
        // 401 = Non autorisé (token invalide ou expiré)
        console.warn('⚠️ Session expirée, redirection vers login...')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Rediriger vers la page de login
        window.location.href = '/login'
      }

      if (erreur.response.status === 403) {
        // 403 = Accès refusé (rôle insuffisant)
        console.warn('⚠️ Accès refusé : rôle insuffisant')
      }

      if (erreur.response.status >= 500) {
        // 5xx = Erreur serveur
        console.error('❌ Erreur serveur :', erreur.response.data)
      }
    } else if (erreur.request) {
      // La requête a été envoyée mais pas de réponse
      console.error('❌ Serveur inaccessible. Vérifiez que le backend tourne.')
    }

    // Propager l'erreur pour que le composant puisse la gérer
    return Promise.reject(erreur)
  }
)

export default api
