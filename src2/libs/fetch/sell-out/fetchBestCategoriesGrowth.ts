// src/libs/fetch/sell-out/fetchBestCategoriesGrowth.ts
import { fetchData } from "../fetch";

/** Structure de la réponse renvoyée par l'API growth-categories-data */
export interface BestCategoriesGrowthData {
  growthCategories: {
    category: string;
    growthRate: number;
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
}

/**
 * Récupère la croissance des catégories (TOP 10).
 * @param filters - Filtres à appliquer pour la requête (ex: category, universe, product, etc.)
 */
export const fetchBestCategoriesGrowth = async (
  filters: Record<string, any>
): Promise<BestCategoriesGrowthData> => {
  // Nettoyer les filtres pour enlever tout ce qui est null ou undefined
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  // Créer la query string
  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  // Endpoint : /api/sell-out/growth-categories-data
  const url = `/api/sell-out/growth-categories-data?${params}`;

  // On utilise fetchData<T> (votre helper)
  const data = await fetchData<BestCategoriesGrowthData>(url, (raw: unknown) => {
    // Valider le format
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("growthCategories" in raw) ||
      !Array.isArray((raw as any).growthCategories)
    ) {
      throw new Error("Réponse invalide pour la croissance des catégories");
    }
    return raw as BestCategoriesGrowthData;
  });

  return data;
};