// /libs/salesByPharmacy.ts

import { GroupedSaleByPharmacy } from "@/types/Sale";
import { SalesFilters } from "@/types/Filter"; // Assurez-vous que ce type inclut les filtres nécessaires

// Fonction utilitaire pour effectuer la requête
import { fetchData } from "./fetch";

export const fetchGroupedSalesByPharmacy = async (
  filters?: SalesFilters
): Promise<{ groupedSales: GroupedSaleByPharmacy[]; total: number }> => {
  // Construire l'URL avec les filtres en tant que paramètres de requête
  const url = new URL("/api/sales-by-pharmacy", window.location.origin);

  // Ajout des filtres dans l'URL en tant que paramètres de requête
  if (filters?.pharmacy) {
    url.searchParams.set("pharmacyId", filters.pharmacy);
  }
  if (filters?.universe) {
    url.searchParams.set("universe", filters.universe);
  }
  if (filters?.category) {
    url.searchParams.set("category", filters.category);
  }
  if (filters?.subCategory) {
    url.searchParams.set("subCategory", filters.subCategory);
  }
  if (filters?.labDistributor) {
    url.searchParams.set("labDistributor", filters.labDistributor);
  }
  if (filters?.brandLab) {
    url.searchParams.set("brandLab", filters.brandLab);
  }
  if (filters?.rangeName) {
    url.searchParams.set("rangeName", filters.rangeName);
  }
  // Ajoutez d'autres filtres si nécessaire

  // Optionnel: Loguer l'URL pour débogage
  console.log("Fetching sales by pharmacy from URL:", url.toString());

  return await fetchData<{ groupedSales: GroupedSaleByPharmacy[]; total: number }>(
    url.toString(),
    (data: unknown) => {
      if (
        typeof data !== "object" ||
        data === null ||
        !("groupedSales" in data) ||
        !("total" in data) ||
        !Array.isArray((data as { groupedSales: unknown }).groupedSales) ||
        typeof (data as { total: unknown }).total !== "number"
      ) {
        throw new Error("Format de données invalide");
      }
      return data as { groupedSales: GroupedSaleByPharmacy[]; total: number };
    }
  );
};
