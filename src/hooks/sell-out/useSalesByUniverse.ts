import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchSalesByUniverse, SalesByUniverseData } from "@/libs/fetch/sell-out/salesByUniverse";

/**
 * Hook pour récupérer les données de ventes par univers.
 *
 * @returns Données des ventes par univers, statut de chargement et erreurs éventuelles.
 */
export const useSalesByUniverse = (skip = false) => {
  const { filters } = useFilterContext();
  const [salesByUniverseData, setSalesByUniverseData] = useState<SalesByUniverseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      return;
    }
    (async () => {
      try {
        console.log('on rentre du useSalesByUniverse')
        setLoading(true);
        const fetchedData = await fetchSalesByUniverse(filters);
        setSalesByUniverseData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes par univers :", err);
        setError("Impossible de récupérer les données des ventes par univers.");
      } finally {
        console.log('on sort du useSalesByUniverse')
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { salesByUniverseData, loading, error };
};
