// src/hooks/sell-out/useNegativeMarginSales.ts

import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchNegativeMarginSales, NegativeMarginSalesData } from "@/libs/fetch/sell-out/fetchNegativeMarginSales";

/**
 * Hook pour récupérer les ventes avec marges négatives.
 *
 * @param skip - Si true, le fetch est ignoré.
 * @returns { products, loading, error }
 */
export const useNegativeMarginSales = (skip = false) => {
  const { filters } = useFilterContext();
  const [negativeMarginSalesData, setNegativeMarginSalesData] = useState<NegativeMarginSalesData | null>(null);
  const [loading, setLoading] = useState<boolean>(!skip);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await fetchNegativeMarginSales(filters);
        setNegativeMarginSalesData(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes avec marges négatives :", err);
        setError("Impossible de récupérer les données des ventes avec marges négatives.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { negativeMarginSalesData, loading, error };
};