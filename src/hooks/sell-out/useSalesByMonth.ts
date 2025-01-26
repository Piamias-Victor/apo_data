import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchSalesByMonth, SalesByMonthData } from "@/libs/fetch/sell-out/salesByMonth";

/**
 * Hook pour récupérer les données de ventes par mois.
 *
 * @param skip - Ne pas déclencher le fetch si true
 * @returns Données des ventes par mois, statut de chargement et erreurs éventuelles.
 */
export const useSalesByMonth = (skip = false) => {
  const { filters } = useFilterContext();
  const [salesByMonthData, setSalesByMonthData] = useState<SalesByMonthData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si skip = true, on ne fait rien
    if (skip) {
      return;
    }

    // Sinon, on effectue le fetch
    (async () => {
      try {
        console.log("on rentre du useSalesByMonth");
        setLoading(true);
        const fetchedData = await fetchSalesByMonth(filters);
        setSalesByMonthData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes par mois :", err);
        setError("Impossible de récupérer les données des ventes par mois.");
      } finally {
        console.log("on sort du useSalesByMonth");
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { salesByMonthData, loading, error };
};