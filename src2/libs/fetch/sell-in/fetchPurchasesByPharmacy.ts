import { fetchData } from "@/libs/fetch/fetch";

export interface PurchasesByPharmacyData {
  pharmacies: { pharmacyId: string; quantity: number; cost: number }[];
}

export const fetchPurchasesByPharmacy = async (
  filters: Record<string, any>
): Promise<PurchasesByPharmacyData> => {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null));

  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  const url = `/api/sell-in/purchases-by-pharmacy?${params}`;

  return fetchData<PurchasesByPharmacyData>(url, (data: unknown) => {
    if (typeof data !== "object" || data === null || !("pharmacies" in data) || !Array.isArray(data.pharmacies)) {
      throw new Error("Format de données invalide pour les achats par pharmacie");
    }
    return data as PurchasesByPharmacyData;
  });
};