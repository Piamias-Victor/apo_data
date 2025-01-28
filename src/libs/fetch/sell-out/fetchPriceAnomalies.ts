// src/libs/fetch/sell-out/fetchPriceAnomalies.ts
import { fetchData } from "../fetch";

/**
 * Interface représentant une anomalie de prix.
 */
export interface PriceAnomaly {
  code: string; // Code de référence à 13 caractères
  productName: string;
  previousPrice: number;
  currentPrice: number;
  dateOfChange: string; // Format: YYYY-MM-DD
  percentageChange: number; // En pourcentage
  internalProductName?: string; // Nom interne du produit (optionnel)
}

export interface PriceAnomaliesData {
  anomalies: PriceAnomaly[];
}

/**
 * Récupère les anomalies de prix.
 * @param filters - Filtres dynamiques à appliquer à la requête.
 */
export const fetchPriceAnomalies = async (
  filters: Record<string, any>
): Promise<PriceAnomaliesData> => {
  // Nettoyer les filtres en supprimant ceux qui sont undefined ou null
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, val]) => val !== undefined && val !== null)
  );

  // Convertir les filtres en paramètres de requête URL
  const params = new URLSearchParams(
    Object.entries(cleanFilters).flatMap(([key, value]) =>
      Array.isArray(value)
        ? value.map((val) => [key, val])
        : [[key, String(value)]]
    )
  ).toString();

  // Construire l'URL de l'API avec les paramètres
  const url = `/api/sell-out/price-evolution-data?${params}`;

  // Appeler l'API et traiter la réponse
  const data = await fetchData<PriceAnomaliesData>(url, (raw: unknown) => {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("anomalies" in raw) ||
      !Array.isArray((raw as any).anomalies)
    ) {
      throw new Error("Réponse invalide pour les anomalies de prix");
    }
    // Validation supplémentaire des anomalies
    const anomalies = (raw as any).anomalies;
    anomalies.forEach((anomaly: any, index: number) => {
      if (
        typeof anomaly.code !== "string" ||
        anomaly.code.length !== 13 ||
        typeof anomaly.productName !== "string" ||
        typeof anomaly.previousPrice !== "number" ||
        typeof anomaly.currentPrice !== "number" ||
        typeof anomaly.dateOfChange !== "string" ||
        typeof anomaly.percentageChange !== "number"
      ) {
        throw new Error(`Anomalie invalide à l'index ${index}`);
      }

      // Remplacer le nom du produit si c'est "Default Name"
      if (anomaly.productName === "Default Name") {
        if (typeof anomaly.internalProductName === "string" && anomaly.internalProductName.trim() !== "") {
          anomaly.productName = anomaly.internalProductName;
        } else {
          // Optionnel : Vous pouvez gérer le cas où internalProductName n'est pas disponible
          console.warn(
            `Anomalie à l'index ${index} a un nom par défaut mais aucun nom interne disponible.`
          );
        }
      }
    });
    return raw as PriceAnomaliesData;
  });

  return data;
};