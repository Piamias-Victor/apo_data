// src/hooks/sell-out/useBestCategoriesGrowth.ts
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchBestCategoriesGrowth,
  BestCategoriesGrowthData,
} from "@/libs/fetch/sell-out/fetchBestCategoriesGrowth";

/**
 * Hook pour récupérer la croissance des catégories
 * @param skip - si true, on ne fetch pas (cascade possible)
 */
export const useBestCategoriesGrowth = (skip = false) => {
  const { filters } = useFilterContext(); // on lit les filtres globaux
  const [categoriesData, setCategoriesData] = useState<BestCategoriesGrowthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si on doit "skipper", on ne fait rien
    if (skip) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const fetched = await fetchBestCategoriesGrowth(filters);
        setCategoriesData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération de la croissance des catégories :", err);
        setError("Impossible de récupérer la croissance des catégories.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return {
    categoriesData,
    loading,
    error,
  };
};