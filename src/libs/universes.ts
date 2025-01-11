import { Universe } from '@/types/Universe';
import { fetchData } from './fetch';

/**
 * Fonction pour récupérer les univers, catégories et sous-catégories depuis l'API.
 * 
 * @returns Promise contenant la liste des segmentations.
 */
export const fetchUniverses = async (): Promise<Universe[]> => {
  const data = await fetchData<Universe[]>('/api/universes', (data: unknown) => {
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide');
    }
    return data as Universe[];
  });

  return data;
};