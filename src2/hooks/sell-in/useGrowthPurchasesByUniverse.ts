import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchGrowthPurchasesByUniverse,
  GrowthPurchasesByUniverseData,
} from "@/libs/fetch/sell-in/fetchGrowthPurchasesByUniverse";

/**
 * Hook pour récupérer l'évolution du prix d'achat moyen par univers.
 * @param skip - Si true, on ne fetch pas
 */
export const useGrowthPurchasesByUniverse = (skip = false) => {
  const { filters } = useFilterContext();
  const [universesData, setUniversesData] = useState<GrowthPurchasesByUniverseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }

    (async () => {
      try {
        console.log("Fetching growth purchases by universe...");
        setLoading(true);
        const fetched = await fetchGrowthPurchasesByUniverse(filters);
        setUniversesData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération des achats par univers :", err);
        setError("Impossible de récupérer l'évolution du prix d'achat moyen par univers.");
      } finally {
        console.log("Fetch terminé pour growth purchases by universe.");
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