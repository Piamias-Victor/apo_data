// /contexts/dailySalesContext.tsx

import React, { createContext, useContext, ReactNode } from "react";
import { DailySale } from "@/types/Sale";
import { useDailySales } from "@/hooks/useDailySales";

type DailySalesContextType = {
  dailySales: DailySale[];
  total: number;
  loading: boolean;
  error: string | null;
};

const DailySalesContext = createContext<DailySalesContextType | undefined>(undefined);

export const DailySalesProvider = ({ children }: { children: ReactNode }) => {
  const { dailySales, total, loading, error } = useDailySales();

  return (
    <DailySalesContext.Provider
      value={{
        dailySales,
        total,
        loading,
        error,
      }}
    >
      {children}
    </DailySalesContext.Provider>
  );
};

export const useDailySalesContext = () => {
  const context = useContext(DailySalesContext);
  if (!context) {
    throw new Error("useDailySalesContext must be used within a DailySalesProvider");
  }
  return context;
};
