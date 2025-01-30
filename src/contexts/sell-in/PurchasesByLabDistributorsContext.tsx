import React, { createContext, useContext, ReactNode } from "react";
import { usePurchasesByLabDistributors } from "@/hooks/sell-in/usePurchasesByLabDistributors";
import { usePurchasesByCategoryContext } from "./PurchasesByCategoryContext";

export interface PurchasesByLabDistributorsContextType {
  labDistributors: { labDistributor: string; quantity: number; cost: number }[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les achats par lab distributeur.
 */
const PurchasesByLabDistributorsContext = createContext<
  PurchasesByLabDistributorsContextType | undefined
>(undefined);

/**
 * Provider pour le contexte des achats par lab distributeur.
 */
export const PurchasesByLabDistributorsProvider = ({ children }: { children: ReactNode }) => {
  const { loading: loadingPrev, error: errorPrev } = usePurchasesByCategoryContext();

  const skipFetch = loadingPrev || !!errorPrev;
  const { purchasesByLabDistributorsData, loading, error } = usePurchasesByLabDistributors(skipFetch);

  const labDistributors = purchasesByLabDistributorsData?.labDistributors || [];

  return (
    <PurchasesByLabDistributorsContext.Provider
      value={{
        labDistributors,
        loading,
        error,
      }}
    >
      {children}
    </PurchasesByLabDistributorsContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des achats par lab distributeur.
 */
export const usePurchasesByLabDistributorsContext = () => {
  const context = useContext(PurchasesByLabDistributorsContext);
  if (!context) {
    throw new Error(
      "usePurchasesByLabDistributorsContext doit être utilisé dans un PurchasesByLabDistributorsProvider"
    );
  }
  return context;
};