// src/contexts/labDistributors.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useLabDistributors } from '@/hooks/useLabDistributors';
import { LabDistributor } from '@/types/Segmentation';

/**
 * Type définissant la structure du contexte des `lab_distributors`.
 */
type LabDistributorsContextType = {
  labDistributors: LabDistributor[];
  loading: boolean;
  error: string | null;
};

/**
 * Création du contexte pour les `lab_distributors`.
 */
const LabDistributorsContext = createContext<LabDistributorsContextType | undefined>(undefined);

/**
 * Provider pour le contexte des `lab_distributors`.
 * 
 * Enveloppe les composants enfants et fournit les données récupérées via `useLabDistributors`.
 * 
 * @param children - Les composants enfants à envelopper.
 * @returns Un composant React fournissant le contexte des `lab_distributors`.
 */
export const LabDistributorsProvider = ({ children }: { children: ReactNode }) => {
  const { labDistributors, loading, error } = useLabDistributors();

  return (
    <LabDistributorsContext.Provider value={{ labDistributors, loading, error }}>
      {children}
    </LabDistributorsContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des `lab_distributors`.
 * 
 * @returns Le contexte des `lab_distributors` (`LabDistributorsContextType`).
 * @throws Erreur si utilisé en dehors du `LabDistributorsProvider`.
 */
export const useLabDistributorsContext = () => {
  const context = useContext(LabDistributorsContext);
  if (!context) {
    throw new Error('useLabDistributorsContext doit être utilisé au sein d\'un LabDistributorsProvider');
  }
  return context;
};
