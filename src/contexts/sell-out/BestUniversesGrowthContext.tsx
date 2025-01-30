// src/contexts/sell-out/BestUniversesGrowthContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useBestUniversesGrowth } from "@/hooks/sell-out/useBestUniversesGrowth";
import { useSalesByDayContext } from "./SalesByDayContext";

export interface UniverseGrowth {
  universe: string;
  growthRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number;
}

export interface BestUniversesGrowthContextType {
  universes: UniverseGrowth[];
  loading: boolean;
  error: string | null;
}

const BestUniversesGrowthContext = createContext<BestUniversesGrowthContextType | undefined>(undefined);

export const BestUniversesGrowthProvider = ({ children }: { children: ReactNode }) => {
  // si besoin d'un skip en fonction d'un parent
  const { loading: financialLoading, error: financialError } = useSalesByDayContext();
  
  const skipFetch = financialLoading || !!financialError;

  const { universesData, loading, error } = useBestUniversesGrowth(skipFetch);

  const universes = universesData?.growthUniverses || [];

  return (
    <BestUniversesGrowthContext.Provider value={{ universes, loading, error }}>
      {children}
    </BestUniversesGrowthContext.Provider>
  );
};

export const useBestUniversesGrowthContext = () => {
  const context = useContext(BestUniversesGrowthContext);
  if (!context) {
    throw new Error("useBestUniversesGrowthContext doit être utilisé dans un BestUniversesGrowthProvider");
  }
  return context;
};