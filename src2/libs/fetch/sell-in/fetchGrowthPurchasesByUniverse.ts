import { fetchData } from "../fetch";

export interface GrowthPurchasesByUniverseData {
  growthPurchasesUniverses: {
    universe: string;
    growthRate: number;
    currentAvgPrice: number;
    previousAvgPrice: number;
  }[];
}

/**
 * Récupère l'évolution du prix d'achat moyen par univers.
 * @param filters - Filtres dynamiques
 */
export const fetchGrowthPurchasesByUniverse = async (
  filters: Record<string, any>
): Promise<GrowthPurchasesByUniverseData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/growth-purchases-universes?${params}`;

  const data = await fetchData<GrowthPurchasesByUniverseData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("growthPurchasesUniverses" in raw) ||
      !Array.isArray((raw as any).growthPurchasesUniverses)
    ) {
      throw new Error("Format de réponse invalide pour l'évolution du prix d'achat moyen par univers.");
    }
    return raw as GrowthPurchasesByUniverseData;
  });

  return data;
};