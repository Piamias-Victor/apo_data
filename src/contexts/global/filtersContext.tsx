import { SalesFilters } from "@/types/Filter";
import React, { createContext, useContext, ReactNode, useState } from "react";

type FilterContextType = {
  filters: SalesFilters;
  setFilters: (newFilters: Partial<SalesFilters>) => void; // Permet de ne modifier qu'une partie des filtres
  handleClearAllFilters: () => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFiltersState] = useState<SalesFilters>({
    selectedCategory: "global", // Par défaut
    pharmacy: [],
    universe: [],
    category: [],
    subCategory: [],
    labDistributor: [],
    brandLab: [],
    rangeName: [],
    product: [],
    startDate: undefined,
    endDate: undefined,
  });

  const setFilters = (newFilters: Partial<SalesFilters>) => {
    setFiltersState((prev: SalesFilters) => ({ ...prev, ...newFilters }));
  };

  const handleClearAllFilters = () => {
    setFiltersState({
      selectedCategory: "global",
      pharmacy: [],
      universe: [],
      category: [],
      subCategory: [],
      labDistributor: [],
      brandLab: [],
      rangeName: [],
      product: [],
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        handleClearAllFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
};
