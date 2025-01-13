// /contexts/salesByPharmacyContext.tsx

import React, { createContext, useContext, ReactNode } from "react";
import { GroupedSaleByPharmacy } from "@/types/Sale";
import { useGroupedSalesByPharmacy } from "@/hooks/useGroupedSalesByPharmacy";

type SalesByPharmacyContextType = {
  groupedSales: GroupedSaleByPharmacy[];
  total: number;
  loading: boolean;
  error: string | null;
};

const SalesByPharmacyContext = createContext<SalesByPharmacyContextType | undefined>(undefined);

export const SalesByPharmacyProvider = ({ children }: { children: ReactNode }) => {
  const { groupedSales, total, loading, error } = useGroupedSalesByPharmacy();

  return (
    <SalesByPharmacyContext.Provider
      value={{
        groupedSales,
        total,
        loading,
        error,
      }}
    >
      {children}
    </SalesByPharmacyContext.Provider>
  );
};

export const useSalesByPharmacyContext = () => {
  const context = useContext(SalesByPharmacyContext);
  if (!context) {
    throw new Error("useSalesByPharmacyContext must be used within a SalesByPharmacyProvider");
  }
  return context;
};
