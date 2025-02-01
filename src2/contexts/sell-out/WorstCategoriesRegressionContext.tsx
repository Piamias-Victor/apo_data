// src/contexts/sell-out/WorstCategoriesRegressionContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useWorstCategoriesRegression } from "@/hooks/sell-out/useWorstCategoriesRegression";
import { useWorstUniversesRegressionContext } from "./WorstUniversesRegressionContext";

export interface CategoryRegression {
  category: string;
  regressionRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number;
}

export interface WorstCategoriesRegressionContextType {
  categories: CategoryRegression[];
  loading: boolean;
  error: string | null;
}

const WorstCategoriesRegressionContext = createContext<WorstCategoriesRegressionContextType | undefined>(undefined);

export const WorstCategoriesRegressionProvider = ({ children }: { children: ReactNode }) => {
  // si vous dépendez d’un autre contexte pour la cascade, par ex. skip = parentLoading...
       const { loading: loadingPrev,error: errorPrev } = useWorstUniversesRegressionContext();
            
      const skipFetch = loadingPrev || !!errorPrev;

  // On utilise le hook
  const { categoriesData, loading, error } = useWorstCategoriesRegression(skipFetch);

  // On extrait la liste
  const categories = categoriesData?.regressionCategories || [];

  return (
    <WorstCategoriesRegressionContext.Provider
      value={{
        categories,
        loading,
        error,
      }}
    >
      {children}
    </WorstCategoriesRegressionContext.Provider>
  );
};

export const useWorstCategoriesRegressionContext = () => {
  const context = useContext(WorstCategoriesRegressionContext);
  if (!context) {
    throw new Error("useWorstCategoriesRegressionContext doit être utilisé dans un WorstCategoriesRegressionProvider");
  }
  return context;
};