import { fetchData } from './fetch';

/**
 * Type définissant une spécificité unique.
 */
export type Specificity = {
  specificity: string;
};

/**
 * Récupère les spécificités uniques depuis l'API `/api/data_specificities`.
 * 
 * @returns Une promesse résolvant en un tableau d'objets `Specificity`.
 * @throws Erreur si la requête échoue ou si les données sont invalides.
 */
export const fetchSpecificities = async (): Promise<Specificity[]> => {
  return await fetchData<Specificity[]>('/api/data_specificities', (data: unknown) => {
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide pour les spécificités');
    }

    return data.map((item) => {
      if (typeof item !== 'object' || item === null || typeof (item as Specificity).specificity !== 'string') {
        throw new Error('Données de specificity invalides');
      }

      return item as Specificity;
    });
  });
};
