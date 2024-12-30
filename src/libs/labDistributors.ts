// src/libs/labDistributors.ts

import { LabDistributor } from '@/types/Segmentation';
import { fetchData } from './fetch';

/**
 * Récupère les `lab_distributors` uniques avec leurs `brand_labs` et `range_names` depuis l'API `/api/data_lab_distributors`.
 * 
 * @returns Une promesse résolvant en un tableau d'objets `LabDistributor`.
 * @throws Erreur si la requête échoue ou si les données sont invalides.
 */
export const fetchLabDistributors = async (): Promise<LabDistributor[]> => {
  return await fetchData<LabDistributor[]>('/api/data_lab_distributors', (data: unknown) => {
    // Vérifie que les données sont bien un tableau
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide');
    }

    // Vérifie que chaque élément du tableau est du type LabDistributor
    return data.map((item) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof (item as LabDistributor).lab_distributor !== 'string' ||
        !Array.isArray((item as LabDistributor).brand_labs)
      ) {
        throw new Error('Données de lab_distributor invalides');
      }

      const labDistributor = item as LabDistributor;

      // Vérifie que chaque brand_lab est valide
      labDistributor.brand_labs = labDistributor.brand_labs.map((bl) => {
        if (
          typeof bl.brand_lab !== 'string' ||
          !Array.isArray(bl.range_names)
        ) {
          throw new Error('Données de brand_lab invalides');
        }

        // Vérifie que chaque range_name est valide
        bl.range_names = bl.range_names.map((rn) => {
          if (typeof rn.range_name !== 'string') {
            throw new Error('Données de range_name invalides');
          }
          return { range_name: rn.range_name };
        });

        return bl;
      });

      return labDistributor;
    });
  });
};
