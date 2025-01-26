import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchSalesByCategory, SalesByCategoryData } from "@/libs/fetch/sell-out/salesByCategory";

/**
 * Hook pour récupérer les données de ventes par catégorie.
 *
 * @returns Données des ventes par catégorie, statut de chargement et erreurs éventuelles.
 */
export const useSalesByCategory = (skip = false) => {
  const { filters } = useFilterContext();
  const [salesByCategoryData, setSalesByCategoryData] = useState<SalesByCategoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      return;
    }
    (async () => {
      try {
        console.log('on rentre du useSalesByCategory')
        setLoading(true);
        const fetchedData = await fetchSalesByCategory(filters);
        setSalesByCategoryData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes par catégorie :", err);
        setError("Impossible de récupérer les données des ventes par catégorie.");
      } finally {
        console.log('on sort du useSalesByCategory')
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { salesByCategoryData, loading, error };
};
