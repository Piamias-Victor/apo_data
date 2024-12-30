// src/hooks/useFamilies.ts

import { useEffect, useState } from 'react';
import { fetchFamilies } from '@/libs/families';
import { Family } from '@/types/Segmentation';

/**
 * Hook personnalisé pour récupérer les familles depuis l'API.
 * 
 * @returns Un objet contenant le tableau des familles (`Family[]`), l'état de chargement (`boolean`) et les erreurs éventuelles (`string | null`).
 */
export const useFamilies = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fonction asynchrone pour récupérer et mettre à jour les familles.
     */
    async function getFamilies() {
      try {
        setLoading(true);
        const fetchedFamilies = await fetchFamilies();
        setFamilies(fetchedFamilies);
      } catch (err) {
        console.error('Erreur lors de la récupération des familles:', err);
        setError('Échec de la récupération des familles');
      } finally {
        setLoading(false);
      }
    }

    getFamilies();
  }, []);

  return { families, loading, error };
};
