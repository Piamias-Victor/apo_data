// /contexts/salesContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { GroupedSale } from "@/types/Sale";
import { useGroupedSales } from "@/hooks/useGroupedSale";

type SalesContextType = {
  groupedSales: GroupedSale[];
  total: number;
  loading: boolean;
  error: string | null;
};

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const { groupedSales, total, loading, error } = useGroupedSales();

  return (
    <SalesContext.Provider
      value={{
        groupedSales,
        total,
        loading,
        error,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSalesContext = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSalesContext must be used within a SalesProvider");
  }
  return context;
};
