import React, { createContext, useContext, ReactNode } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";

export interface FinancialContextType {
  totalRevenue: number | null;
  totalPurchase: number | null;
  totalMargin: number | null;
  totalQuantity: number | null;
  averageSellingPrice: number | null;
  averagePurchasePrice: number | null;
  marginPercentage: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les données financières.
 */
const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

/**
 * Provider pour le contexte des données financières.
 */
export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const { financialData, loading, error } = useFinancialData();

  const totalRevenue = financialData?.totalRevenue || null;
  const totalPurchase = financialData?.totalPurchase || null;
  const totalMargin = financialData?.totalMargin || null;
  const totalQuantity = financialData?.totalQuantity || null;
  const averageSellingPrice = financialData?.averageSellingPrice || null;
  const averagePurchasePrice = financialData?.averagePurchasePrice || null;
  const marginPercentage = financialData?.marginPercentage || null;

  return (
    <FinancialContext.Provider
      value={{
        totalRevenue,
        totalPurchase,
        totalMargin,
        totalQuantity,
        averageSellingPrice,
        averagePurchasePrice,
        marginPercentage,
        loading,
        error,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des données financières.
 * 
 * @returns Le contexte des données financières.
 */
export const useFinancialContext = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error("useFinancialContext doit être utilisé dans un FinancialProvider");
  }
  return context;
};
