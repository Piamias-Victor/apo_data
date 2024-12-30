// src/pages/index.tsx

import { SalesTable } from '@/components/SalesTable';
import { StructureTable } from '@/components/StructureTable';
import React from 'react';

/**
 * Page d'accueil de l'application.
 * 
 * Enveloppe le contenu avec `SalesProvider` et `StructureProvider` pour fournir les contextes des ventes multiples et de la structure des tables.
 * Affiche les composants `SaleTable` et `StructureTable` pour montrer les ventes et la structure de la base de données.
 * 
 * @returns Un élément JSX représentant la page d'accueil avec les tableaux des ventes et de la structure.
 */
export default function Home() {
  return <>
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Structure</h1>
        <StructureTable /> 
      </div>
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-6 text-center">SalesTable</h1>
        <SalesTable /> 
      </div>
    </div>
  </>
}
