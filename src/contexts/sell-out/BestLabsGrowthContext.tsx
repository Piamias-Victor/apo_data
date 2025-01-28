// src/contexts/sell-out/BestLabsGrowthContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useBestLabsGrowth } from "@/hooks/sell-out/useBestLabsGrowth";

export interface LabGrowth {
  lab: string;
  growthRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number;
}

export interface BestLabsGrowthContextType {
  labs: LabGrowth[];
  loading: boolean;
  error: string | null;
}

const BestLabsGrowthContext = createContext<BestLabsGrowthContextType | undefined>(undefined);

export const BestLabsGrowthProvider = ({ children }: { children: ReactNode }) => {
  // Ex si vous voulez dépendre d'un autre contexte, ex: 'peakSales'
  // const { loading: peakLoading, error: peakError } = usePeakSalesContext();
  // const skipFetch = peakLoading || !!peakError;
  const skipFetch = false; // ou la cascade que vous voulez

  const { labsData, loading, error } = useBestLabsGrowth(skipFetch);

  const labs = labsData?.growthLabs || [];

  return (
    <BestLabsGrowthContext.Provider
      value={{
        labs,
        loading,
        error,
      }}
    >
      {children}
    </BestLabsGrowthContext.Provider>
  );
};

export const useBestLabsGrowthContext = () => {
  const context = useContext(BestLabsGrowthContext);
  if (!context) {
    throw new Error("useBestLabsGrowthContext doit être utilisé dans un BestLabsGrowthProvider");
  }
  return context;
};