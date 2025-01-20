import React, { createContext, useContext, ReactNode } from "react";
import { useSalesByLabDistributors } from "@/hooks/useSalesByLabDistributors";

export interface SalesByLabDistributorsContextType {
  labDistributors: { labDistributor: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les ventes par lab distributors.
 */
const SalesByLabDistributorsContext = createContext<
  SalesByLabDistributorsContextType | undefined
>(undefined);

/**
 * Provider pour le contexte des ventes par lab distributors.
 */
export const SalesByLabDistributorsProvider = ({ children }: { children: ReactNode }) => {
  const { salesByLabDistributorsData, loading, error } = useSalesByLabDistributors();

  const labDistributors = salesByLabDistributorsData?.labDistributors || [];

  return (
    <SalesByLabDistributorsContext.Provider
      value={{
        labDistributors,
        loading,
        error,
      }}
    >
      {children}
    </SalesByLabDistributorsContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des ventes par lab distributors.
 */
export const useSalesByLabDistributorsContext = () => {
  const context = useContext(SalesByLabDistributorsContext);
  if (!context) {
    throw new Error(
      "useSalesByLabDistributorsContext doit être utilisé dans un SalesByLabDistributorsProvider"
    );
  }
  return context;
};
