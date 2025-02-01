import { fetchData } from "../fetch";

export interface GrowthPurchasesByProductData {
  growthPurchasesProducts: {
    productName: string;
    growthRate: number;
    currentAvgPrice: number;
    previousAvgPrice: number;
  }[];
}

/**
 * Récupère l'évolution du prix d'achat moyen par produit.
 * @param filters - Filtres dynamiques
 */
export const fetchGrowthPurchasesByProduct = async (
  filters: Record<string, any>
): Promise<GrowthPurchasesByProductData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/growth-purchases-products?${params}`;

  const data = await fetchData<GrowthPurchasesByProductData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("growthPurchasesProducts" in raw) ||
      !Array.isArray((raw as any).growthPurchasesProducts)
    ) {
      throw new Error("Format de réponse invalide pour l'évolution du prix d'achat moyen par produit.");
    }
    return raw as GrowthPurchasesByProductData;
  });

  return data;
};