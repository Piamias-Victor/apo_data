import { fetchData } from "../fetch";

export interface PeakSalesData {
  peakSales: {
    date: string;
    product: string;
    code: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

/**
 * Récupère les données des périodes de pics de vente avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des périodes de pics de vente.
 */
export const fetchPeakSales = async (filters: Record<string, any>): Promise<PeakSalesData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/peak-sales-data?${params}`;

  const data = await fetchData<PeakSalesData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("peakSales" in data) ||
      !Array.isArray(data.peakSales)
    ) {
      throw new Error("Format de données invalide pour les périodes de pics de vente");
    }
    return data as PeakSalesData;
  });

  return data;
};