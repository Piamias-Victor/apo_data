import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/filtersContext";
import { fetchSalesByLabDistributors, SalesByLabDistributorsData } from "@/libs/fetchSalesByLabDistributors";

/**
 * Hook pour récupérer les données de ventes par lab distributors.
 *
 * @returns Données des ventes par lab distributors, statut de chargement et erreurs éventuelles.
 */
export const useSalesByLabDistributors = () => {
  const { filters } = useFilterContext();
  const [salesByLabDistributorsData, setSalesByLabDistributorsData] =
    useState<SalesByLabDistributorsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchSalesByLabDistributors(filters);
        setSalesByLabDistributorsData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes par lab distributors :", err);
        setError("Impossible de récupérer les données des ventes par lab distributors.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  return { salesByLabDistributorsData, loading, error };
};
