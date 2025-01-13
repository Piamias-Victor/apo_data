import React, { createContext, useContext, ReactNode } from "react";
import { useStockEvolution } from "@/hooks/useStockEvolution";
import { StockEvolutionEntry } from "@/pages/api/stockEvolution";

type StockEvolutionContextType = {
  stockEvolution: StockEvolutionEntry[];
  loading: boolean;
  error: string | null;
};

const StockEvolutionContext = createContext<StockEvolutionContextType | undefined>(undefined);

export const StockEvolutionProvider = ({ children }: { children: ReactNode }) => {
  const { stockEvolution, loading, error } = useStockEvolution();

  return (
    <StockEvolutionContext.Provider value={{ stockEvolution, loading, error }}>
      {children}
    </StockEvolutionContext.Provider>
  );
};

export const useStockEvolutionContext = () => {
  const context = useContext(StockEvolutionContext);
  if (!context) {
    throw new Error("useStockEvolutionContext must be used within a StockEvolutionProvider");
  }
  return context;
};
