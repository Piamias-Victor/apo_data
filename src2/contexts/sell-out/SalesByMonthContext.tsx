import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useSalesByMonth } from "@/hooks/sell-out/useSalesByMonth";
import { useFinancialContext } from "@/contexts/global/FinancialContext";
import { useStockContext } from "../global/StockContext";

export interface SalesByMonthContextType {
  months: string[];
  quantities: number[];
  revenues: number[];
  margins: number[];
  loading: boolean;
  error: string | null;
}

const SalesByMonthContext = createContext<SalesByMonthContextType | undefined>(undefined);

export const SalesByMonthProvider = ({ children }: { children: ReactNode }) => {
  // On écoute le FinancialContext
  const { loading: stockLoading, error: stockError } = useStockContext();

  // On décide de "skipper" le fetch tant que:
  // - financialLoading est true, ou
  // - financialError n’est pas null
  // (à vous de voir la logique qui vous convient)
  const skipFetch = stockLoading || !!stockError;

  // On utilise notre hook `useSalesByMonth` en passant `skipFetch`
  const { salesByMonthData, loading, error } = useSalesByMonth(skipFetch);

  const months = salesByMonthData?.months || [];
  const quantities = salesByMonthData?.quantities || [];
  const revenues = salesByMonthData?.revenues || [];
  const margins = salesByMonthData?.margins || [];

  return (
    <SalesByMonthContext.Provider
      value={{
        months,
        quantities,
        revenues,
        margins,
        loading,
        error,
      }}
    >
      {children}
    </SalesByMonthContext.Provider>
  );
};

export const useSalesByMonthContext = () => {
  const context = useContext(SalesByMonthContext);
  if (!context) {
    throw new Error("useSalesByMonthContext doit être utilisé dans un SalesByMonthProvider");
  }
  return context;
};