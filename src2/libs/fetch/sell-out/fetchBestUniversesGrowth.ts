// src/libs/fetch/sell-out/fetchBestUniversesGrowth.ts
import { fetchData } from "../fetch";

export interface BestUniversesGrowthData {
  growthUniverses: {
    universe: string;
    growthRate: number;
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
}

/**
 * Récupère la croissance des univers (TOP 10)
 * @param filters - Filtres dynamiques
 */
export const fetchBestUniversesGrowth = async (
  filters: Record<string, any>
): Promise<BestUniversesGrowthData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  // On appelle la route “/api/sell-out/growth-universes-data”
  const url = `/api/sell-out/growth-universes-data?${params}`;

  const data = await fetchData<BestUniversesGrowthData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("growthUniverses" in raw) ||
      !Array.isArray((raw as any).growthUniverses)
    ) {
      throw new Error("Réponse invalide pour la croissance des univers");
    }
    return raw as BestUniversesGrowthData;
  });

  return data;
};