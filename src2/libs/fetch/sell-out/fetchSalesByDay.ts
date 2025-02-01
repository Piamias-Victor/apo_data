import { fetchData } from "@/libs/fetch/fetch";

export interface SalesByDayData {
  days: string[]; // Liste des jours
  quantities: number[]; // Quantités vendues par jour
  revenues: number[]; // Revenus totaux par jour
  margins: number[]; // Marge totale par jour
}

/**
 * Récupère les ventes par jour avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des ventes par jour.
 */
export const fetchSalesByDay = async (filters: Record<string, any>): Promise<SalesByDayData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/sales-by-day-data?${params}`;

  console.log('url : ', url)

  const data = await fetchData<SalesByDayData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("days" in data) ||
      !("quantities" in data) ||
      !("revenues" in data) ||
      !("margins" in data)
    ) {
      throw new Error("Format de données invalide pour les ventes par jour");
    }
    return data as SalesByDayData;
  });

  return data;
};