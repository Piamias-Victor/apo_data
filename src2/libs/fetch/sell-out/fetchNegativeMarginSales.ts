// src/libs/fetch/sell-out/fetchNegativeMarginSales.ts

import { fetchData } from "@/libs/fetch/fetch";

export interface NegativeMarginSalesData {
  products: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
    margin: number;
    averageSellingPrice: number;
    averagePurchasePrice: number;
  }[];
}

/**
 * Récupère les ventes des produits avec marges négatives.
 *
 * @param filters - Filtres dynamiques à appliquer (par exemple, startDate, endDate, selectedCategory, universe, etc.).
 * @returns Données des ventes avec marges négatives.
 */
export const fetchNegativeMarginSales = async (
  filters: Record<string, any>
): Promise<NegativeMarginSalesData> => {
  // Nettoyage des filtres pour enlever les valeurs undefined ou null
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  // Construction des paramètres de requête
  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/sales-with-negative-margin-data?${params}`;

  // Fetch des données depuis l'API
  const data = await fetchData<NegativeMarginSalesData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("products" in raw) ||
      !Array.isArray((raw as any).products)
    ) {
      throw new Error("Format de données invalide pour les ventes avec marges négatives");
    }
    return raw as NegativeMarginSalesData;
  });

  return data;
};