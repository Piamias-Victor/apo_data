// src/components/StructureTable.tsx

import React from 'react';
import { useStructureContext } from '@/contexts/structure';

/**
 * Composant pour afficher la structure de la base de données dans un tableau.
 */
export const StructureTable = () => {
  const { structure, loading, error } = useStructureContext();

  if (loading) {
    return <div>Chargement de la structure de la base de données...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!structure || Object.keys(structure).length === 0) {
    return <div>Aucune structure de base de données disponible.</div>;
  }

  return (
    <div className="overflow-x-auto">
      {Object.entries(structure).map(([tableName, columns]) => (
        <div key={tableName} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{tableName}</h2>
          <table className="min-w-full bg-white shadow-md rounded mb-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nom de la Colonne</th>
                <th className="py-2 px-4 border-b">Type de Donnée</th>
                <th className="py-2 px-4 border-b">Longueur Max</th>
                <th className="py-2 px-4 border-b">Nullable</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((column) => (
                <tr key={`${tableName}-${column.column_name}`}>
                  <td className="py-2 px-4 border-b">{column.column_name}</td>
                  <td className="py-2 px-4 border-b">{column.data_type}</td>
                  <td className="py-2 px-4 border-b">
                    {column.character_maximum_length ?? 'N/A'}
                  </td>
                  <td className="py-2 px-4 border-b">{column.is_nullable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
