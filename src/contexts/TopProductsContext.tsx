import React, { createContext, useContext, ReactNode } from "react";
import { useTopProducts } from "@/hooks/useTopProducts";

export interface TopProductsContextType {
  products: {
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
 * Création du contexte pour les top 5 produits.
 */
const TopProductsContext = createContext<TopProductsContextType | undefined>(undefined);

/**
 * Provider pour le contexte des top 5 produits.
 */
export const TopProductsProvider = ({ children }: { children: ReactNode }) => {
  const { topProductsData, loading, error } = useTopProducts();

  const products = topProductsData?.products || [];

  return (
    <TopProductsContext.Provider
      value={{
        products,
        loading,
        error,
      }}
    >
      {children}
    </TopProductsContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des top 5 produits.
 */
export const useTopProductsContext = () => {
  const context = useContext(TopProductsContext);
  if (!context) {
    throw new Error("useTopProductsContext doit être utilisé dans un TopProductsProvider");
  }
  return context;
};
