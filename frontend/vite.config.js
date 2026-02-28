// =============================================================
// vite.config.js
// Configuration de Vite (outil de build et serveur de dev)
// =============================================================

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()], // Activer le support Vue.js

  resolve: {
    alias: {
      // @ = raccourci vers le dossier src/
      // Exemple : import ... from '@/stores/auth' au lieu de '../stores/auth'
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173, // Port du serveur de développement
  },
})
