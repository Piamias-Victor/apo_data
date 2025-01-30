import React, { createContext, useContext, ReactNode } from "react";
import { useSalesByDay } from "@/hooks/sell-out/useSalesByDay";
import { useSalesByPharmacyContext } from "./SalesByPharmacyContext";

export interface SalesByDayContextType {
  days: string[];
  quantities: number[];
  revenues: number[];
  margins: number[];
  loading: boolean;
  error: string | null;
}

const SalesByDayContext = createContext<SalesByDayContextType | undefined>(undefined);

export const SalesByDayProvider = ({ children }: { children: ReactNode }) => {
  // On écoute le StockContext
  const { loading: stockLoading, error: stockError } = useSalesByPharmacyContext();

  // On décide de "skipper" le fetch tant que stockLoading est true ou qu'il y a une erreur
  const skipFetch = stockLoading || !!stockError;

  // On utilise notre hook `useSalesByDay` en passant `skipFetch`
  const { salesByDayData, loading, error } = useSalesByDay(skipFetch);

  const days = salesByDayData?.days || [];
  const quantities = salesByDayData?.quantities || [];
  const revenues = salesByDayData?.revenues || [];
  const margins = salesByDayData?.margins || [];

  return (
    <SalesByDayContext.Provider
      value={{
        days,
        quantities,
        revenues,
        margins,
        loading,
        error,
      }}
    >
      {children}
    </SalesByDayContext.Provider>
  );
};

export const useSalesByDayContext = () => {
  const context = useContext(SalesByDayContext);
  if (!context) {
    throw new Error("useSalesByDayContext doit être utilisé dans un SalesByDayProvider");
  }
  return context;
};