import { fetchData } from "./fetch";

/**
 * Interface représentant un univers avec son taux de rupture.
 */
export interface StockoutUnivers {
  universe: string;
  stockoutRate: number;
}

/**
 * Fonction pour récupérer les taux de rupture par univers.
 * 
 * @returns Promise avec la liste des taux de rupture par univers.
 */
export const fetchStockoutUnivers = async (): Promise<StockoutUnivers[]> => {
  const data = await fetchData<{ stockoutUnivers: StockoutUnivers[] }>(
    "/api/stockout-univers",
    (data: unknown) => {
      if (
        typeof data !== "object" ||
        data === null ||
        !("stockoutUnivers" in data) ||
        !Array.isArray((data as { stockoutUnivers: unknown }).stockoutUnivers)
      ) {
        throw new Error("Format de données invalide pour stockoutUnivers");
      }
      return data as { stockoutUnivers: StockoutUnivers[] };
    }
  );

  return data.stockoutUnivers;
};
