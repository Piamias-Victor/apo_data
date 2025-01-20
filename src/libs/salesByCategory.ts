import { fetchData } from "@/libs/fetch";

export interface SalesByCategoryData {
  categories: { category: string; quantity: number; revenue: number; margin: number }[];
}

/**
 * Récupère les ventes par catégorie avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des ventes par catégorie.
 */
export const fetchSalesByCategory = async (filters: Record<string, any>): Promise<SalesByCategoryData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sales-by-category-data?${params}`;

  const data = await fetchData<SalesByCategoryData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("categories" in data) ||
      !Array.isArray(data.categories)
    ) {
      throw new Error("Format de données invalide pour les ventes par catégorie");
    }
    return data as SalesByCategoryData;
  });

  return data;
};
