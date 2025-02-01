import { fetchData } from "@/libs/fetch/fetch";

export interface SalesByMonthData {
  months: string[]; // Liste des mois
  quantities: number[]; // Quantités vendues par mois
  revenues: number[]; // Revenus totaux par mois
  margins: number[]; // Marge totale par mois
}

/**
 * Récupère les ventes par mois avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des ventes par mois.
 */
export const fetchSalesByMonth = async (filters: Record<string, any>): Promise<SalesByMonthData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/sales-by-month-data?${params}`;

  console.log('url : ', url)

  const data = await fetchData<SalesByMonthData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("months" in data) ||
      !("quantities" in data) ||
      !("revenues" in data) ||
      !("margins" in data)
    ) {
      throw new Error("Format de données invalide pour les ventes par mois");
    }
    return data as SalesByMonthData;
  });

  return data;
};
