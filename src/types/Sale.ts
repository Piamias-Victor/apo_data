// src/types/sale.ts

/**
 * Interface représentant une vente groupée par code_13_ref avec agrégations.
 */
// src/types/Sale.ts

export interface GroupedSale {
  tva: number;
  code_13_ref: string;
  name: string;
  total_quantity: number;
  avg_price_with_tax: number;
  avg_weighted_average_price: number;
}
