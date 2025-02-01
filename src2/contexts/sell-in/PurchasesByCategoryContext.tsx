import React, { createContext, useContext, ReactNode } from "react";
import { usePurchasesByCategory } from "@/hooks/sell-in/usePurchasesByCategory";
import { usePurchasesByUniverseContext } from "./PurchasesByUniverseContext";

export interface PurchasesByCategoryContextType {
  categories: { category: string; quantity: number; cost: number }[];
  loading: boolean;
  error: string | null;
}

const PurchasesByCategoryContext = createContext<PurchasesByCategoryContextType | undefined>(undefined);

export const PurchasesByCategoryProvider = ({ children }: { children: ReactNode }) => {
  const { loading: loadingPrev, error: errorPrev } = usePurchasesByUniverseContext();
  const skipFetch = loadingPrev || !!errorPrev;

  const { purchasesByCategoryData, loading, error } = usePurchasesByCategory(skipFetch);
  const categories = purchasesByCategoryData?.categories || [];

  return (
    <PurchasesByCategoryContext.Provider value={{ categories, loading, error }}>
      {children}
    </PurchasesByCategoryContext.Provider>
  );
};

export const usePurchasesByCategoryContext = () => {
  const context = useContext(PurchasesByCategoryContext);
  if (!context) {
    throw new Error("usePurchasesByCategoryContext doit être utilisé dans un PurchasesByCategoryProvider");
  }
  return context;
};