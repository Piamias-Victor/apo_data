import { fetchData } from "@/libs/fetch";

export interface SalesByUniverseData {
  universes: { universe: string; quantity: number; revenue: number; margin: number }[];
}

/**
 * Récupère les ventes par univers avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des ventes par univers.
 */
export const fetchSalesByUniverse = async (filters: Record<string, any>): Promise<SalesByUniverseData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sales-by-universe-data?${params}`;

  const data = await fetchData<SalesByUniverseData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("universes" in data) ||
      !Array.isArray(data.universes)
    ) {
      throw new Error("Format de données invalide pour les ventes par univers");
    }
    return data as SalesByUniverseData;
  });

  return data;
};
