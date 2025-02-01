// src/libs/fetch/sell-out/fetchBestLabsGrowth.ts
import { fetchData } from "../fetch";

/** Interface pour la réponse de l'API labs */
export interface BestLabsGrowthData {
  growthLabs: {
    lab: string;
    growthRate: number;
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
}

/**
 * Récupère la croissance des laboratoires (TOP 10)
 * @param filters - Filtres dynamiques
 */
export const fetchBestLabsGrowth = async (
  filters: Record<string, any>
): Promise<BestLabsGrowthData> => {
  // Nettoyage des filtres
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  // Construire la query string
  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/growth-labs-data?${params}`;

  // Appel de l'API
  const data = await fetchData<BestLabsGrowthData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("growthLabs" in raw) ||
      !Array.isArray((raw as any).growthLabs)
    ) {
      throw new Error("Réponse invalide pour la croissance des laboratoires");
    }
    return raw as BestLabsGrowthData;
  });

  return data;
};