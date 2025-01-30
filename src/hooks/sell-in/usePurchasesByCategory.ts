import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchPurchasesByCategory, PurchasesByCategoryData } from "@/libs/fetch/sell-in/fetchPurchasesByCategory";

/**
 * Hook pour récupérer les données des achats par catégorie.
 *
 * @returns Données des achats par catégorie, statut de chargement et erreurs éventuelles.
 */
export const usePurchasesByCategory = (skip = false) => {
  const { filters } = useFilterContext();
  const [purchasesByCategoryData, setPurchasesByCategoryData] = useState<PurchasesByCategoryData | null>(null);
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
        const fetchedData = await fetchPurchasesByCategory(filters);
        setPurchasesByCategoryData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des achats par catégorie :", err);
        setError("Impossible de récupérer les données des achats par catégorie.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { purchasesByCategoryData, loading, error };
};