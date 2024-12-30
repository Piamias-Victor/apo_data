import { useEffect, useState } from 'react';
import { fetchSpecificities, Specificity } from '@/libs/specificities';

/**
 * Hook personnalisé pour récupérer les spécificités depuis l'API.
 * 
 * @returns Un objet contenant le tableau des spécificités (`Specificity[]`), l'état de chargement (`boolean`) et les erreurs éventuelles (`string | null`).
 */
export const useSpecificities = () => {
  const [specificities, setSpecificities] = useState<Specificity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getSpecificities() {
      try {
        setLoading(true);
        const fetchedSpecificities = await fetchSpecificities();
        setSpecificities(fetchedSpecificities);
      } catch (err) {
        console.error('Erreur lors de la récupération des spécificités:', err);
        setError('Échec de la récupération des spécificités');
      } finally {
        setLoading(false);
      }
    }

    getSpecificities();
  }, []);

  return { specificities, loading, error };
};
