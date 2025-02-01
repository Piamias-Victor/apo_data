// src/hooks/sell-out/useSalesByPharmacy.ts
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import {
  fetchSalesByPharmacy,
  SalesByPharmacyData,
} from "@/libs/fetch/sell-out/fetchSalesByPharmacy";

/**
 * Hook pour récupérer les données de ventes par pharmacie.
 *
 * @param skip - Si true, on ne fetch pas (cascade ou dépendances)
 * @returns salesByPharmacyData, loading, error
 */
export const useSalesByPharmacy = (skip = false) => {
  const { filters } = useFilterContext();
  const [salesByPharmacyData, setSalesByPharmacyData] = useState<SalesByPharmacyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }

    (async () => {
      try {
        console.log("on rentre du useSalesByPharmacy");
        setLoading(true);
        const fetchedData = await fetchSalesByPharmacy(filters);
        setSalesByPharmacyData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes par pharmacie :", err);
        setError("Impossible de récupérer les données de ventes par pharmacie.");
      } finally {
        console.log("on sort du useSalesByPharmacy");
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { salesByPharmacyData, loading, error };
};