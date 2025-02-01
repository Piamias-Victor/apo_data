// /types/Filters.ts

export type SalesFilters = {
  pharmacy?: string[]; // Tableau d'IDs de pharmacies
  universe?: string[];
  category?: string[];
  subCategory?: string[];
  labDistributor?: string[];
  brandLab?: string[];
  rangeName?: string[];
  families?: string[];
  product?: string[];
  startDate?: string; // Format 'YYYY-MM-DD'
  endDate?: string;   // Format 'YYYY-MM-DD'
  selectedCategory?: "global" | "medicaments" | "parapharmacie";
};
