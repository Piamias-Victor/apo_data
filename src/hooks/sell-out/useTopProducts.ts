import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchTopProducts, TopProductsData } from "@/libs/fetch/sell-out/fetchTopProducts";

/**
 * Hook pour récupérer les données des top 10 et flop 10 produits.
 *
 * @returns Données des produits, statut de chargement et erreurs éventuelles.
 */
export const useTopProducts = () => {
  const { filters } = useFilterContext();
  const [topProductsData, setTopProductsData] = useState<TopProductsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchTopProducts(filters);
        setTopProductsData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err);
        setError("Impossible de récupérer les données des produits.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  return { topProductsData, loading, error };
};