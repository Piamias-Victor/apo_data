// src/hooks/sell-out/useWorstCategoriesRegression.ts
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchWorstCategoriesRegression,
  WorstCategoriesRegressionData,
} from "@/libs/fetch/sell-out/fetchWorstCategoriesRegression";

/**
 * Hook pour récupérer la régression des catégories.
 * @param skip - si true, on ne déclenche pas le fetch (cascade possible).
 */
export const useWorstCategoriesRegression = (skip = false) => {
  const { filters } = useFilterContext();
  const [categoriesData, setCategoriesData] = useState<WorstCategoriesRegressionData | null>(null);
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
        const fetched = await fetchWorstCategoriesRegression(filters);
        setCategoriesData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération de la régression des catégories :", err);
        setError("Impossible de récupérer la régression des catégories.");
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