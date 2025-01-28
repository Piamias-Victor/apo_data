// src/contexts/sell-out/PriceAnomaliesContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { usePriceAnomalies } from "@/hooks/sell-out/usePriceAnomalies";

export interface PriceAnomaly {
  code: string; // Code de référence à 13 caractères
  productName: string;
  previousPrice: number;
  currentPrice: number;
  dateOfChange: string; // Format: YYYY-MM-DD
  percentageChange: number; // En pourcentage
}

export interface PriceAnomaliesContextType {
  anomalies: PriceAnomaly[];
  loading: boolean;
  error: string | null;
}

const PriceAnomaliesContext = createContext<PriceAnomaliesContextType | undefined>(undefined);

export const PriceAnomaliesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Si vous avez besoin de dépendre d'un autre contexte, par exemple 'peakSales'
  // const { loading: peakLoading, error: peakError } = usePeakSalesContext();
  // const skipFetch = peakLoading || !!peakError;
  const skipFetch = false; // ou la condition que vous souhaitez

  const { anomaliesData, loading, error } = usePriceAnomalies(skipFetch);

  const anomalies = anomaliesData?.anomalies || [];

  return (
    <PriceAnomaliesContext.Provider
      value={{
        anomalies,
        loading,
        error,
      }}
    >
      {children}
    </PriceAnomaliesContext.Provider>
  );
};

export const usePriceAnomaliesContext = () => {
  const context = useContext(PriceAnomaliesContext);
  if (!context) {
    throw new Error("usePriceAnomaliesContext doit être utilisé dans un PriceAnomaliesProvider");
  }
  return context;
};