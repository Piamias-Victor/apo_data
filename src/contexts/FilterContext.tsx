import { createContext, useContext, useState } from 'react';

// Définition des types pour les filtres
export interface FilterState {
  pharmacies: string[];
  universes: string[];
  categories: string[];
  subCategories: string[];
  distributors: string[];
  brands: string[];
  families: string[];
  subFamilies: string[];
  specificities: string[];
  ranges: string[];
  dateRange: [Date | null, Date | null];
  type: 'global' | 'medicament' | 'parapharmacie' | null;
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext doit être utilisé à l’intérieur de FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFiltersState] = useState<FilterState>({
    pharmacies: [],
    universes: [],
    categories: [],
    subCategories: [],
    distributors: [],
    brands: [],
    families: [],
    subFamilies: [],
    specificities: [],
    ranges: [],
    dateRange: [null, null],
    type: null,
  });

  const setFilters = (updatedFilters: Partial<FilterState>) => {
    setFiltersState((prevFilters) => {
      const newFilters = { ...prevFilters, ...updatedFilters };
  
      return newFilters;
    });
  };

  const resetFilters = () => {
    setFiltersState({
      pharmacies: [],
      universes: [],
      categories: [],
      subCategories: [],
      distributors: [],
      brands: [],
      families: [],
      subFamilies: [],
      specificities: [],
      ranges: [],
      dateRange: [null, null],
      type: null,
    });
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};