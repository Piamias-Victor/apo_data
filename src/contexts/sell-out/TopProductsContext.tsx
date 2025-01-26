import React, { createContext, useContext, ReactNode } from "react";
import { useTopProducts } from "@/hooks/sell-out/useTopProducts";

export interface TopProductsContextType {
  topProducts: {
    name: string;
    code: string;
    quantity: number;
    revenue: number;
    margin: number;
  }[];
  flopProducts: {
    name: string;
    code: string;
    quantity: number;
    revenue: number;
    margin: number;
  }[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les top et flop produits.
 */
const TopProductsContext = createContext<TopProductsContextType | undefined>(undefined);

/**
 * Provider pour le contexte des top et flop produits.
 */
export const TopProductsProvider = ({ children }: { children: ReactNode }) => {
  const { topProductsData, loading, error } = useTopProducts();

  const topProducts = topProductsData?.topProducts || [];
  const flopProducts = topProductsData?.flopProducts || [];

  return (
    <TopProductsContext.Provider
      value={{
        topProducts,
        flopProducts,
        loading,
        error,
      }}
    >
      {children}
    </TopProductsContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des top et flop produits.
 */
export const useTopProductsContext = () => {
  const context = useContext(TopProductsContext);
  if (!context) {
    throw new Error("useTopProductsContext doit être utilisé dans un TopProductsProvider");
  }
  return context;
};