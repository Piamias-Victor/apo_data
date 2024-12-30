/**
 * Type définissant la structure d'une vente.
 */
export type Sale = {
  id: string;
  created_at: string;
  updated_at: string;
  quantity: number;
  time: string;
  operator_code: string;
  product_id: string;
  stock: number | null;
  price_with_tax: number | null;
  weighted_average_price: number | null;
  code13_ref: string | null;
};

