import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchTopPurchasesProducts, TopPurchasesProductsData } from "@/libs/fetch/sell-in/fetchTopPurchasesProducts";

/**
 * Hook pour récupérer les données des top 10 et flop 10 produits achetés.
 *
 * @returns Données des produits achetés, statut de chargement et erreurs éventuelles.
 */
export const useTopPurchasesProducts = (skip = false) => {
  const { filters } = useFilterContext();
  const [topProductsData, setTopProductsData] = useState<TopPurchasesProductsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }
    (async () => {
      try {
        console.log('on rentre dans useTopPurchasesProducts');
        setLoading(true);
        const fetchedData = await fetchTopPurchasesProducts(filters);
        setTopProductsData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des produits achetés :", err);
        setError("Impossible de récupérer les données des produits achetés.");
      } finally {
        console.log('on sort de useTopPurchasesProducts');
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { topProductsData, loading, error };
};