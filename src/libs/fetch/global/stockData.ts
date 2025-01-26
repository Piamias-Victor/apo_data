import { fetchData } from "@/libs/fetch/fetch";

export interface StockData {
  stockValue: number;
  soldReferencesCount: number;
}

export const fetchStockData = async (filters: Record<string, any>): Promise<StockData> => {
  // Supprimer les clés ayant des valeurs nulles ou undefined

  console.log('filters', filters)
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  console.log('cleanFilters', cleanFilters)

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  console.log('params', params)
  const url = `/api/global/stock-data?${params}`;

  console.log("URL générée pour stock-data :", url); // DEBUG

  const data = await fetchData<StockData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("stockValue" in data) ||
      !("soldReferencesCount" in data)
    ) {
      throw new Error("Format de données invalide pour les données de stock");
    }
    return data as StockData;
  });

  return data;
};
