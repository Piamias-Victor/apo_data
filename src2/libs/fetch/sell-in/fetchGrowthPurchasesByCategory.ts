import { fetchData } from "../fetch";

export interface GrowthPurchasesByCategoryData {
  growthPurchasesCategories: {
    category: string;
    growthRate: number;
    currentAvgPrice: number;
    previousAvgPrice: number;
  }[];
}

/**
 * Récupère l'évolution du prix d'achat moyen par catégorie.
 * @param filters - Filtres dynamiques
 */
export const fetchGrowthPurchasesByCategory = async (
  filters: Record<string, any>
): Promise<GrowthPurchasesByCategoryData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/growth-purchases-categories?${params}`;

  const data = await fetchData<GrowthPurchasesByCategoryData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("growthPurchasesCategories" in raw) ||
      !Array.isArray((raw as any).growthPurchasesCategories)
    ) {
      throw new Error("Format de réponse invalide pour l'évolution du prix d'achat moyen par catégorie.");
    }
    return raw as GrowthPurchasesByCategoryData;
  });

  return data;
};