import React, { createContext, useContext, ReactNode } from "react";
import { useGrowthProducts } from "@/hooks/sell-out/useGrowthProducts";
import { usePeakSalesContext } from "./PeakSalesContext";

export interface GrowthProductsContextType {
  growthProducts: {
    product: string;
    code: string;
    growthRate: number;
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les produits en croissance.
 */
const GrowthProductsContext = createContext<GrowthProductsContextType | undefined>(undefined);

/**
 * Provider pour le contexte des produits en croissance.
 */
export const GrowthProductsProvider = ({ children }: { children: ReactNode }) => {
   const { loading: loadingPrev,error: errorPrev } = usePeakSalesContext();
        
  const skipFetch = loadingPrev || !!errorPrev;
  const { growthProductsData, loading, error } = useGrowthProducts(skipFetch);

  const growthProducts = growthProductsData?.growthProducts || [];

  return (
    <GrowthProductsContext.Provider
      value={{
        growthProducts,
        loading,
        error,
      }}
    >
      {children}
    </GrowthProductsContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des produits en croissance.
 */
export const useGrowthProductsContext = () => {
  const context = useContext(GrowthProductsContext);
  if (!context) {
    throw new Error("useGrowthProductsContext doit être utilisé dans un GrowthProductsProvider");
  }
  return context;
};