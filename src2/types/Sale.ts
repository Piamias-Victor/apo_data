// src/types/sale.ts

/**
 * Interface représentant une vente groupée par code_13_ref avec agrégations.
 */
// src/types/Sale.ts

// /types/Sale.ts

export interface GroupedSale {
  code_13_ref: string;
  universe: string;
  category: string;
  sub_category: string;
  brand_lab: string;
  lab_distributor: string;
  range_name: string;
  family: string;
  sub_family: string;
  specificity: string;
  name: string;
  total_quantity: number;
  avg_price_with_tax: number;
  avg_weighted_average_price: number;
  tva: number;
}

// /types/Sale.ts

export interface GroupedSaleRaw {
  code_13_ref: string;
  universe: string;
  category: string;
  sub_category: string;
  brand_lab: string;
  lab_distributor: string;
  range_name: string;
  family: string;
  sub_family: string;
  specificity: string;
  name: string;
  total_quantity: string; // Renvoie une chaîne
  avg_price_with_tax: string; // Renvoie une chaîne
  avg_weighted_average_price: string; // Renvoie une chaîne
  tva: string; // Renvoie une chaîne
}

// Ajoutez cette nouvelle interface
export interface GroupedSaleByPharmacyRaw {
  pharmacy_id: string;
  pharmacy_name: string | null; // Ajouté si vous avez une table des pharmacies
  total_quantity: string;
  avg_price_with_tax: string;
  avg_weighted_average_price: string;
  tva: string;
}

export interface GroupedSaleByPharmacy {
  pharmacy_id: string;
  pharmacy_name: string; // Renommé pour éviter les nulls
  total_quantity: number;
  avg_price_with_tax: number;
  avg_weighted_average_price: number;
  tva: number;
}

// /types/Sale.ts

export interface DailySaleRaw {
  date: string; // Format 'YYYY-MM-DD'
  total_quantity: string;
  total_sales: string; // Calculé comme sum(quantity * price_with_tax)
  total_cost: string;  // Calculé comme sum(quantity * weighted_average_price)
}

export interface DailySale {
  date: string; // Format 'YYYY-MM-DD'
  total_quantity: number;
  total_sales: number;
  total_cost: number;
}
