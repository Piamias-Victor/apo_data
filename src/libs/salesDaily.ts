// /libs/salesDaily.ts

import { DailySale } from "@/types/Sale";
import { SalesFilters } from "@/types/Filter"; // Assurez-vous que cette interface est définie
import { fetchData } from "./fetch";

/**
 * Fonction utilitaire pour récupérer les ventes quotidiennes globales.
 * @param filters Filtres optionnels pour les dates et autres paramètres.
 * @returns Les ventes quotidiennes et le total des enregistrements.
 */
export const fetchDailySales = async (
  filters?: SalesFilters & { startDate?: string; endDate?: string } // Ajout des filtres de date
): Promise<{ dailySales: DailySale[]; total: number }> => {
  // Construire l'URL avec les filtres en tant que paramètres de requête
  const url = new URL("/api/sales-daily", window.location.origin);

  // Ajout des filtres dans l'URL en tant que paramètres de requête
  if (filters?.startDate) {
    url.searchParams.set("startDate", filters.startDate);
  }
  if (filters?.endDate) {
    url.searchParams.set("endDate", filters.endDate);
  }
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
  console.log("Fetching daily sales from URL:", url.toString());

  return await fetchData<{ dailySales: DailySale[]; total: number }>(
    url.toString(),
    (data: unknown) => {
      if (
        typeof data !== "object" ||
        data === null ||
        !("dailySales" in data) ||
        !("total" in data) ||
        !Array.isArray((data as any).dailySales) ||
        typeof (data as any).total !== "number"
      ) {
        throw new Error("Format de données invalide");
      }
      return data as { dailySales: DailySale[]; total: number };
    }
  );
};
