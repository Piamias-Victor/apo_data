// src/contexts/segmentation.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useSegmentations } from '@/hooks/useSegmentation';
import { Segmentation } from '@/types/Segmentation';

/**
 * Type définissant la structure du contexte des segmentations.
 */
type SegmentationContextType = {
  segmentations: Segmentation[];
  loading: boolean;
  error: string | null;
};

/**
 * Création du contexte pour les segmentations.
 */
const SegmentationContext = createContext<SegmentationContextType | undefined>(undefined);

/**
 * Provider pour le contexte des segmentations.
 * 
 * Enveloppe les composants enfants et fournit les segmentations récupérées via `useSegmentations`.
 * 
 * @param children - Les composants enfants à envelopper.
 * @returns Un composant React fournissant le contexte des segmentations.
 */
export const SegmentationProvider = ({ children }: { children: ReactNode }) => {
  const { segmentations, loading, error } = useSegmentations();

  return (
    <SegmentationContext.Provider value={{ segmentations, loading, error }}>
      {children}
    </SegmentationContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des segmentations.
 * 
 * @returns Le contexte des segmentations (`SegmentationContextType`).
 * @throws Erreur si utilisé en dehors du `SegmentationProvider`.
 */
export const useSegmentationContext = () => {
  const context = useContext(SegmentationContext);
  if (!context) {
    throw new Error('useSegmentationContext doit être utilisé au sein d\'un SegmentationProvider');
  }
  return context;
};
