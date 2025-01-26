import React, { createContext, useContext, ReactNode } from "react";
import { usePeakSales } from "@/hooks/sell-out/usePeakSales";

export interface PeakSalesContextType {
  peakSales: {
    date: string;
    product: string;
    code: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les périodes de pics de vente.
 */
const PeakSalesContext = createContext<PeakSalesContextType | undefined>(undefined);

/**
 * Provider pour le contexte des périodes de pics de vente.
 */
export const PeakSalesProvider = ({ children }: { children: ReactNode }) => {
  const { peakSalesData, loading, error } = usePeakSales();

  const peakSales = peakSalesData?.peakSales || [];

  return (
    <PeakSalesContext.Provider
      value={{
        peakSales,
        loading,
        error,
      }}
    >
      {children}
    </PeakSalesContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des périodes de pics de vente.
 */
export const usePeakSalesContext = () => {
  const context = useContext(PeakSalesContext);
  if (!context) {
    throw new Error("usePeakSalesContext doit être utilisé dans un PeakSalesProvider");
  }
  return context;
};