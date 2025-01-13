// /hooks/useGroupedSalesByPharmacy.ts

import { useEffect, useState } from "react";
import { fetchGroupedSalesByPharmacy } from "@/libs/salesByPharmacy";
import { GroupedSaleByPharmacy } from "@/types/Sale";
import { useFilterContext } from "@/contexts/filtersContext";

export const useGroupedSalesByPharmacy = () => {
  // Lire le FilterContext pour obtenir les filtres actuels
  const { filters } = useFilterContext();

  const [groupedSales, setGroupedSales] = useState<GroupedSaleByPharmacy[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async function getSalesByPharmacy() {
      try {
        setLoading(true);
        setError(null); // Réinitialiser les erreurs avant une nouvelle requête

        const { groupedSales: fetchedGroupedSales, total: fetchedTotal } =
          await fetchGroupedSalesByPharmacy(filters);
      
        setGroupedSales(fetchedGroupedSales);
        setTotal(fetchedTotal);
      } catch (err) {
        console.error("Error fetching grouped sales by pharmacy:", err);
        setError("Échec de la récupération des ventes par pharmacie");
      } finally {
        setLoading(false);
      }
    })();
    
    // On relance la requête quand **n'importe quel filtre** change
  }, [filters]);

  return { groupedSales, total, loading, error };
};
