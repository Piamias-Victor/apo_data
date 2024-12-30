// src/libs/segmentation.ts

import { Segmentation } from '@/types/Segmentation';
import { fetchData } from './fetch';

/**
 * Récupère les segmentations uniques avec leurs catégories et sous-catégories depuis l'API `/api/data_segmentation`.
 * 
 * @returns Une promesse résolvant en un tableau d'objets `Segmentation`.
 * @throws Erreur si la requête échoue ou si les données sont invalides.
 */
export const fetchSegmentations = async (): Promise<Segmentation[]> => {
  return await fetchData<Segmentation[]>('/api/data_segmentation', (data: unknown) => {
    // Vérifie que les données sont bien un tableau
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide');
    }

    // Vérifie que chaque élément du tableau est du type Segmentation
    return data.map((item) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof (item as Segmentation).universe !== 'string' ||
        !Array.isArray((item as Segmentation).categories)
      ) {
        throw new Error('Données de segmentation invalides');
      }

      const segmentation = item as Segmentation;

      // Vérifie que chaque catégorie est bien une chaîne de caractères
      segmentation.categories = segmentation.categories.map((cat) => {
        if (
          typeof cat.category !== 'string' ||
          !Array.isArray(cat.sub_categories)
        ) {
          throw new Error('Données de catégorie invalides');
        }

        // Vérifie que chaque sous-catégorie est bien une chaîne de caractères
        cat.sub_categories = cat.sub_categories.map((sub) => {
          if (typeof sub.sub_category !== 'string') {
            throw new Error('Données de sous-catégorie invalides');
          }
          return {
            sub_category: sub.sub_category,
          };
        });

        return cat;
      });

      return segmentation;
    });
  });
};
