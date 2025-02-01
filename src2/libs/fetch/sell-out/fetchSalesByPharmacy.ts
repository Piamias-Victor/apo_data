// src/libs/fetch/sell-out/fetchSalesByPharmacy.ts

import { fetchData } from "@/libs/fetch/fetch";

export interface SalesByPharmacyData {
  pharmacies: {
    pharmacyId: string;
    quantity: number;
    revenue: number;
    margin: number;
  }[];
}

/**
 * Récupère les ventes par pharmacie avec les filtres fournis.
 *
 * @param filters - Filtres dynamiques
 * @returns Données des ventes par pharmacie
 */
export const fetchSalesByPharmacy = async (
  filters: Record<string, any>
): Promise<SalesByPharmacyData> => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
  );

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-out/sales-by-pharmacy-data?${params}`;

  // Appel via votre helper fetchData
  const data = await fetchData<SalesByPharmacyData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("pharmacies" in raw) ||
      !Array.isArray((raw as any).pharmacies)
    ) {
      throw new Error("Format de données invalide pour les ventes par pharmacie");
    }
    return raw as SalesByPharmacyData;
  });

  return data;
};