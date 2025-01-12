// /libs/sales.ts
import { GroupedSale } from "@/types/Sale";
import { SalesFilters } from "@/types/Filter";

// Fonction utilitaire pour effectuer la requête
import { fetchData } from "./fetch";

export const fetchGroupedSales = async (
  filters?: SalesFilters
): Promise<{ groupedSales: GroupedSale[]; total: number }> => {
  // Construire l'URL avec les filtres en tant que paramètres de requête
  const url = new URL("/api/sales", window.location.origin);

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

  return await fetchData<{ groupedSales: GroupedSale[]; total: number }>(
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
      return data as { groupedSales: GroupedSale[]; total: number };
    }
  );
};
