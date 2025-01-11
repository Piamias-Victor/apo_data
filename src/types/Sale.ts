// src/types/sale.ts

/**
 * Interface représentant une vente groupée par code_13_ref avec agrégations.
 */
// src/types/Sale.ts

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
}
