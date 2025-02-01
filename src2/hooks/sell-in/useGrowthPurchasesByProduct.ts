import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchGrowthPurchasesByProduct,
  GrowthPurchasesByProductData,
} from "@/libs/fetch/sell-in/fetchGrowthPurchasesByProduct";

/**
 * Hook pour récupérer l'évolution du prix d'achat moyen par produit.
 * @param skip - Si true, on ne fetch pas
 */
export const useGrowthPurchasesByProduct = (skip = false) => {
  const { filters } = useFilterContext();
  const [productsData, setProductsData] = useState<GrowthPurchasesByProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }

    (async () => {
      try {
        console.log("Fetching growth purchases by product...");
        setLoading(true);
        const fetched = await fetchGrowthPurchasesByProduct(filters);
        setProductsData(fetched);
      } catch (err) {
        console.error("Erreur lors de la récupération des achats par produit :", err);
        setError("Impossible de récupérer l'évolution du prix d'achat moyen par produit.");
      } finally {
        console.log("Fetch terminé pour growth purchases by product.");
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return {
    productsData,
    loading,
    error,
  };
};