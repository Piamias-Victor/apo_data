import React, { createContext, useContext, ReactNode } from "react";
import { useStockoutUnivers } from "@/hooks/useStockoutUnivers";
import { StockoutUnivers } from "@/libs/stockout";

/**
 * Type définissant la structure du contexte des taux de rupture.
 */
type StockoutUniversContextType = {
  stockoutUnivers: StockoutUnivers[];
  loading: boolean;
  error: string | null;
};

/**
 * Création du contexte pour les taux de rupture.
 */
const StockoutUniversContext = createContext<StockoutUniversContextType | undefined>(undefined);

/**
 * Provider pour le contexte des taux de rupture par univers.
 * 
 * @param children - Composants enfants
 * @returns Composant React
 */
export const StockoutUniversProvider = ({ children }: { children: ReactNode }) => {
  const { stockoutUnivers, loading, error } = useStockoutUnivers();

  return (
    <StockoutUniversContext.Provider value={{ stockoutUnivers, loading, error }}>
      {children}
    </StockoutUniversContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des taux de rupture.
 * 
 * @returns Le contexte des taux de rupture (`StockoutUniversContextType`).
 * @throws Erreur si utilisé en dehors du `StockoutUniversProvider`.
 */
export const useStockoutUniversContext = () => {
  const context = useContext(StockoutUniversContext);
  if (!context) {
    throw new Error("useStockoutUniversContext doit être utilisé dans un StockoutUniversProvider");
  }
  return context;
};
