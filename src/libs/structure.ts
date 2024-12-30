// src/libs/structure.ts

import { TableStructure } from '@/types/Structure';
import { fetchData } from './fetch';

/**
 * Récupère la structure de la base de données depuis l'API `/api/structure`.
 * 
 * @returns Une promesse résolvant en un objet `TableStructure` représentant la structure des tables.
 * @throws Erreur si la requête échoue ou si les données sont au mauvais format.
 */
export const fetchStructure = async (): Promise<TableStructure> => {
  return await fetchData<TableStructure>('/api/structure', (data: unknown) => {
    // Vérifie que les données sont bien un objet
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data format');
    }

    // Validation basique peut être ajoutée ici si nécessaire

    return data as TableStructure;
  });
};
