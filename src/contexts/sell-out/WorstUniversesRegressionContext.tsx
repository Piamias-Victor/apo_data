// src/contexts/sell-out/WorstUniversesRegressionContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useWorstUniversesRegression } from "@/hooks/sell-out/useWorstUniversesRegression";

export interface UniverseRegression {
  universe: string;
  regressionRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number;
}

export interface WorstUniversesRegressionContextType {
  universes: UniverseRegression[];
  loading: boolean;
  error: string | null;
}

const WorstUniversesRegressionContext = createContext<WorstUniversesRegressionContextType | undefined>(undefined);

export const WorstUniversesRegressionProvider = ({ children }: { children: ReactNode }) => {
  // si vous voulez un skip en fonction d’un parent contexte
  const skipFetch = false;

  const { universesData, loading, error } = useWorstUniversesRegression(skipFetch);

  const universes = universesData?.regressionUniverses || [];

  return (
    <WorstUniversesRegressionContext.Provider value={{ universes, loading, error }}>
      {children}
    </WorstUniversesRegressionContext.Provider>
  );
};

export const useWorstUniversesRegressionContext = () => {
  const context = useContext(WorstUniversesRegressionContext);
  if (!context) {
    throw new Error("useWorstUniversesRegressionContext doit être utilisé dans un WorstUniversesRegressionProvider");
  }
  return context;
};