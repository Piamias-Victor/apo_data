// /contexts/labDistributorsContext.tsx
import { useLabDistributors } from '@/hooks/segmentation/useBrandes';
import { LabDistributor } from '@/types/Brand';
import React, { createContext, useContext, ReactNode } from 'react';

type LabDistributorsContextType = {
  labDistributors: LabDistributor[];
  loading: boolean;
  error: string | null;
};

const LabDistributorsContext = createContext<LabDistributorsContextType | undefined>(undefined);

export const LabDistributorsProvider = ({ children }: { children: ReactNode }) => {
  const { labDistributors, loading, error } = useLabDistributors();

  return (
    <LabDistributorsContext.Provider value={{ labDistributors, loading, error }}>
      {children}
    </LabDistributorsContext.Provider>
  );
};

export const useLabDistributorsContext = () => {
  const context = useContext(LabDistributorsContext);
  if (!context) {
    throw new Error('useLabDistributorsContext doit être utilisé dans un LabDistributorsProvider');
  }
  return context;
};
