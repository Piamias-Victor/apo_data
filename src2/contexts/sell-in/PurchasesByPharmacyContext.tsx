import React, { createContext, useContext, ReactNode } from "react";
import { usePurchasesByPharmacy } from "@/hooks/sell-in/usePurchasesByPharmacy";
import { usePurchasesByLabDistributorsContext } from "./PurchasesByLabDistributorsContext";

export interface PurchasesByPharmacyContextType {
  pharmacies: { pharmacyId: string; quantity: number; cost: number }[];
  loading: boolean;
  error: string | null;
}

const PurchasesByPharmacyContext = createContext<PurchasesByPharmacyContextType | undefined>(undefined);

export const PurchasesByPharmacyProvider = ({ children }: { children: ReactNode }) => {
  // On dépend du contexte des achats par lab distributeurs
  const { loading: prevLoading, error: prevError } = usePurchasesByLabDistributorsContext();
  const skipFetch = prevLoading || !!prevError;

  const { purchasesByPharmacyData, loading, error } = usePurchasesByPharmacy(skipFetch);

  const pharmacies = purchasesByPharmacyData?.pharmacies || [];

  return (
    <PurchasesByPharmacyContext.Provider value={{ pharmacies, loading, error }}>
      {children}
    </PurchasesByPharmacyContext.Provider>
  );
};

export const usePurchasesByPharmacyContext = () => {
  const context = useContext(PurchasesByPharmacyContext);
  if (!context) {
    throw new Error("usePurchasesByPharmacyContext doit être utilisé dans un PurchasesByPharmacyProvider");
  }
  return context;
};