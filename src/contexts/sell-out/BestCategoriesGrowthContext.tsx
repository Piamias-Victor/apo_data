// src/contexts/sell-out/BestCategoriesGrowthContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useBestCategoriesGrowth } from "@/hooks/sell-out/useBestCategoriesGrowth";

export interface CategoryGrowth {
  category: string;
  growthRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number;
}

export interface BestCategoriesGrowthContextType {
  categories: CategoryGrowth[];
  loading: boolean;
  error: string | null;
}

const BestCategoriesGrowthContext = createContext<BestCategoriesGrowthContextType | undefined>(undefined);

export const BestCategoriesGrowthProvider = ({ children }: { children: ReactNode }) => {
  // Si vous dépendez d'un autre contexte (ex PeakSales), vous pouvez skip si ce parent est en loading
  // const { loading: parentLoading, error: parentError } = useSomethingContext();
  // const skipFetch = parentLoading || !!parentError;
  const skipFetch = false;

  // On utilise notre hook
  const { categoriesData, loading, error } = useBestCategoriesGrowth(skipFetch);

  // On en déduit le tableau des catégories
  const categories = categoriesData?.growthCategories || [];

  return (
    <BestCategoriesGrowthContext.Provider
      value={{
        categories,
        loading,
        error,
      }}
    >
      {children}
    </BestCategoriesGrowthContext.Provider>
  );
};

export const useBestCategoriesGrowthContext = () => {
  const context = useContext(BestCategoriesGrowthContext);
  if (!context) {
    throw new Error("useBestCategoriesGrowthContext doit être utilisé dans un BestCategoriesGrowthProvider");
  }
  return context;
};