// src/contexts/sell-out/RegressionProductsContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useRegressionProducts } from "@/hooks/sell-out/useRegressionProducts";

export interface RegressionProduct {
  product: string;
  code: string;
  regressionRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number;
}

export interface RegressionProductsContextType {
  regressionProducts: RegressionProduct[];
  loading: boolean;
  error: string | null;
}

const RegressionProductsContext = createContext<RegressionProductsContextType | undefined>(undefined);

export const RegressionProductsProvider = ({ children }: { children: ReactNode }) => {
  // Si vous avez un parent contexte, comme PeakSales, vous pouvez faire :
  // const { loading: peakLoading, error: peakError } = usePeakSalesContext();
  // const skipFetch = peakLoading || !!peakError;

  // Pour l'exemple, on part du principe qu’on fetch direct (skip = false).
  const skipFetch = false;

  const { regressionProductsData, loading, error } = useRegressionProducts(skipFetch);

  const regressionProducts = regressionProductsData?.regressionProducts || [];

  return (
    <RegressionProductsContext.Provider
      value={{
        regressionProducts,
        loading,
        error,
      }}
    >
      {children}
    </RegressionProductsContext.Provider>
  );
};

export const useRegressionProductsContext = () => {
  const context = useContext(RegressionProductsContext);
  if (!context) {
    throw new Error("useRegressionProductsContext doit être utilisé dans un RegressionProductsProvider");
  }
  return context;
};