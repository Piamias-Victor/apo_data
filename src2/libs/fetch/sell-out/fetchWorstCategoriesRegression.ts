// src/libs/fetch/sell-out/fetchWorstCategoriesRegression.ts
import { fetchData } from "../fetch";

/** Interface pour la réponse JSON de /api/sell-out/regression-categories-data */
export interface WorstCategoriesRegressionData {
  regressionCategories: {
    category: string;
    regressionRate: number;
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
}

/**
 * Récupère la régression des catégories (TOP 10) en ordre ASC (du + bas au + haut).
 * @param filters - Filtres dynamiques (ex: category, universe, product…)
 */
export const fetchWorstCategoriesRegression = async (
  filters: Record<string, any>
): Promise<WorstCategoriesRegressionData> => {
  // Nettoyer les filtres
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  // Construire la query string
  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  // On appelle la route “/api/sell-out/regression-categories-data”
  const url = `/api/sell-out/regression-categories-data?${params}`;

  // Appel de l’API via fetchData
  const data = await fetchData<WorstCategoriesRegressionData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("regressionCategories" in raw) ||
      !Array.isArray((raw as any).regressionCategories)
    ) {
      throw new Error("Réponse invalide pour la régression des catégories");
    }
    return raw as WorstCategoriesRegressionData;
  });

  return data;
};