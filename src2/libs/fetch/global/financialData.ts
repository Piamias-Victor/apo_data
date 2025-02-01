import { fetchData } from "@/libs/fetch/fetch";

export interface FinancialData {
  totalRevenue: number;
  totalPurchase: number;
  totalMargin: number;
  totalQuantity: number;
  averageSellingPrice: number;
  averagePurchasePrice: number;
  marginPercentage: number;
}

/**
 * Fetch les données financières avec les filtres fournis.
 * 
 * @param filters - Filtres dynamiques passés à l'API.
 * @returns Données financières formatées.
 */
export const fetchFinancialData = async (filters: Record<string, any>): Promise<FinancialData> => {
  // Supprimer les clés ayant des valeurs nulles ou undefined
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/global/financial-data?${params}`;

  const data = await fetchData<FinancialData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("totalRevenue" in data) ||
      !("totalPurchase" in data) ||
      !("totalMargin" in data) ||
      !("averageSellingPrice" in data) ||
      !("averagePurchasePrice" in data) ||
      !("marginPercentage" in data)
    ) {
      throw new Error("Format de données invalide pour les données financières");
    }
    return data as FinancialData;
  });

  return data;
};
