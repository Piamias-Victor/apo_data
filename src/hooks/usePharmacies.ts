// src/hooks/usePharmacies.ts

import { useEffect, useState } from 'react';
import { fetchPharmacies } from '@/libs/pharmacies';
import { Pharmacy } from '@/types/Pharmacy';

/**
 * Hook personnalisé pour récupérer les pharmacies depuis l'API.
 * 
 * @returns Un objet contenant le tableau des pharmacies, l'état de chargement et les erreurs éventuelles.
 */
export const usePharmacies = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getPharmacies() {
      try {
        setLoading(true);
        const fetchedPharmacies = await fetchPharmacies();
        setPharmacies(fetchedPharmacies);
      } catch (err) {
        console.error('Erreur lors de la récupération des pharmacies:', err);
        setError('Échec de la récupération des pharmacies');
      } finally {
        setLoading(false);
      }
    }

    getPharmacies();
  }, []);

  return { pharmacies, loading, error };
};
