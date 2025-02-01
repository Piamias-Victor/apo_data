import React, { createContext, useContext, ReactNode } from "react";
import { useTopPurchasesProducts } from "@/hooks/sell-in/useTopPurchasesProducts";
import { usePurchasesByLabDistributorsContext } from "./PurchasesByLabDistributorsContext";

export interface TopPurchasesProductsContextType {
  topProducts: {
    name: string;
    code: string;
    quantity: number;
    cost: number;
  }[];
  flopProducts: {
    name: string;
    code: string;
    quantity: number;
    cost: number;
  }[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les top et flop produits achetés.
 */
const TopPurchasesProductsContext = createContext<TopPurchasesProductsContextType | undefined>(undefined);

/**
 * Provider pour le contexte des top et flop produits achetés.
 */
export const TopPurchasesProductsProvider = ({ children }: { children: ReactNode }) => {

  const { loading: loadingPrev, error: errorPrev } = usePurchasesByLabDistributorsContext();
    
  const skipFetch = loadingPrev || !!errorPrev;

  const { topProductsData, loading, error } = useTopPurchasesProducts(skipFetch);

  const topProducts = topProductsData?.topProducts || [];
  const flopProducts = topProductsData?.flopProducts || [];

  return (
    <TopPurchasesProductsContext.Provider
      value={{
        topProducts,
        flopProducts,
        loading,
        error,
      }}
    >
      {children}
    </TopPurchasesProductsContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des top et flop produits achetés.
 */
export const useTopPurchasesProductsContext = () => {
  const context = useContext(TopPurchasesProductsContext);
  if (!context) {
    throw new Error("useTopPurchasesProductsContext doit être utilisé dans un TopPurchasesProductsProvider");
  }
  return context;
};