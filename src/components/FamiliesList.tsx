// src/components/FamiliesList.tsx

import React from 'react';
import { useFamiliesContext } from '@/contexts/familiesContext';

/**
 * Composant pour afficher la liste des familles avec leurs sous-familles.
 */
export const FamiliesList = () => {
  const { families, loading, error } = useFamiliesContext();

  if (loading) {
    return <div>Chargement des familles...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (families.length === 0) {
    return <div>Aucune famille disponible.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Famille</th>
            <th className="py-2 px-4 border-b">Sous-Familles</th>
          </tr>
        </thead>
        <tbody>
          {families.map((family, familyIndex) => (
            <tr key={`family-${family.family}-${familyIndex}`}>
              <td className="py-2 px-4 border-b">{family.family}</td>
              <td className="py-2 px-4 border-b">
                {family.sub_families.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {family.sub_families.map((subFamily, subIndex) => (
                      <li key={`subFamily-${subFamily.sub_family}-${subIndex}`}>
                        {subFamily.sub_family}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'Aucune sous-famille'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
