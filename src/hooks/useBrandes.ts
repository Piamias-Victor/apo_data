// /hooks/useLabDistributors.ts
import { fetchLabDistributors } from '@/libs/brands';
import { LabDistributor } from '@/types/Brand';
import { useEffect, useState } from 'react';


/**
 * Hook personnalisé pour récupérer la liste des labDistributors depuis l'API.
 */
export const useLabDistributors = () => {
  const [labDistributors, setLabDistributors] = useState<LabDistributor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getLabDistributors() {
      try {
        setLoading(true);
        const fetched = await fetchLabDistributors();
        setLabDistributors(fetched);
      } catch (err) {
        console.error('Erreur lors de la récupération des labDistributors:', err);
        setError('Échec de la récupération des labDistributors');
      } finally {
        setLoading(false);
      }
    }

    getLabDistributors();
  }, []);

  return { labDistributors, loading, error };
};
