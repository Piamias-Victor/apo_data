import { Pharmacy } from '@/types/Pharmacy';
import { fetchData } from './fetch';

/**
 * Récupère toutes les pharmacies depuis l'API `/api/data_pharmacies`.
 * 
 * @returns Une promesse résolvant en un tableau d'objets `Pharmacy`.
 * @throws Erreur si la requête échoue ou si les données sont invalides.
 */
export const fetchPharmacies = async (): Promise<Pharmacy[]> => {
  return await fetchData<Pharmacy[]>('/api/data_pharmacies', (data: unknown) => {
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide pour les pharmacies');
    }

    return data.map((item) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof (item as Pharmacy).id !== 'string' ||
        typeof (item as Pharmacy).created_at !== 'string' ||
        typeof (item as Pharmacy).updated_at !== 'string'
      ) {
        throw new Error('Données de pharmacie invalides');
      }

      return item as Pharmacy;
    });
  });
};
