import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/filtersContext";
import { fetchTopProducts, TopProductsData } from "@/libs/fetchTopProducts";

/**
 * Hook pour récupérer les données des top 5 produits.
 *
 * @returns Données des top 5 produits, statut de chargement et erreurs éventuelles.
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
        console.error("Erreur lors de la récupération des top 5 produits :", err);
        setError("Impossible de récupérer les données des top 5 produits.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  return { topProductsData, loading, error };
};
