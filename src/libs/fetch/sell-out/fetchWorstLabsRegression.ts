// src/libs/fetch/sell-out/fetchWorstLabsRegression.ts
import { fetchData } from "../fetch";

/** Interface pour la réponse de l'API labs en régression */
export interface WorstLabsRegressionData {
  regressionLabs: {
    lab: string;
    regressionRate: number;
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
}

/**
 * Récupère la régression des laboratoires (TOP 10 “flop”)
 * @param filters - Filtres dynamiques
 */
export const fetchWorstLabsRegression = async (
  filters: Record<string, any>
): Promise<WorstLabsRegressionData> => {
  // Nettoyer les filtres
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  // Construire la query string
  const params = new URLSearchParams(cleanFilters as Record<string, string>).toString();
  // On suppose que vous avez créé la route /api/sell-out/regression-labs-data
  const url = `/api/sell-out/regression-labs-data?${params}`;

  // Appel de l'API via votre helper fetchData
  const data = await fetchData<WorstLabsRegressionData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("regressionLabs" in raw) ||
      !Array.isArray((raw as any).regressionLabs)
    ) {
      throw new Error("Réponse invalide pour la régression des laboratoires");
    }
    return raw as WorstLabsRegressionData;
  });

  return data;
};