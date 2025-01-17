// /contexts/FinancialContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";

interface FinancialContextType {
  totalRevenue: number | null;
  totalPurchase: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les données financières.
 */
const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

/**
 * Provider pour le contexte des données financières.
 * 
 * @param children - Composants enfants à inclure dans le contexte.
 */
export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const { financialData, loading, error } = useFinancialData();

  const totalRevenue = financialData?.totalRevenue || null;
  const totalPurchase = financialData?.totalPurchase || null;

  return (
    <FinancialContext.Provider value={{ totalRevenue, totalPurchase, loading, error }}>
      {children}
    </FinancialContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des données financières.
 * 
 * @returns Le contexte des données financières (`FinancialContextType`).
 * @throws Une erreur si utilisé en dehors du `FinancialProvider`.
 */
export const useFinancialContext = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error("useFinancialContext doit être utilisé dans un FinancialProvider");
  }
  return context;
};
