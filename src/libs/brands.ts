// /libs/labDistributors.ts
import { fetchData } from '@/libs/fetch'; 
import { LabDistributor } from '@/types/Brand';

/**
 * Fonction pour récupérer la liste des LabDistributors depuis l'API.
 */
export const fetchLabDistributors = async (): Promise<LabDistributor[]> => {
  const data = await fetchData<LabDistributor[]>('/api/brands', (data: unknown) => {
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide (LabDistributors)');
    }
    return data as LabDistributor[];
  });

  return data;
};
