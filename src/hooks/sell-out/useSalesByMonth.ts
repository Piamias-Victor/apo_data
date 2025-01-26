import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchSalesByMonth, SalesByMonthData } from "@/libs/fetch/sell-out/salesByMonth";

/**
 * Hook pour récupérer les données de ventes par mois.
 *
 * @returns Données des ventes par mois, statut de chargement et erreurs éventuelles.
 */
export const useSalesByMonth = () => {
  const { filters } = useFilterContext();
  const [salesByMonthData, setSalesByMonthData] = useState<SalesByMonthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchSalesByMonth(filters);
        setSalesByMonthData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes par mois :", err);
        setError("Impossible de récupérer les données des ventes par mois.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  return { salesByMonthData, loading, error };
};
