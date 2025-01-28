// src/libs/fetch/sell-out/fetchWorstUniversesRegression.ts
import { fetchData } from "../fetch";

export interface WorstUniversesRegressionData {
  regressionUniverses: {
    universe: string;
    regressionRate: number;
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
}

/**
 * Récupère la régression des univers (TOP 10) en ordre ascendant du taux
 * @param filters - Filtres dynamiques
 */
export const fetchWorstUniversesRegression = async (
  filters: Record<string, any>
): Promise<WorstUniversesRegressionData> => {
  // Nettoyage des filtres
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  // On appelle “/api/sell-out/regression-universes-data”
  const url = `/api/sell-out/regression-universes-data?${params}`;

  const data = await fetchData<WorstUniversesRegressionData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("regressionUniverses" in raw) ||
      !Array.isArray((raw as any).regressionUniverses)
    ) {
      throw new Error("Réponse invalide pour la régression des univers");
    }
    return raw as WorstUniversesRegressionData;
  });

  return data;
};