import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchPeakSales, PeakSalesData } from "@/libs/fetch/sell-out/fetchPeakSales";

/**
 * Hook pour récupérer les données des périodes de pics de vente.
 *
 * @returns Données des périodes de pics de vente, statut de chargement et erreurs éventuelles.
 */
export const usePeakSales = (skip = false) => {
  const { filters } = useFilterContext();
  const [peakSalesData, setPeakSalesData] = useState<PeakSalesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }
    (async () => {
      try {
        console.log("on rentre du usePeakSales");
        setLoading(true);
        const fetchedData = await fetchPeakSales(filters);
        setPeakSalesData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des périodes de pics de vente :", err);
        setError("Impossible de récupérer les données des périodes de pics de vente.");
      } finally {
        console.log("on sot du usePeakSales");
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { peakSalesData, loading, error };
};