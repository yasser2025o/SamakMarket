/** @type {import('tailwindcss').Config} */
// =============================================================
// tailwind.config.js
// Configuration de Tailwind CSS
// =============================================================
// Tailwind CSS = bibliothèque de classes utilitaires
// Au lieu d'écrire du CSS, on utilise des classes :
//   bg-blue-800 = background-color: #1e40af
//   text-white  = color: white
//   p-4         = padding: 1rem
// =============================================================

export default {
  // Indiquer à Tailwind où trouver les classes utilisées
  // Il génère seulement le CSS pour les classes présentes dans ces fichiers
  content: [
    './index.html',
    './src/**/*.{vue,js,ts}', // Tous les fichiers Vue et JS dans src/
  ],
  theme: {
    extend: {
      // Tu peux ajouter tes propres couleurs ici
      colors: {
        ocean: '#0a2342',   // Bleu marine profond
        wave:  '#1565c0',   // Bleu vague
        foam:  '#e3f2fd',   // Bleu très clair
      },
    },
  },
  plugins: [],
}
