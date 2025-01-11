// src/pages/index.tsx

import React from 'react';
import SalesTable from './components/SalesTable';

/**
 * Page d'accueil de l'application.
 * 
 * Affiche la liste des ventes récupérées via le contexte.
 * 
 * @returns Un élément JSX représentant la page d'accueil avec la liste des ventes.
 */
export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Bienvenue sur Apo Data</h1>
      <p className="text-gray-600 mt-2">Votre solution d analyse pour les pharmacies.</p>
      <SalesTable/>
    </div>
  );
}
