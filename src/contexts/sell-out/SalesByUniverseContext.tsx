import React, { createContext, useContext, ReactNode } from "react";
import { useSalesByUniverse } from "@/hooks/sell-out/useSalesByUniverse";
import { useSalesByMonthContext } from "./SalesByMonthContext";
import { useFinancialContext } from "../global/FinancialContext";
import { useStockContext } from "../global/StockContext";

export interface SalesByUniverseContextType {
  universes: { universe: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les ventes par univers.
 */
const SalesByUniverseContext = createContext<SalesByUniverseContextType | undefined>(undefined);

/**
 * Provider pour le contexte des ventes par univers.
 */
export const SalesByUniverseProvider = ({ children }: { children: ReactNode }) => {

  const { loading: loadingPrev,error: errorPrev } = useSalesByMonthContext();
  
  const skipFetch = loadingPrev || !!errorPrev;

  const { salesByUniverseData, loading, error } = useSalesByUniverse(skipFetch);


  const universes = salesByUniverseData?.universes || [];

  return (
    <SalesByUniverseContext.Provider
      value={{
        universes,
        loading,
        error,
      }}
    >
      {children}
    </SalesByUniverseContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des ventes par univers.
 */
export const useSalesByUniverseContext = () => {
  const context = useContext(SalesByUniverseContext);
  if (!context) {
    throw new Error("useSalesByUniverseContext doit être utilisé dans un SalesByUniverseProvider");
  }
  return context;
};
