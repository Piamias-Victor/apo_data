import React, { createContext, useContext, ReactNode } from "react";
import { useGrowthPurchasesByLabDistributor } from "@/hooks/sell-in/useGrowthPurchasesByLabDistributor";
import { usePurchasesByPharmacyContext } from "./PurchasesByPharmacyContext";
import { useGrowthPurchasesByCategoryContext } from "./GrowthPurchasesByCategoryContext";

export interface LabDistributorPurchaseGrowth {
  labDistributor: string;
  growthRate: number;
  currentAvgPrice: number;
  previousAvgPrice: number;
}

export interface GrowthPurchasesByLabDistributorContextType {
  labDistributors: LabDistributorPurchaseGrowth[];
  loading: boolean;
  error: string | null;
}

const GrowthPurchasesByLabDistributorContext = createContext<GrowthPurchasesByLabDistributorContextType | undefined>(undefined);

export const GrowthPurchasesByLabDistributorProvider = ({ children }: { children: ReactNode }) => {
  // Vérifie si un autre contexte est en cours de chargement
  const { loading: loadingPrev, error: errorPrev } = useGrowthPurchasesByCategoryContext();
  const skipFetch = loadingPrev || !!errorPrev;

  const { labDistributorsData, loading, error } = useGrowthPurchasesByLabDistributor(skipFetch);

  const labDistributors = labDistributorsData?.growthPurchasesLabDistributors || [];

  return (
    <GrowthPurchasesByLabDistributorContext.Provider value={{ labDistributors, loading, error }}>
      {children}
    </GrowthPurchasesByLabDistributorContext.Provider>
  );
};

export const useGrowthPurchasesByLabDistributorContext = () => {
  const context = useContext(GrowthPurchasesByLabDistributorContext);
  if (!context) {
    throw new Error("useGrowthPurchasesByLabDistributorContext doit être utilisé dans un GrowthPurchasesByLabDistributorProvider");
  }
  return context;
};