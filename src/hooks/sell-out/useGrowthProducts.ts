import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchGrowthProducts, GrowthProductsData } from "@/libs/fetch/sell-out/fetchGrowthProducts";

/**
 * Hook pour récupérer les données des produits en croissance.
 *
 * @returns Données des produits en croissance, statut de chargement et erreurs éventuelles.
 */
export const useGrowthProducts = () => {
  const { filters } = useFilterContext();
  const [growthProductsData, setGrowthProductsData] = useState<GrowthProductsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchGrowthProducts(filters);
        setGrowthProductsData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des produits en croissance :", err);
        setError("Impossible de récupérer les données des produits en croissance.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  return { growthProductsData, loading, error };
};