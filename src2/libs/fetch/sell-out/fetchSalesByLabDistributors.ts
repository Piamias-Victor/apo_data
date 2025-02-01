import { fetchData } from "@/libs/fetch/fetch";

export interface SalesByLabDistributorsData {
  labDistributors: { labDistributor: string; quantity: number; revenue: number; margin: number }[];
}

/**
 * Récupère les ventes par lab distributor avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des ventes par lab distributor.
 */
export const fetchSalesByLabDistributors = async (
  filters: Record<string, any>
): Promise<SalesByLabDistributorsData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/sales-by-lab-distributor-data?${params}`;

  const data = await fetchData<SalesByLabDistributorsData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("labDistributors" in data) ||
      !Array.isArray(data.labDistributors)
    ) {
      throw new Error("Format de données invalide pour les ventes par lab distributors");
    }
    return data as SalesByLabDistributorsData;
  });

  return data;
};
