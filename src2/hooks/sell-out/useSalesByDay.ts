import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchSalesByDay, SalesByDayData } from "@/libs/fetch/sell-out/fetchSalesByDay";

/**
 * Hook pour récupérer les données de ventes par jour.
 *
 * @param skip - Ne pas déclencher le fetch si true
 * @returns Données des ventes par jour, statut de chargement et erreurs éventuelles.
 */
export const useSalesByDay = (skip = false) => {
  const { filters } = useFilterContext();
  const [salesByDayData, setSalesByDayData] = useState<SalesByDayData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si skip = true, on ne fait rien
    if (skip) {
      setLoading(true);
      return;
    }

    // Sinon, on effectue le fetch
    (async () => {
      try {
        console.log("on rentre du useSalesByDay");
        setLoading(true);
        const fetchedData = await fetchSalesByDay(filters);
        setSalesByDayData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes par jour :", err);
        setError("Impossible de récupérer les données des ventes par jour.");
      } finally {
        console.log("on sort du useSalesByDay");
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { salesByDayData, loading, error };
};