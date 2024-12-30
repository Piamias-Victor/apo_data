// src/hooks/useSegmentations.ts

import { useEffect, useState } from 'react';
import { Segmentation } from '@/types/Segmentation';
import { fetchSegmentations } from '@/libs/segmentation';

/**
 * Hook personnalisé pour récupérer les segmentations uniques avec leurs catégories et sous-catégories depuis l'API.
 * 
 * @returns Un objet contenant le tableau des segmentations (`Segmentation[]`), l'état de chargement (`boolean`) et les erreurs éventuelles (`string | null`).
 */
export const useSegmentations = () => {
  const [segmentations, setSegmentations] = useState<Segmentation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fonction asynchrone pour récupérer et mettre à jour les segmentations.
     */
    async function getSegmentations() {
      try {
        setLoading(true);
        const fetchedData = await fetchSegmentations();
        setSegmentations(fetchedData);
      } catch (err) {
        console.error('Erreur lors de la récupération des segmentations:', err);
        setError('Échec de la récupération des segmentations');
      } finally {
        setLoading(false);
      }
    }

    getSegmentations();
  }, []);

  return { segmentations, loading, error };
};
