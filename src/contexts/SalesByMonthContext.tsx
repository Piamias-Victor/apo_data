import React, { createContext, useContext, ReactNode } from "react";
import { useSalesByMonth } from "@/hooks/useSalesByMonth";

export interface SalesByMonthContextType {
  months: string[];
  quantities: number[];
  revenues: number[];
  margins: number[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les ventes par mois.
 */
const SalesByMonthContext = createContext<SalesByMonthContextType | undefined>(undefined);

/**
 * Provider pour le contexte des ventes par mois.
 */
export const SalesByMonthProvider = ({ children }: { children: ReactNode }) => {
  const { salesByMonthData, loading, error } = useSalesByMonth();

  const months = salesByMonthData?.months || [];
  const quantities = salesByMonthData?.quantities || [];
  const revenues = salesByMonthData?.revenues || [];
  const margins = salesByMonthData?.margins || [];

  return (
    <SalesByMonthContext.Provider
      value={{
        months,
        quantities,
        revenues,
        margins,
        loading,
        error,
      }}
    >
      {children}
    </SalesByMonthContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des ventes par mois.
 */
export const useSalesByMonthContext = () => {
  const context = useContext(SalesByMonthContext);
  if (!context) {
    throw new Error("useSalesByMonthContext doit être utilisé dans un SalesByMonthProvider");
  }
  return context;
};
