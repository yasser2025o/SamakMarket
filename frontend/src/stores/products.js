// =============================================================
// src/stores/products.js
// Store Pinia pour la gestion des produits
// =============================================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useProductStore = defineStore('products', () => {

  // --- State ---
  const produits    = ref([])    // Liste des produits affichés
  const pagination  = ref({ total: 0, page: 1, pages: 1, limit: 12 })
  const chargement  = ref(false) // Indicateur de chargement
  const erreur      = ref(null)  // Message d'erreur si problème

  // --- Actions ---

  // Charger les produits avec des filtres optionnels
  const chargerProduits = async (filtres = {}) => {
    chargement.value = true
    erreur.value = null

    try {
      const { data } = await api.get('/products', { params: filtres })
      produits.value   = data.produits
      pagination.value = data.pagination
    } catch (e) {
      erreur.value = 'Impossible de charger les produits. Réessayez.'
      console.error('Erreur chargement produits :', e)
    } finally {
      // "finally" s'exécute toujours, succès ou erreur
      chargement.value = false
    }
  }

  // Créer un nouveau produit (vendeur)
  const creerProduit = async (donnees) => {
    try {
      const { data } = await api.post('/products', donnees)
      return { succes: true, produit: data.produit }
    } catch (e) {
      return { succes: false, message: e.response?.data?.message || 'Erreur création' }
    }
  }

  // Supprimer un produit
  const supprimerProduit = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      // Retirer le produit de la liste locale
      produits.value = produits.value.filter(p => p.id !== id)
      return { succes: true }
    } catch (e) {
      return { succes: false, message: e.response?.data?.message || 'Erreur suppression' }
    }
  }

  return {
    produits, pagination, chargement, erreur,
    chargerProduits, creerProduit, supprimerProduit,
  }
})
