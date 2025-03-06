import { createContext, useContext, useState } from "react";
import { subMonths, subYears, startOfMonth, endOfMonth } from "date-fns";

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
  ean13Products: string[]; // ✅ Ajout du stockage des EAN13 des produits sélectionnés
  dateRange: [Date | null, Date | null];
  comparisonDateRange: [Date | null, Date | null];
  type: "global" | "medicament" | "parapharmacie" | null;
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
    throw new Error("useFilterContext doit être utilisé à l’intérieur de FilterProvider");
  }
  return context;
};

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  // 🔹 Calculer la période principale par défaut : le dernier mois
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

  // 🔹 Calculer la période de comparaison : même mois N-1
  const lastYearStart = subYears(lastMonthStart, 1);
  const lastYearEnd = subYears(lastMonthEnd, 1);

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
    ean13Products: [], // ✅ Initialisation vide des EAN13
    dateRange: [lastMonthStart, lastMonthEnd], // 🔹 Par défaut : dernier mois
    comparisonDateRange: [lastYearStart, lastYearEnd], // 🔹 Par défaut : même mois N-1
    type: null,
  });

  const setFilters = (updatedFilters: Partial<FilterState>) => {
    setFiltersState((prevFilters) => ({
      ...prevFilters,
      ...updatedFilters,
    }));
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
      ean13Products: [], // ✅ Reset des EAN13 aussi
      dateRange: [lastMonthStart, lastMonthEnd], // 🔹 Reset avec le dernier mois
      comparisonDateRange: [lastYearStart, lastYearEnd], // 🔹 Reset avec même mois N-1
      type: null,
    });
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};