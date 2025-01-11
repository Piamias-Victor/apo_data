// /hooks/useGroupedSales.ts
import { useEffect, useState } from "react";
import { fetchGroupedSales } from "@/libs/sales";
import { GroupedSale } from "@/types/Sale";

export const useGroupedSales = () => {
  const [groupedSales, setGroupedSales] = useState<GroupedSale[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async function getSales() {
      try {
        setLoading(true);
        const { groupedSales: fetchedGroupedSales, total: fetchedTotal } =
          await fetchGroupedSales();
        setGroupedSales(fetchedGroupedSales);
        setTotal(fetchedTotal);
      } catch (err) {
        console.error("Error fetching grouped sales:", err);
        setError("Failed to fetch grouped sales");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { groupedSales, total, loading, error };
};
