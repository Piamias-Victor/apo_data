// src/contexts/sell-out/WorstLabsRegressionContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useWorstLabsRegression } from "@/hooks/sell-out/useWorstLabsRegression";

export interface LabRegression {
  lab: string;
  regressionRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number;
}

export interface WorstLabsRegressionContextType {
  labs: LabRegression[];
  loading: boolean;
  error: string | null;
}

const WorstLabsRegressionContext = createContext<WorstLabsRegressionContextType | undefined>(undefined);

export const WorstLabsRegressionProvider = ({ children }: { children: ReactNode }) => {
  // si vous voulez dépendre d'un autre contexte, par ex. 'bestLabs', etc.
  // const { loading: somethingLoading, error: somethingError } = useSomethingContext();
  // const skipFetch = somethingLoading || !!somethingError;
  const skipFetch = false;

  const { labsData, loading, error } = useWorstLabsRegression(skipFetch);

  const labs = labsData?.regressionLabs || [];

  return (
    <WorstLabsRegressionContext.Provider
      value={{
        labs,
        loading,
        error,
      }}
    >
      {children}
    </WorstLabsRegressionContext.Provider>
  );
};

export const useWorstLabsRegressionContext = () => {
  const context = useContext(WorstLabsRegressionContext);
  if (!context) {
    throw new Error("useWorstLabsRegressionContext doit être utilisé dans un WorstLabsRegressionProvider");
  }
  return context;
};