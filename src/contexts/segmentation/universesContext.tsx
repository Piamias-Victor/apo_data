import React, { createContext, useContext, ReactNode } from 'react';
import { useUniverses } from '@/hooks/segmentation/useUniverses';
import { Universe } from '@/types/Universe';

/**
 * Type du contexte des univers.
 */
type UniversesContextType = {
  universes: Universe[];
  loading: boolean;
  error: string | null;
};

/**
 * Création du contexte pour les univers.
 */
const UniversesContext = createContext<UniversesContextType | undefined>(undefined);

/**
 * Provider pour le contexte des univers.
 * 
 * @param children - Composants enfants
 * @returns Composant React
 */
export const UniversesProvider = ({ children }: { children: ReactNode }) => {
  const { universes, loading, error } = useUniverses();

  return (
    <UniversesContext.Provider value={{ universes, loading, error }}>
      {children}
    </UniversesContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des univers.
 * 
 * @returns Le contexte des univers (`UniversesContextType`).
 * @throws Erreur si utilisé en dehors du `UniversesProvider`.
 */
export const useUniversesContext = () => {
  const context = useContext(UniversesContext);
  if (!context) {
    throw new Error('useUniversesContext doit être utilisé dans un UniversesProvider');
  }
  return context;
};
