import { fetchData } from "@/libs/fetch/fetch";

export interface PurchasesByUniverseData {
  universes: { universe: string; quantity: number; cost: number }[];
}

/**
 * Récupère les achats par univers avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @returns Données des achats par univers.
 */
export const fetchPurchasesByUniverse = async (filters: Record<string, any>): Promise<PurchasesByUniverseData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/purchases-by-universe?${params}`;

  const data = await fetchData<PurchasesByUniverseData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("universes" in data) ||
      !Array.isArray(data.universes)
    ) {
      throw new Error("Format de données invalide pour les achats par univers");
    }
    return data as PurchasesByUniverseData;
  });

  return data;
};