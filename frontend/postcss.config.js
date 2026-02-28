// postcss.config.js
// PostCSS est nécessaire pour que Tailwind fonctionne
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // Ajoute automatiquement les préfixes CSS (-webkit-, etc.)
  },
}
