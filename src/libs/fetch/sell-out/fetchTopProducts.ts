import { fetchData } from "../fetch";

export interface TopProductsData {
  topProducts: {
    name: string;
    code: string;
    quantity: number;
    revenue: number;
    margin: number;
  }[];
  flopProducts: {
    name: string;
    code: string;
    quantity: number;
    revenue: number;
    margin: number;
  }[];
}

/**
 * Récupère les données des top 10 et flop 10 produits avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des top 10 et flop 10 produits.
 */
export const fetchTopProducts = async (filters: Record<string, any>): Promise<TopProductsData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/top-product-data?${params}`;

  const data = await fetchData<TopProductsData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("topProducts" in data) ||
      !Array.isArray(data.topProducts) ||
      !("flopProducts" in data) ||
      !Array.isArray(data.flopProducts)
    ) {
      throw new Error("Format de données invalide pour les top et flop produits");
    }
    return data as TopProductsData;
  });

  return data;
};