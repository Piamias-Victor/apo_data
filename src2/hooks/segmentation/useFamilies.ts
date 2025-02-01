import { fetchFamilies } from '@/libs/fetch/segmentation/families';
import { useEffect, useState, useCallback } from 'react';

/**
 * Hook personnalisé pour récupérer la liste des familles et sous-familles depuis l'API.
 */
export const useFamilies = () => {
  const [families, setFamilies] = useState<{ family: string; sub_families: string[] }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getFamilies = useCallback(async () => {
    try {
      setLoading(true);
      const fetched = await fetchFamilies();
      setFamilies(fetched);
    } catch (err) {
      console.error('Erreur lors de la récupération des familles:', err);
      setError('Échec de la récupération des familles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getFamilies();
  }, [getFamilies]);

  return { families, loading, error };
};