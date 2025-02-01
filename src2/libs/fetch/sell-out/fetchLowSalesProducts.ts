import { fetchData } from "../fetch";

export interface LowSalesProductsData {
  lowSalesProducts: {
    name: string;
    code: string;
    stock: number;
    quantitySold: number;
    revenue: number;
    margin: number;
  }[];
}

/**
 * Récupère les données des produits à faibles ventes avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques à appliquer.
 * @param maxSalesThreshold - Nombre maximal de ventes pour filtrer les produits (facultatif).
 * @returns Données des produits à faibles ventes.
 */
export const fetchLowSalesProducts = async (
  filters: Record<string, any>,
  maxSalesThreshold: number = 1 // Valeur par défaut si non spécifiée
): Promise<LowSalesProductsData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  // Ajout du paramètre maxSalesThreshold
  const params = new URLSearchParams({
    ...cleanFilters,
    minSalesThreshold: maxSalesThreshold.toString(), // Correspond à maxSalesThreshold dans l'API
  }).toString();

  const url = `/api/sell-out/unsold-product-data?${params}`;

  const data = await fetchData<LowSalesProductsData>(url, (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("lowSalesProducts" in data) ||
      !Array.isArray(data.lowSalesProducts)
    ) {
      throw new Error("Format de données invalide pour les produits à faibles ventes");
    }
    return data as LowSalesProductsData;
  });

  return data;
};