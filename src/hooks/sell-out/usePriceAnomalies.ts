// src/hooks/sell-out/usePriceAnomalies.ts
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchPriceAnomalies,
  PriceAnomaliesData,
} from "@/libs/fetch/sell-out/fetchPriceAnomalies";

/**
 * Hook pour récupérer les anomalies de prix.
 * @param skip - Si true, la récupération est ignorée.
 */
export const usePriceAnomalies = (skip = false) => {
  const { filters } = useFilterContext();
  const [anomaliesData, setAnomaliesData] = useState<PriceAnomaliesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const fetched = await fetchPriceAnomalies(filters);
        setAnomaliesData(fetched);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des anomalies de prix :", err);
        setError("Impossible de récupérer les anomalies de prix.");
        setAnomaliesData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return {
    anomaliesData,
    loading,
    error,
  };
};