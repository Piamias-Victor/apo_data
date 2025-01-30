import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { usePurchasesByMonth } from "@/hooks/sell-in/usePurchasesByMonth";
import { useStockContext } from "../global/StockContext";
import { useLowSalesProductsContext } from "../sell-out/LowSalesProductsContext";

export interface PurchasesByMonthContextType {
  months: string[];
  quantities: number[];
  costs: number[];
  loading: boolean;
  error: string | null;
}

const PurchasesByMonthContext = createContext<PurchasesByMonthContextType | undefined>(undefined);

export const PurchasesByMonthProvider = ({ children }: { children: ReactNode }) => {
  // On écoute le FinancialContext
  const { loading: stockLoading, error: stockError } = useLowSalesProductsContext();

  // On décide de "skipper" le fetch tant que :
  // - stockLoading est true, ou
  // - stockError n’est pas null
  const skipFetch = stockLoading || !!stockError;

  // On utilise notre hook `usePurchasesByMonth` en passant `skipFetch`
  const { purchasesByMonthData, loading, error } = usePurchasesByMonth(skipFetch);

  const months = purchasesByMonthData?.months || [];
  const quantities = purchasesByMonthData?.quantities || [];
  const costs = purchasesByMonthData?.costs || [];

  return (
    <PurchasesByMonthContext.Provider
      value={{
        months,
        quantities,
        costs,
        loading,
        error,
      }}
    >
      {children}
    </PurchasesByMonthContext.Provider>
  );
};

export const usePurchasesByMonthContext = () => {
  const context = useContext(PurchasesByMonthContext);
  if (!context) {
    throw new Error("usePurchasesByMonthContext doit être utilisé dans un PurchasesByMonthProvider");
  }
  return context;
};