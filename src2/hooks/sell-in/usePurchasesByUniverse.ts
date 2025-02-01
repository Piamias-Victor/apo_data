import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchPurchasesByUniverse, PurchasesByUniverseData } from "@/libs/fetch/sell-in/purchasesByUniverse";

/**
 * Hook pour récupérer les données des achats par univers.
 *
 * @returns Données des achats par univers, statut de chargement et erreurs éventuelles.
 */
export const usePurchasesByUniverse = (skip = false) => {
  const { filters } = useFilterContext();
  const [purchasesByUniverseData, setPurchasesByUniverseData] = useState<PurchasesByUniverseData | null>(null);
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
        const fetchedData = await fetchPurchasesByUniverse(filters);
        setPurchasesByUniverseData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des achats par univers :", err);
        setError("Impossible de récupérer les données des achats par univers.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { purchasesByUniverseData, loading, error };
};