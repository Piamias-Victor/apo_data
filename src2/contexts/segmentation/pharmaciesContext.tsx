// src/contexts/pharmaciesContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { Pharmacy } from '@/types/Pharmacy';
import { usePharmacies } from '@/hooks/segmentation/usePharmacies';

/**
 * Type définissant la structure du contexte des pharmacies.
 */
type PharmaciesContextType = {
  pharmacies: Pharmacy[];
  loading: boolean;
  error: string | null;
};

/**
 * Création du contexte pour les pharmacies.
 */
const PharmaciesContext = createContext<PharmaciesContextType | undefined>(undefined);

/**
 * Provider pour le contexte des pharmacies.
 * 
 * @param children - Composants enfants
 * @returns Composant React
 */
export const PharmaciesProvider = ({ children }: { children: ReactNode }) => {
  const { pharmacies, loading, error } = usePharmacies();

  return (
    <PharmaciesContext.Provider value={{ pharmacies, loading, error }}>
      {children}
    </PharmaciesContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des pharmacies.
 * 
 * @returns Le contexte des pharmacies (`PharmaciesContextType`).
 * @throws Erreur si utilisé en dehors du `PharmaciesProvider`.
 */
export const usePharmaciesContext = () => {
  const context = useContext(PharmaciesContext);
  if (!context) {
    throw new Error('usePharmaciesContext doit être utilisé dans un PharmaciesProvider');
  }
  return context;
};
