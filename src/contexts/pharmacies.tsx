import React, { createContext, useContext, ReactNode } from 'react';
import { usePharmacies } from '@/hooks/usePharmacies';
import { Pharmacy } from '@/types/Pharmacy';

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
 * Enveloppe les composants enfants et fournit les données récupérées via `usePharmacies`.
 * 
 * @param children - Les composants enfants à envelopper.
 * @returns Un composant React fournissant le contexte des pharmacies.
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
    throw new Error('usePharmaciesContext doit être utilisé au sein d\'un PharmaciesProvider');
  }
  return context;
};
