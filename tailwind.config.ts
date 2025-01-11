// tailwind.config.ts
import type { Config } from "tailwindcss";
import daisyui from 'daisyui';

/**
 * Configuration de Tailwind CSS.
 * 
 * Définit les chemins des fichiers à analyser pour les classes Tailwind.
 * Étend le thème avec des couleurs personnalisées utilisées dans le design.
 * Intègre DaisyUI comme plugin pour les composants.
 */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B301E",       // Couleur principale (ancien bg du header/footer)
        secondary: "#2A7B3B",     // Couleur secondaire (accents, hover sur textes)
        light: "#EFDEBA",         // Couleur hover ancienne background
        background: "#F5FFF8",    // Fond principal blanc-vert clair
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        apoData: { // Nom du thème personnalisé
          "primary": "#1B301E",
          "secondary": "#2A7B3B",
          "accent": "#EFDEBA",
          "neutral": "#3D4451",
          "base-100": "#F5FFF8",
          "info": "#2094f3",
          "success": "#009485",
          "warning": "#ff9900",
          "error": "#ff5724",
          // Vous pouvez ajouter d'autres propriétés selon vos besoins
        },
      },
      "light", // Inclure d'autres thèmes si nécessaire
      "dark",
    ],
  },
} satisfies Config;
