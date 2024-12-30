// src/contexts/familiesContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useFamilies } from '@/hooks/useFamilies';
import { Family } from '@/types/Segmentation';

/**
 * Type définissant la structure du contexte des familles.
 */
type FamiliesContextType = {
  families: Family[];
  loading: boolean;
  error: string | null;
};

/**
 * Création du contexte pour les familles.
 */
const FamiliesContext = createContext<FamiliesContextType | undefined>(undefined);

/**
 * Provider pour le contexte des familles.
 * 
 * Enveloppe les composants enfants et fournit les données récupérées via `useFamilies`.
 * 
 * @param children - Les composants enfants à envelopper.
 * @returns Un composant React fournissant le contexte des familles.
 */
export const FamiliesProvider = ({ children }: { children: ReactNode }) => {
  const { families, loading, error } = useFamilies();

  return (
    <FamiliesContext.Provider value={{ families, loading, error }}>
      {children}
    </FamiliesContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des familles.
 * 
 * @returns Le contexte des familles (`FamiliesContextType`).
 * @throws Erreur si utilisé en dehors du `FamiliesProvider`.
 */
export const useFamiliesContext = () => {
  const context = useContext(FamiliesContext);
  if (!context) {
    throw new Error('useFamiliesContext doit être utilisé au sein d\'un FamiliesProvider');
  }
  return context;
};
