// /types/Filters.ts

export type SalesFilters = {
  pharmacy?: string;
  universe?: string;
  category?: string;
  subCategory?: string;
  labDistributor?: string;
  brandLab?: string;
  rangeName?: string;
  product?: string;
  startDate?: string; // Format 'YYYY-MM-DD'
  endDate?: string;   // Format 'YYYY-MM-DD'
  selectedCategory?: "global" | "medicaments" | "parapharmacie"; // Ajout de la nouvelle variable
};
