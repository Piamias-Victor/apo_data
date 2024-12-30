import React, { createContext, useContext, ReactNode } from 'react';
import { useSpecificities } from '@/hooks/useSpecificities';
import { Specificity } from '@/libs/specificities';

/**
 * Type définissant la structure du contexte des spécificités.
 */
type SpecificitiesContextType = {
  specificities: Specificity[];
  loading: boolean;
  error: string | null;
};

/**
 * Création du contexte pour les spécificités.
 */
const SpecificitiesContext = createContext<SpecificitiesContextType | undefined>(undefined);

/**
 * Provider pour le contexte des spécificités.
 * 
 * Enveloppe les composants enfants et fournit les données récupérées via `useSpecificities`.
 * 
 * @param children - Les composants enfants à envelopper.
 * @returns Un composant React fournissant le contexte des spécificités.
 */
export const SpecificitiesProvider = ({ children }: { children: ReactNode }) => {
  const { specificities, loading, error } = useSpecificities();

  return (
    <SpecificitiesContext.Provider value={{ specificities, loading, error }}>
      {children}
    </SpecificitiesContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des spécificités.
 * 
 * @returns Le contexte des spécificités (`SpecificitiesContextType`).
 * @throws Erreur si utilisé en dehors du `SpecificitiesProvider`.
 */
export const useSpecificitiesContext = () => {
  const context = useContext(SpecificitiesContext);
  if (!context) {
    throw new Error('useSpecificitiesContext doit être utilisé au sein d\'un SpecificitiesProvider');
  }
  return context;
};
