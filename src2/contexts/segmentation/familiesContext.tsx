import { useFamilies } from '@/hooks/segmentation/useFamilies';
import React, { createContext, useContext, ReactNode, useMemo } from 'react';

type FamiliesContextType = {
  families: { family: string; sub_families: string[] }[];
  loading: boolean;
  error: string | null;
};

const FamiliesContext = createContext<FamiliesContextType | undefined>(undefined);

export const FamiliesProvider = ({ children }: { children: ReactNode }) => {
  const { families, loading, error } = useFamilies();

  // Utilisation de useMemo pour éviter les re-renders inutiles
  const value = useMemo(() => ({ families, loading, error }), [families, loading, error]);

  return (
    <FamiliesContext.Provider value={value}>
      {children}
    </FamiliesContext.Provider>
  );
};

export const useFamiliesContext = () => {
  const context = useContext(FamiliesContext);
  if (!context) {
    throw new Error('useFamiliesContext doit être utilisé dans un FamiliesProvider');
  }
  return context;
};