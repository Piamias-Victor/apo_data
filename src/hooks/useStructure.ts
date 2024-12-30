// src/hooks/useStructure.ts

import { useEffect, useState } from 'react';
import { TableStructure } from '@/types/Structure';
import { fetchStructure } from '@/libs/structure';

/**
 * Hook personnalisé pour récupérer la structure de la base de données.
 * 
 * Gère l'état de chargement, les données et les erreurs.
 * 
 * @returns Un objet contenant la structure des tables (`TableStructure`), l'état de chargement (`boolean`) et les erreurs (`string | null`).
 */
export const useStructure = () => {
  const [structure, setStructure] = useState<TableStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fonction asynchrone pour récupérer et mettre à jour la structure.
     */
    async function getStructure() {
      try {
        setLoading(true);
        const fetchedStructure = await fetchStructure();
        setStructure(fetchedStructure);
      } catch (err) {
        console.error('Error fetching structure:', err);
        setError('Failed to fetch database structure');
      } finally {
        setLoading(false);
      }
    }

    getStructure();
  }, []);

  return { structure, loading, error };
};
