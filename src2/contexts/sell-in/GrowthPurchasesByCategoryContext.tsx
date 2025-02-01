import React, { createContext, useContext, ReactNode } from "react";
import { useGrowthPurchasesByCategory } from "@/hooks/sell-in/useGrowthPurchasesByCategory";
import { usePurchasesByPharmacyContext } from "./PurchasesByPharmacyContext";
import { useGrowthPurchasesByUniverseContext } from "./GrowthPurchasesByUniverseContext";

export interface CategoryPurchaseGrowth {
  category: string;
  growthRate: number;
  currentAvgPrice: number;
  previousAvgPrice: number;
}

export interface GrowthPurchasesByCategoryContextType {
  categories: CategoryPurchaseGrowth[];
  loading: boolean;
  error: string | null;
}

const GrowthPurchasesByCategoryContext = createContext<GrowthPurchasesByCategoryContextType | undefined>(undefined);

export const GrowthPurchasesByCategoryProvider = ({ children }: { children: ReactNode }) => {
  // Vérifie si un autre contexte est en cours de chargement
  const { loading: loadingPrev, error: errorPrev } = useGrowthPurchasesByUniverseContext();
  const skipFetch = loadingPrev || !!errorPrev;

  const { categoriesData, loading, error } = useGrowthPurchasesByCategory(skipFetch);

  const categories = categoriesData?.growthPurchasesCategories || [];

  return (
    <GrowthPurchasesByCategoryContext.Provider value={{ categories, loading, error }}>
      {children}
    </GrowthPurchasesByCategoryContext.Provider>
  );
};

export const useGrowthPurchasesByCategoryContext = () => {
  const context = useContext(GrowthPurchasesByCategoryContext);
  if (!context) {
    throw new Error("useGrowthPurchasesByCategoryContext doit être utilisé dans un GrowthPurchasesByCategoryProvider");
  }
  return context;
};