import { SalesFilters } from "@/types/Filter";
import React, { createContext, useContext, ReactNode, useState } from "react";

type FilterContextType = {
  filters: SalesFilters;
  setFilters: (newFilters: SalesFilters) => void;
  handleClearAllFilters: () => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFiltersState] = useState<SalesFilters>({
    selectedCategory: "global", // Par défaut, catégorie globale
  });

  const setFilters = (newFilters: SalesFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearAllFilters = () => {
    setFiltersState({
      selectedCategory: "global", // Réinitialiser à "global"
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
