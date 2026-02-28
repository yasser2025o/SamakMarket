// =============================================================
// src/stores/auth.js
// Store Pinia pour la gestion de l'authentification
// =============================================================
// Pinia = gestionnaire d'état global pour Vue.js
//
// Pourquoi un store ?
// Si on stocke le token seulement dans un composant, les autres
// composants ne peuvent pas y accéder. Pinia crée un "état global"
// partagé par TOUS les composants de l'application.
//
// Structure d'un store Pinia (composition API) :
//   - state    : les données (ref, reactive)
//   - getters  : données calculées (computed)
//   - actions  : fonctions qui modifient l'état (async)
// =============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

// defineStore('nom', fonction de composition)
// Le 'nom' permet d'identifier le store (utile pour le debugging)
export const useAuthStore = defineStore('auth', () => {

  // ==========================================================
  // STATE - Les données stockées
  // ==========================================================

  // Récupérer les données persistées dans localStorage
  // (pour survivre au rechargement de page)
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(
    JSON.parse(localStorage.getItem('user') || 'null')
  )

  // ==========================================================
  // GETTERS - Données calculées depuis le state
  // ==========================================================

  // L'utilisateur est connecté si on a un token
  const estConnecte = computed(() => !!token.value)

  // Vérifier le rôle de l'utilisateur
  const estVendeur = computed(() => user.value?.role === 'seller')
  const estAdmin   = computed(() => user.value?.role === 'admin')

  // ==========================================================
  // ACTIONS - Fonctions pour modifier le state
  // ==========================================================

  // Sauvegarder les données de connexion
  const sauvegarderSession = (tokenRecu, userRecu) => {
    token.value = tokenRecu
    user.value  = userRecu

    // Persister dans localStorage (survit au rechargement)
    localStorage.setItem('token', tokenRecu)
    localStorage.setItem('user', JSON.stringify(userRecu))
  }

  // Action : Se connecter
  const seConnecter = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      sauvegarderSession(data.token, data.user)
      return { succes: true, message: data.message }
    } catch (erreur) {
      // Extraire le message d'erreur du backend
      const message = erreur.response?.data?.message || 'Erreur de connexion'
      return { succes: false, message }
    }
  }

  // Action : S'inscrire
  const sInscrire = async (donnees) => {
    try {
      const { data } = await api.post('/auth/register', donnees)
      sauvegarderSession(data.token, data.user)
      return { succes: true, message: data.message }
    } catch (erreur) {
      const message = erreur.response?.data?.message || 'Erreur d\'inscription'
      return { succes: false, message }
    }
  }

  // Action : Se déconnecter
  const seDeconnecter = () => {
    token.value = null
    user.value  = null

    // Effacer le localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Action : Rafraîchir le profil depuis l'API
  const rafraichirProfil = async () => {
    try {
      const { data } = await api.get('/auth/me')
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch {
      // Si erreur → déconnecter (token probablement expiré)
      seDeconnecter()
    }
  }

  // Exposer tout ce dont les composants ont besoin
  return {
    // State
    token,
    user,
    // Getters
    estConnecte,
    estVendeur,
    estAdmin,
    // Actions
    seConnecter,
    sInscrire,
    seDeconnecter,
    rafraichirProfil,
  }
})
