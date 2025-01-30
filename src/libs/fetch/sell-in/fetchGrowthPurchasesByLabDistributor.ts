import { fetchData } from "../fetch";

export interface GrowthPurchasesByLabDistributorData {
  growthPurchasesLabDistributors: {
    labDistributor: string;
    growthRate: number;
    currentAvgPrice: number;
    previousAvgPrice: number;
  }[];
}

/**
 * Récupère l'évolution du prix d'achat moyen par distributeur de laboratoire.
 * @param filters - Filtres dynamiques
 */
export const fetchGrowthPurchasesByLabDistributor = async (
  filters: Record<string, any>
): Promise<GrowthPurchasesByLabDistributorData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/growth-purchases-lab-distributors?${params}`;

  const data = await fetchData<GrowthPurchasesByLabDistributorData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("growthPurchasesLabDistributors" in raw) ||
      !Array.isArray((raw as any).growthPurchasesLabDistributors)
    ) {
      throw new Error("Format de réponse invalide pour l'évolution du prix d'achat moyen par labDistributor.");
    }
    return raw as GrowthPurchasesByLabDistributorData;
  });

  return data;
};