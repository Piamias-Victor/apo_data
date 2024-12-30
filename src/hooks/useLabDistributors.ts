// src/hooks/useLabDistributors.ts

import { useEffect, useState } from 'react';
import { fetchLabDistributors } from '@/libs/labDistributors';
import { LabDistributor } from '@/types/Segmentation';

/**
 * Hook personnalisé pour récupérer les `lab_distributors` avec leurs `brand_labs` et `range_names` depuis l'API.
 * 
 * @returns Un objet contenant le tableau des `lab_distributors` (`LabDistributor[]`), l'état de chargement (`boolean`) et les erreurs éventuelles (`string | null`).
 */
export const useLabDistributors = () => {
  const [labDistributors, setLabDistributors] = useState<LabDistributor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fonction asynchrone pour récupérer et mettre à jour les `lab_distributors`.
     */
    async function getLabDistributors() {
      try {
        setLoading(true);
        const fetchedData = await fetchLabDistributors();
        setLabDistributors(fetchedData);
      } catch (err) {
        console.error('Erreur lors de la récupération des lab_distributors:', err);
        setError('Échec de la récupération des lab_distributors');
      } finally {
        setLoading(false);
      }
    }

    getLabDistributors();
  }, []);

  return { labDistributors, loading, error };
};
