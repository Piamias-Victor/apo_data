// src/contexts/sell-out/NegativeMarginSalesContext.tsx

import React, { createContext, useContext, ReactNode } from "react";
import { useNegativeMarginSales } from "@/hooks/sell-out/useNegativeMarginSales";

export interface NegativeMarginSalesContextType {
  products: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
    margin: number;
    averageSellingPrice: number;
    averagePurchasePrice: number;
  }[];
  loading: boolean;
  error: string | null;
}

const NegativeMarginSalesContext = createContext<NegativeMarginSalesContextType | undefined>(undefined);

/**
 * Provider pour le contexte des ventes avec marges négatives.
 *
 * @param children - Composants enfants.
 */
export const NegativeMarginSalesProvider = ({ children }: { children: ReactNode }) => {
  const { negativeMarginSalesData, loading, error } = useNegativeMarginSales();

  const products = negativeMarginSalesData?.products.map((p) => ({
    productId: p.productId,
    productName: p.productName,
    quantity: p.quantity,
    revenue: p.revenue,
    margin: p.margin,
    averageSellingPrice: p.averageSellingPrice,
    averagePurchasePrice: p.averagePurchasePrice,
  })) || [];

  return (
    <NegativeMarginSalesContext.Provider value={{ products, loading, error }}>
      {children}
    </NegativeMarginSalesContext.Provider>
  );
};

/**
 * Hook pour consommer le contexte des ventes avec marges négatives.
 *
 * @returns { products, loading, error }
 */
export const useNegativeMarginSalesContext = () => {
  const context = useContext(NegativeMarginSalesContext);
  if (!context) {
    throw new Error("useNegativeMarginSalesContext doit être utilisé dans un NegativeMarginSalesProvider");
  }
  return context;
};