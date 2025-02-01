import { fetchData } from "@/libs/fetch/fetch";

export interface PurchasesByMonthData {
  months: string[]; // Liste des mois
  quantities: number[]; // Quantités achetées par mois
  costs: number[]; // Coût total des achats par mois
}

/**
 * Récupère les achats par mois avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des achats par mois.
 */
export const fetchPurchasesByMonth = async (filters: Record<string, any>): Promise<PurchasesByMonthData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/purchases-by-month?${params}`;

  console.log('url : ', url);

  const data = await fetchData<PurchasesByMonthData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("months" in data) ||
      !("quantities" in data) ||
      !("costs" in data)
    ) {
      throw new Error("Format de données invalide pour les achats par mois");
    }
    return data as PurchasesByMonthData;
  });

  return data;
};