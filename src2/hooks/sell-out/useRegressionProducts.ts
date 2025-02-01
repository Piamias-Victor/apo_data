// src/hooks/sell-out/useRegressionProducts.ts
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchRegressionProducts,
  RegressionProductsData,
} from "@/libs/fetch/sell-out/fetchRegressionProducts";

/**
 * Hook pour récupérer les produits en régression
 * @param skip - Permet de "skipper" le fetch (ex: si on attend un autre contexte)
 */
export const useRegressionProducts = (skip = false) => {
  const { filters } = useFilterContext();
  const [regressionData, setRegressionData] = useState<RegressionProductsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      
      // Si skip = true, on ne fetch pas (cascade)
      setLoading(true);
      return;
    }

    (async () => {
      try {
        console.log("on rentre du useRegressionProducts");

        setLoading(true);
        const fetched = await fetchRegressionProducts(filters);
        setRegressionData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération des produits en régression :", err);
        setError("Impossible de récupérer les données des produits en régression.");
      } finally {
        console.log("on sort du useRegressionProducts");

        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return {
    regressionProductsData: regressionData,
    loading,
    error,
  };
};