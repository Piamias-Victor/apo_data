import { fetchData } from '@/libs/fetch/fetch';

/**
 * Fonction pour récupérer la liste des familles et sous-familles depuis l'API.
 */
export const fetchFamilies = async () => {
  return fetchData<{ family: string; sub_families: string[] }[]>(
    '/api/segmentation/families',
    (data: unknown) => {
      if (!Array.isArray(data)) {
        throw new Error('Format de données invalide (Families)');
      }
      return data;
    }
  );
};