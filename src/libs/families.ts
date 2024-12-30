// src/libs/families.ts

import { Family } from '@/types/Segmentation';
import { fetchData } from './fetch';

/**
 * Récupère toutes les familles avec leurs sous-familles depuis l'API `/api/data_families`.
 * 
 * @returns Une promesse résolvant en un tableau d'objets `Family`.
 * @throws Erreur si la requête échoue ou si les données sont invalides.
 */
export const fetchFamilies = async (): Promise<Family[]> => {
  return await fetchData<Family[]>('/api/data_families', (data: unknown) => {
    // Vérifie que les données sont bien un tableau
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide');
    }

    // Vérifie que chaque élément a la structure correcte
    return data.map((item) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof (item as Family).family !== 'string' ||
        !Array.isArray((item as Family).sub_families)
      ) {
        throw new Error('Données de family invalides');
      }

      const family = item as Family;

      // Vérifie que chaque sub_family est valide
      family.sub_families.forEach((sf) => {
        if (typeof sf.sub_family !== 'string') {
          throw new Error('Données de sub_family invalides');
        }
      });

      return family;
    });
  });
};
