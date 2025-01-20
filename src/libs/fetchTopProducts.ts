import { fetchData } from "@/libs/fetch";

export interface TopProductsData {
  products: {
    name: string;
    code: string;
    quantity: number;
    revenue: number;
    margin: number;
  }[];
}

/**
 * Récupère les données des top 5 produits avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des top 5 produits.
 */
export const fetchTopProducts = async (filters: Record<string, any>): Promise<TopProductsData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/top-product?${params}`;

  const data = await fetchData<TopProductsData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("products" in data) ||
      !Array.isArray(data.products)
    ) {
      throw new Error("Format de données invalide pour les top 5 produits");
    }
    return data as TopProductsData;
  });

  return data;
};
