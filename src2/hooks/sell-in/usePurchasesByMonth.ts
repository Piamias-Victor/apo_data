import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchPurchasesByMonth, PurchasesByMonthData } from "@/libs/fetch/sell-in/fetchPurchasesByMonth";

/**
 * Hook pour récupérer les données des achats par mois.
 *
 * @param skip - Ne pas déclencher le fetch si true
 * @returns Données des achats par mois, statut de chargement et erreurs éventuelles.
 */
export const usePurchasesByMonth = (skip = false) => {
  const { filters } = useFilterContext();
  const [purchasesByMonthData, setPurchasesByMonthData] = useState<PurchasesByMonthData | null>(null);
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
        console.log("on rentre du usePurchasesByMonth");
        setLoading(true);
        const fetchedData = await fetchPurchasesByMonth(filters);
        setPurchasesByMonthData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des achats par mois :", err);
        setError("Impossible de récupérer les données des achats par mois.");
      } finally {
        console.log("on sort du usePurchasesByMonth");
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { purchasesByMonthData, loading, error };
};