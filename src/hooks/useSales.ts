import { fetchSales } from "@/libs/sales";
import { Sale } from "@/types/Sale";
import { useState, useEffect } from "react";

export const useSales = (
  page: number = 1,
  limit: number = 100,
  sort_by: string = "stock", // Valeur par défaut pour le tri
  order: string = "desc" // Valeur par défaut pour l'ordre
) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getSales() {
      try {
        setLoading(true);
        const { sales: fetchedSales, total: fetchedTotal } = await fetchSales(page, limit, sort_by, order);
        setSales(fetchedSales);
        setTotal(fetchedTotal);
      } catch (err) {
        console.error("Error fetching sales:", err);
        setError("Failed to fetch sales");
      } finally {
        setLoading(false);
      }
    }
    getSales();
  }, [page, limit, sort_by, order]);

  return { sales, total, loading, error };
};
