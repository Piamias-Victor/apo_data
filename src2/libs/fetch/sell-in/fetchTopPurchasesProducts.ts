import { fetchData } from "../fetch";

export interface TopPurchasesProductsData {
  topProducts: {
    name: string;
    code: string;
    quantity: number;
    cost: number;
  }[];
  flopProducts: {
    name: string;
    code: string;
    quantity: number;
    cost: number;
  }[];
}

/**
 * Récupère les données des top 10 et flop 10 produits achetés avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des top 10 et flop 10 produits achetés.
 */
export const fetchTopPurchasesProducts = async (filters: Record<string, any>): Promise<TopPurchasesProductsData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/top-flop-products?${params}`;

  const data = await fetchData<TopPurchasesProductsData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("topProducts" in data) ||
      !Array.isArray(data.topProducts) ||
      !("flopProducts" in data) ||
      !Array.isArray(data.flopProducts)
    ) {
      throw new Error("Format de données invalide pour les top et flop produits achetés");
    }
    return data as TopPurchasesProductsData;
  });

  return data;
};