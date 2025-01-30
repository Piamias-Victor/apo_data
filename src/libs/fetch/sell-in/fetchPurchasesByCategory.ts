import { fetchData } from "@/libs/fetch/fetch";

export interface PurchasesByCategoryData {
  categories: { category: string; quantity: number; cost: number }[];
}

export const fetchPurchasesByCategory = async (filters: Record<string, any>): Promise<PurchasesByCategoryData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/purchases-by-category?${params}`;

  return fetchData<PurchasesByCategoryData>(url, (data: unknown) => {
    if (!data || typeof data !== "object" || !("categories" in data)) {
      throw new Error("Format de données invalide pour les achats par catégorie");
    }
    return data as PurchasesByCategoryData;
  });
};