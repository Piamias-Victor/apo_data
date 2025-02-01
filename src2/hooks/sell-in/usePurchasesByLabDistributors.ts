import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchPurchasesByLabDistributors, PurchasesByLabDistributorsData } from "@/libs/fetch/sell-in/purchasesByLabDistributors";

/**
 * Hook pour récupérer les données des achats par lab distributeur.
 *
 * @returns Données des achats par lab distributeur, statut de chargement et erreurs éventuelles.
 */
export const usePurchasesByLabDistributors = (skip = false) => {
  const { filters } = useFilterContext();
  const [purchasesByLabDistributorsData, setPurchasesByLabDistributorsData] = useState<PurchasesByLabDistributorsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchPurchasesByLabDistributors(filters);
        setPurchasesByLabDistributorsData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des achats par lab distributeur :", err);
        setError("Impossible de récupérer les données des achats.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { purchasesByLabDistributorsData, loading, error };
};