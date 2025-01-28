// src/hooks/sell-out/useBestLabsGrowth.ts
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchBestLabsGrowth, BestLabsGrowthData } from "@/libs/fetch/sell-out/fetchBestLabsGrowth";

/**
 * Hook pour récupérer la croissance des laboratoires
 * @param skip - Empêche de fetch si true (cascade possible)
 */
export const useBestLabsGrowth = (skip = false) => {
  const { filters } = useFilterContext();
  const [labsData, setLabsData] = useState<BestLabsGrowthData | null>(null);
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
        const fetched = await fetchBestLabsGrowth(filters);
        setLabsData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération de la croissance des labs :", err);
        setError("Impossible de récupérer les données de croissance des laboratoires.");
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