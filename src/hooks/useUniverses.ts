import { useEffect, useState } from 'react';
import { fetchUniverses } from '@/libs/universes';
import { Universe } from '@/types/Universe';

/**
 * Hook personnalisé pour récupérer les univers depuis l'API.
 * 
 * @returns Un objet contenant les univers, l'état de chargement et les erreurs éventuelles.
 */
export const useUniverses = () => {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUniverses() {
      try {
        setLoading(true);
        const fetchedUniverses = await fetchUniverses();
        setUniverses(fetchedUniverses);
      } catch (err) {
        console.error('Erreur lors de la récupération des univers:', err);
        setError('Échec de la récupération des univers');
      } finally {
        setLoading(false);
      }
    }

    getUniverses();
  }, []);

  return { universes, loading, error };
};
