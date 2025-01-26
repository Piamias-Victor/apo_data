import React, { createContext, useContext, ReactNode } from "react";
import { useSalesByCategory } from "@/hooks/sell-out/useSalesByCategory";

export interface SalesByCategoryContextType {
  categories: { category: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les ventes par catégorie.
 */
const SalesByCategoryContext = createContext<SalesByCategoryContextType | undefined>(undefined);

/**
 * Provider pour le contexte des ventes par catégorie.
 */
export const SalesByCategoryProvider = ({ children }: { children: ReactNode }) => {
  const { salesByCategoryData, loading, error } = useSalesByCategory();

  const categories = salesByCategoryData?.categories || [];

  return (
    <SalesByCategoryContext.Provider
      value={{
        categories,
        loading,
        error,
      }}
    >
      {children}
    </SalesByCategoryContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des ventes par catégorie.
 */
export const useSalesByCategoryContext = () => {
  const context = useContext(SalesByCategoryContext);
  if (!context) {
    throw new Error("useSalesByCategoryContext doit être utilisé dans un SalesByCategoryProvider");
  }
  return context;
};
