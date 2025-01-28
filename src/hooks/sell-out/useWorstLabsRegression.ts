// src/hooks/sell-out/useWorstLabsRegression.ts
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchWorstLabsRegression, WorstLabsRegressionData } from "@/libs/fetch/sell-out/fetchWorstLabsRegression";

/**
 * Hook pour récupérer la régression des laboratoires
 * @param skip - Si true, on ne fetch pas (cascade possible)
 */
export const useWorstLabsRegression = (skip = false) => {
  const { filters } = useFilterContext();
  const [labsData, setLabsData] = useState<WorstLabsRegressionData | null>(null);
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
        const fetched = await fetchWorstLabsRegression(filters);
        setLabsData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération de la régression des labs :", err);
        setError("Impossible de récupérer les données de régression des laboratoires.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return {
    labsData,
    loading,
    error,
  };
};