// src/contexts/structure.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useStructure } from '@/hooks/useStructure';
import { TableStructure } from '@/types/Structure';

/**
 * Type définissant la structure du contexte des tables.
 */
type StructureContextType = {
  structure: TableStructure | null;
  loading: boolean;
  error: string | null;
};

/**
 * Création du contexte pour la structure des tables.
 */
const StructureContext = createContext<StructureContextType | undefined>(undefined);

/**
 * Provider pour le contexte de la structure des tables.
 * 
 * Enveloppe les composants enfants et fournit la structure récupérée via `useStructure`.
 * 
 * @param children - Les composants enfants à envelopper.
 * @returns Un composant React fournissant le contexte de la structure des tables.
 */
export const StructureProvider = ({ children }: { children: ReactNode }) => {
  const { structure, loading, error } = useStructure();

  return (
    <StructureContext.Provider value={{ structure, loading, error }}>
      {children}
    </StructureContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte de la structure des tables.
 * 
 * @returns Le contexte de la structure des tables (`StructureContextType`).
 * @throws Erreur si utilisé en dehors du `StructureProvider`.
 */
export const useStructureContext = () => {
  const context = useContext(StructureContext);
  if (!context) {
    throw new Error('useStructureContext must be used within a StructureProvider');
  }
  return context;
};
