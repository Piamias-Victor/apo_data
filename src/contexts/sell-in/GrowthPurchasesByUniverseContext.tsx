import React, { createContext, useContext, ReactNode } from "react";
import { useGrowthPurchasesByUniverse } from "@/hooks/sell-in/useGrowthPurchasesByUniverse";
import { usePurchasesByCategoryContext } from "./PurchasesByCategoryContext";
import { usePurchasesByPharmacyContext } from "./PurchasesByPharmacyContext";

export interface UniversePurchaseGrowth {
  universe: string;
  growthRate: number;
  currentAvgPrice: number;
  previousAvgPrice: number;
}

export interface GrowthPurchasesByUniverseContextType {
  universes: UniversePurchaseGrowth[];
  loading: boolean;
  error: string | null;
}

const GrowthPurchasesByUniverseContext = createContext<GrowthPurchasesByUniverseContextType | undefined>(undefined);

export const GrowthPurchasesByUniverseProvider = ({ children }: { children: ReactNode }) => {
  // Si vous voulez un skip basé sur un contexte parent
  const { loading: loadingPrev, error: errorPrev } = usePurchasesByPharmacyContext();
  const skipFetch = loadingPrev || !!errorPrev;

  const { universesData, loading, error } = useGrowthPurchasesByUniverse(skipFetch);

  const universes = universesData?.growthPurchasesUniverses || [];

  return (
    <GrowthPurchasesByUniverseContext.Provider value={{ universes, loading, error }}>
      {children}
    </GrowthPurchasesByUniverseContext.Provider>
  );
};

export const useGrowthPurchasesByUniverseContext = () => {
  const context = useContext(GrowthPurchasesByUniverseContext);
  if (!context) {
    throw new Error("useGrowthPurchasesByUniverseContext doit être utilisé dans un GrowthPurchasesByUniverseProvider");
  }
  return context;
};