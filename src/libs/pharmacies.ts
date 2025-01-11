// src/libs/pharmacies.ts

import { Pharmacy } from '@/types/Pharmacy';
import { fetchData } from './fetch';

/**
 * Fonction pour récupérer les pharmacies depuis l'API.
 * 
 * @returns Promise avec la liste des pharmacies.
 */
export const fetchPharmacies = async (): Promise<Pharmacy[]> => {
  const data = await fetchData<{ pharmacies: Pharmacy[] }>('/api/pharmacies', (data: unknown) => {
    if (
      typeof data !== 'object' ||
      data === null ||
      !('pharmacies' in data) ||
      !Array.isArray((data as { pharmacies: unknown }).pharmacies) ||
      !(data as { pharmacies: Pharmacy[] }).pharmacies.every(item =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'created_at' in item &&
        'updated_at' in item &&
        'id_nat' in item &&
        'name' in item &&
        'ca' in item &&
        'area' in item &&
        'employees_count' in item &&
        'address' in item
      )
    ) {
      throw new Error('Format de données invalide');
    }
    return data as { pharmacies: Pharmacy[] };
  });

  return data.pharmacies;
};
