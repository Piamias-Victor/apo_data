import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchLowSalesProducts, LowSalesProductsData } from "@/libs/fetch/sell-out/fetchLowSalesProducts";

/**
 * Hook pour récupérer les données des produits à faibles ventes.
 *
 * @param maxSalesThreshold - Nombre maximal de ventes pour filtrer les produits.
 * @returns Données des produits à faibles ventes, statut de chargement et erreurs éventuelles.
 */
export const useLowSalesProducts = (maxSalesThreshold: number = 1, skip = false) => {
  const { filters } = useFilterContext();
  const [lowSalesProductsData, setLowSalesProductsData] = useState<LowSalesProductsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }
    (async () => {
      try {
        console.log("on rentre du useLowSalesProducts");
        setLoading(true);
        const fetchedData = await fetchLowSalesProducts(filters, maxSalesThreshold);
        setLowSalesProductsData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des produits à faibles ventes :", err);
        setError("Impossible de récupérer les données des produits à faibles ventes.");
      } finally {
        console.log("on sort du useLowSalesProducts");
        setLoading(false);
      }
    })();
  }, [filters, maxSalesThreshold,skip]); // Re-fetch si maxSalesThreshold change

  return { lowSalesProductsData, loading, error };
};