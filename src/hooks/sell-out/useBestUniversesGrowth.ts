// src/hooks/sell-out/useBestUniversesGrowth.ts
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchBestUniversesGrowth,
  BestUniversesGrowthData,
} from "@/libs/fetch/sell-out/fetchBestUniversesGrowth";

/**
 * Hook pour récupérer la croissance des univers
 * @param skip - si true, on ne fetch pas
 */
export const useBestUniversesGrowth = (skip = false) => {
  const { filters } = useFilterContext();
  const [universesData, setUniversesData] = useState<BestUniversesGrowthData | null>(null);
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
        const fetched = await fetchBestUniversesGrowth(filters);
        setUniversesData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération de la croissance des univers :", err);
        setError("Impossible de récupérer la croissance des univers.");
      } finally {
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