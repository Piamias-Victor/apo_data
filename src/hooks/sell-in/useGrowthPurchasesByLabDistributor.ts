import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchGrowthPurchasesByLabDistributor,
  GrowthPurchasesByLabDistributorData,
} from "@/libs/fetch/sell-in/fetchGrowthPurchasesByLabDistributor";

/**
 * Hook pour récupérer l'évolution du prix d'achat moyen par distributeur de laboratoire.
 * @param skip - Si true, on ne fetch pas
 */
export const useGrowthPurchasesByLabDistributor = (skip = false) => {
  const { filters } = useFilterContext();
  const [labDistributorsData, setLabDistributorsData] = useState<GrowthPurchasesByLabDistributorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }

    (async () => {
      try {
        console.log("Fetching growth purchases by lab distributor...");
        setLoading(true);
        const fetched = await fetchGrowthPurchasesByLabDistributor(filters);
        setLabDistributorsData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération des achats par lab distributor :", err);
        setError("Impossible de récupérer l'évolution du prix d'achat moyen par lab distributor.");
      } finally {
        console.log("Fetch terminé pour growth purchases by lab distributor.");
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return {
    labDistributorsData,
    loading,
    error,
  };
};