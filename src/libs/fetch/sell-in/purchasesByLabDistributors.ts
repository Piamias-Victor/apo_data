import { fetchData } from "@/libs/fetch/fetch";

export interface PurchasesByLabDistributorsData {
  labDistributors: { labDistributor: string; quantity: number; cost: number }[];
}

/**
 * Récupère les achats par lab distributeur avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des achats par lab distributeur.
 */
export const fetchPurchasesByLabDistributors = async (
  filters: Record<string, any>
): Promise<PurchasesByLabDistributorsData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/purchases-by-lab-distributors?${params}`;

  const data = await fetchData<PurchasesByLabDistributorsData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("labDistributors" in data) ||
      !Array.isArray(data.labDistributors)
    ) {
      throw new Error("Format de données invalide pour les achats par lab distributeurs");
    }
    return data as PurchasesByLabDistributorsData;
  });

  return data;
};