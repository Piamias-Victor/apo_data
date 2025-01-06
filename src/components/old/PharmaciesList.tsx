import React from 'react';
import { usePharmaciesContext } from '@/contexts/pharmacies';

/**
 * Composant pour afficher la liste des pharmacies.
 */
export const PharmaciesList = () => {
  const { pharmacies, loading, error } = usePharmaciesContext();

  if (loading) {
    return <div>Chargement des pharmacies...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (pharmacies.length === 0) {
    return <div>Aucune pharmacie disponible.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nom</th>
            <th className="py-2 px-4 border-b">CA</th>
            <th className="py-2 px-4 border-b">Surface</th>
            <th className="py-2 px-4 border-b">Nombre d employés</th>
            <th className="py-2 px-4 border-b">Adresse</th>
          </tr>
        </thead>
        <tbody>
          {pharmacies.map((pharmacy, index) => (
            <tr key={`pharmacy-${pharmacy.id}-${index}`}>
              <td className="py-2 px-4 border-b">{pharmacy.name ?? 'N/A'}</td>
              <td className="py-2 px-4 border-b">{pharmacy.ca ?? 'N/A'}</td>
              <td className="py-2 px-4 border-b">{pharmacy.area ?? 'N/A'}</td>
              <td className="py-2 px-4 border-b">{pharmacy.employees_count ?? 'N/A'}</td>
              <td className="py-2 px-4 border-b">{pharmacy.address ?? 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
