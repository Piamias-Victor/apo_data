import React, { createContext, useContext, ReactNode } from "react";
import { useGrowthPurchasesByProduct } from "@/hooks/sell-in/useGrowthPurchasesByProduct";
import { usePurchasesByPharmacyContext } from "./PurchasesByPharmacyContext";
import { useGrowthPurchasesByLabDistributorContext } from "./GrowthPurchasesByLabDistributorContext";

export interface ProductPurchaseGrowth {
  productName: string;
  growthRate: number;
  currentAvgPrice: number;
  previousAvgPrice: number;
}

export interface GrowthPurchasesByProductContextType {
  products: ProductPurchaseGrowth[];
  loading: boolean;
  error: string | null;
}

const GrowthPurchasesByProductContext = createContext<GrowthPurchasesByProductContextType | undefined>(undefined);

export const GrowthPurchasesByProductProvider = ({ children }: { children: ReactNode }) => {
  // Vérifie si un autre contexte est en cours de chargement
  const { loading: loadingPrev, error: errorPrev } = useGrowthPurchasesByLabDistributorContext();
  const skipFetch = loadingPrev || !!errorPrev;

  const { productsData, loading, error } = useGrowthPurchasesByProduct(skipFetch);

  const products = productsData?.growthPurchasesProducts || [];

  return (
    <GrowthPurchasesByProductContext.Provider value={{ products, loading, error }}>
      {children}
    </GrowthPurchasesByProductContext.Provider>
  );
};

export const useGrowthPurchasesByProductContext = () => {
  const context = useContext(GrowthPurchasesByProductContext);
  if (!context) {
    throw new Error("useGrowthPurchasesByProductContext doit être utilisé dans un GrowthPurchasesByProductProvider");
  }
  return context;
};