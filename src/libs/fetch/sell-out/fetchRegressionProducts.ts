// src/libs/fetch/sell-out/fetchRegressionProducts.ts
import { fetchData } from "../fetch";

/** Modèle des données renvoyées par l'API */
export interface RegressionProductsData {
  regressionProducts: {
    product: string;
    code: string;
    regressionRate: number;
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
}

/**
 * Récupère les données de produits en régression via l'API
 * @param filters - Filtres dynamiques à appliquer (ex: category, universe, etc.)
 */
export const fetchRegressionProducts = async (
  filters: Record<string, any>
): Promise<RegressionProductsData> => {
  // Nettoyer les filtres pour enlever ceux qui sont undefined ou null
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  // Construire l’URL avec queryString
  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/regression-products-data?${params}`;

  // On utilise votre utilitaire fetchData<RegressionProductsData>
  const data = await fetchData<RegressionProductsData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("regressionProducts" in raw) ||
      !Array.isArray((raw as any).regressionProducts)
    ) {
      throw new Error("Format de données invalide pour les produits en régression");
    }
    return raw as RegressionProductsData;
  });

  return data;
};