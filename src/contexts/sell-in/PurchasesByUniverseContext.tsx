import React, { createContext, useContext, ReactNode } from "react";
import { usePurchasesByUniverse } from "@/hooks/sell-in/usePurchasesByUniverse";
import { usePurchasesByMonthContext } from "./PurchasesByMonthContext";

export interface PurchasesByUniverseContextType {
  universes: { universe: string; quantity: number; cost: number }[];
  loading: boolean;
  error: string | null;
}

/**
 * Création du contexte pour les achats par univers.
 */
const PurchasesByUniverseContext = createContext<PurchasesByUniverseContextType | undefined>(undefined);

/**
 * Provider pour le contexte des achats par univers.
 */
export const PurchasesByUniverseProvider = ({ children }: { children: ReactNode }) => {
  const { loading: loadingPrev, error: errorPrev } = usePurchasesByMonthContext();
  const skipFetch = loadingPrev || !!errorPrev;

  const { purchasesByUniverseData, loading, error } = usePurchasesByUniverse(skipFetch);
  const universes = purchasesByUniverseData?.universes || [];

  return (
    <PurchasesByUniverseContext.Provider
      value={{
        universes,
        loading,
        error,
      }}
    >
      {children}
    </PurchasesByUniverseContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer le contexte des achats par univers.
 */
export const usePurchasesByUniverseContext = () => {
  const context = useContext(PurchasesByUniverseContext);
  if (!context) {
    throw new Error("usePurchasesByUniverseContext doit être utilisé dans un PurchasesByUniverseProvider");
  }
  return context;
};