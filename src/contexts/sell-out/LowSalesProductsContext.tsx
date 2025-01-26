import React, { createContext, useContext, ReactNode, useState } from "react";
import { useLowSalesProducts } from "@/hooks/sell-out/useLowSalesProducts";

export interface LowSalesProductsContextType {
  lowSalesProducts: {
    name: string;
    code: string;
    stock: number;
    quantitySold: number;
    revenue: number;
    margin: number;
  }[];
  loading: boolean;
  error: string | null;
  maxSalesThreshold: number; // Nombre maximal de ventes
  setMaxSalesThreshold: (value: number) => void; // Setter pour modifier le seuil
}

/**
 * Création du contexte pour les produits à faibles ventes.
 */
const LowSalesProductsContext = createContext<LowSalesProductsContextType | undefined>(undefined);

/**
 * Provider pour le contexte des produits à faibles ventes.
 */
export const LowSalesProductsProvider = ({ children }: { children: ReactNode }) => {
  const [maxSalesThreshold, setMaxSalesThreshold] = useState<number>(1); // État pour le seuil
  const { lowSalesProductsData, loading, error } = useLowSalesProducts(maxSalesThreshold);

  const lowSalesProducts = lowSalesProductsData?.lowSalesProducts || [];

  return (
    <LowSalesProductsContext.Provider
      value={{
        lowSalesProducts,
        loading,
        error,
        maxSalesThreshold,
        setMaxSalesThreshold,
      }}
    >
      {children}
    </LowSalesProductsContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des produits à faibles ventes.
 */
export const useLowSalesProductsContext = () => {
  const context = useContext(LowSalesProductsContext);
  if (!context) {
    throw new Error("useLowSalesProductsContext doit être utilisé dans un LowSalesProductsProvider");
  }
  return context;
};