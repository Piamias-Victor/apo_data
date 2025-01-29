// src/hooks/sell-out/useWorstUniversesRegression.ts
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchWorstUniversesRegression,
  WorstUniversesRegressionData,
} from "@/libs/fetch/sell-out/fetchWorstUniversesRegression";

/**
 * Hook pour récupérer la régression des univers
 * @param skip - si true, on ne lance pas le fetch
 */
export const useWorstUniversesRegression = (skip = false) => {
  const { filters } = useFilterContext();
  const [universesData, setUniversesData] = useState<WorstUniversesRegressionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }

    (async () => {
      try {
        console.log("on rentre du useWorstUniversesRegression");
        setLoading(true);
        const fetched = await fetchWorstUniversesRegression(filters);
        setUniversesData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération de la régression des univers :", err);
        setError("Impossible de récupérer la régression des univers.");
      } finally {
        console.log("on rentre du useWorstUniversesRegression");
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return {
    universesData,
    loading,
    error,
  };
};