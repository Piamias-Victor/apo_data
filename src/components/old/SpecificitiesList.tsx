import React from 'react';
import { useSpecificities } from '@/hooks/useSpecificities';

/**
 * Composant pour afficher la liste des spécificités uniques.
 */
export const SpecificitiesList = () => {
  const { specificities, loading, error } = useSpecificities();

  if (loading) {
    return <div>Chargement des spécificités...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (specificities.length === 0) {
    return <div>Aucune spécificité disponible.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Spécificité</th>
          </tr>
        </thead>
        <tbody>
          {specificities.map((specificity, index) => (
            <tr key={`specificity-${specificity.specificity}-${index}`}>
              <td className="py-2 px-4 border-b">{specificity.specificity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
