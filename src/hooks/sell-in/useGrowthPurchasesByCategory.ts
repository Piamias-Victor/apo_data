import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchGrowthPurchasesByCategory,
  GrowthPurchasesByCategoryData,
} from "@/libs/fetch/sell-in/fetchGrowthPurchasesByCategory";

/**
 * Hook pour récupérer l'évolution du prix d'achat moyen par catégorie.
 * @param skip - Si true, on ne fetch pas
 */
export const useGrowthPurchasesByCategory = (skip = false) => {
  const { filters } = useFilterContext();
  const [categoriesData, setCategoriesData] = useState<GrowthPurchasesByCategoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }

    (async () => {
      try {
        console.log("Fetching growth purchases by category...");
        setLoading(true);
        const fetched = await fetchGrowthPurchasesByCategory(filters);
        setCategoriesData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération des achats par catégorie :", err);
        setError("Impossible de récupérer l'évolution du prix d'achat moyen par catégorie.");
      } finally {
        console.log("Fetch terminé pour growth purchases by category.");
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