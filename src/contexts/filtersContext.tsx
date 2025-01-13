// /contexts/filtersContext.tsx
import { SalesFilters } from "@/types/Filter";
import React, { createContext, useContext, ReactNode, useState } from "react";

type FilterContextType = {
  filters: SalesFilters;
  setFilters: (newFilters: SalesFilters) => void;
  handleClearAllFilters: () => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

/** 
 * FilterProvider : stocke et expose l'objet `filters` + un setter.
 */
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFiltersState] = useState<SalesFilters>({});

  /** 
   * setFilters : met à jour tous les filtres.
   */
  const setFilters = (newFilters: SalesFilters) => {
    setFiltersState(newFilters);
  };

  /**
   * handleClearAllFilters : réinitialise tous les filtres.
   */
  const handleClearAllFilters = () => {
    setFiltersState({});
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

/**
 * Hook personnalisé pour consommer le contexte.
 */
export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
};
