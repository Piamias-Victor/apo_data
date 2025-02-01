// src/contexts/sell-out/SalesByPharmacyContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useSalesByPharmacy } from "@/hooks/sell-out/useSalesByPharmacy";
import { useTopProductsContext } from "./TopProductsContext";

export interface SalesByPharmacyContextType {
  pharmacies: {
    pharmacyId: string;
    quantity: number;
    revenue: number;
    margin: number;
  }[];
  loading: boolean;
  error: string | null;
}

const SalesByPharmacyContext = createContext<SalesByPharmacyContextType | undefined>(undefined);

export const SalesByPharmacyProvider = ({ children }: { children: ReactNode }) => {
  // Si vous dépendez d'un autre contexte pour skip
  // ex. const { loading: prevLoading, error: prevError } = useSomethingContext();
  // const skipFetch = prevLoading || !!prevError;
  const { loading: financialLoading, error: financialError } = useTopProductsContext();
  
  const skipFetch = financialLoading || !!financialError;

  const { salesByPharmacyData, loading, error } = useSalesByPharmacy(skipFetch);

  const pharmacies = salesByPharmacyData?.pharmacies || [];

  return (
    <SalesByPharmacyContext.Provider value={{ pharmacies, loading, error }}>
      {children}
    </SalesByPharmacyContext.Provider>
  );
};

export const useSalesByPharmacyContext = () => {
  const context = useContext(SalesByPharmacyContext);
  if (!context) {
    throw new Error("useSalesByPharmacyContext doit être utilisé dans un SalesByPharmacyProvider");
  }
  return context;
};