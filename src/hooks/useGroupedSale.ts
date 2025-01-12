// /hooks/useGroupedSales.ts
import { useEffect, useState } from "react";
import { fetchGroupedSales } from "@/libs/sales";
import { GroupedSale } from "@/types/Sale";
import { useFilterContext } from "@/contexts/filtersContext";

export const useGroupedSales = () => {
  // Lire le FilterContext pour obtenir les filtres actuels
  const { filters } = useFilterContext();

  const [groupedSales, setGroupedSales] = useState<GroupedSale[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async function getSales() {
      try {
        setLoading(true);
        setError(null); // Réinitialiser les erreurs avant une nouvelle requête

        const { groupedSales: fetchedGroupedSales, total: fetchedTotal } =
          await fetchGroupedSales(filters);
      
        setGroupedSales(fetchedGroupedSales);
        setTotal(fetchedTotal);
      } catch (err) {
        console.error("Error fetching grouped sales:", err);
        setError("Échec de la récupération des ventes groupées");
      } finally {
        setLoading(false);
      }
    })();
    
    // On relance la requête quand **n'importe quel filtre** change
  }, [filters]);

  return { groupedSales, total, loading, error };
};
