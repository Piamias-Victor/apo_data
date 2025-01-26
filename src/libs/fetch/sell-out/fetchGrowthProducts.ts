import { fetchData } from "../fetch";

export interface GrowthProductsData {
  growthProducts: {
    product: string;
    code: string;
    growthRate: number;
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
}

/**
 * Récupère les données des produits en croissance avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des produits en croissance.
 */
export const fetchGrowthProducts = async (filters: Record<string, any>): Promise<GrowthProductsData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/growth-products-data?${params}`;

  const data = await fetchData<GrowthProductsData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("growthProducts" in data) ||
      !Array.isArray(data.growthProducts)
    ) {
      throw new Error("Format de données invalide pour les produits en croissance");
    }
    return data as GrowthProductsData;
  });

  return data;
};