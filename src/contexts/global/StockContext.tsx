import React, { createContext, useContext, ReactNode } from "react";
import { useStockData } from "@/hooks/global/useStockData";
import { useFinancialContext } from "./FinancialContext";

export interface StockContextType {
  stockValue: number | null;
  soldReferencesCount: number | null;
  loading: boolean;
  error: string | null;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider = ({ children }: { children: ReactNode }) => {

  const { loading: financialLoading, error: financialError } = useFinancialContext();

  const skipFetch = financialLoading || !!financialError;

  const { stockData, loading, error } = useStockData(skipFetch);


  const stockValue = stockData?.stockValue || null;
  const soldReferencesCount = stockData?.soldReferencesCount || null;

  return (
    <StockContext.Provider value={{ stockValue, soldReferencesCount, loading, error }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStockContext doit être utilisé dans un StockProvider");
  }
  return context;
};
