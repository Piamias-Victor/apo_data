// /hooks/useDailySales.ts

import { useEffect, useState } from "react";
import { fetchDailySales } from "@/libs/salesDaily";
import { DailySale } from "@/types/Sale";
import { useFilterContext } from "@/contexts/filtersContext"; // Assurez-vous que ce contexte est correctement configuré
import { SalesFilters } from "@/types/Filter"; // Assurez-vous que cette interface est définie

export const useDailySales = () => {
  // Lire le FilterContext pour obtenir les filtres actuels
  const { filters } = useFilterContext(); // Assurez-vous que `filters` inclut `startDate`, `endDate` et autres filtres

  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async function getDailySales() {
      try {
        setLoading(true);
        setError(null); // Réinitialiser les erreurs avant une nouvelle requête

        // Définir les dates par défaut si elles ne sont pas fournies
        const today = new Date();
        const priorDate = new Date();
        priorDate.setMonth(today.getMonth() - 1);
        const defaultStartDate = priorDate.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
        const defaultEndDate = today.toISOString().split('T')[0];

        const { dailySales: fetchedDailySales, total: fetchedTotal } =
          await fetchDailySales({
            startDate: filters?.startDate || defaultStartDate,
            endDate: filters?.endDate || defaultEndDate,
            pharmacy: filters?.pharmacy,
            universe: filters?.universe,
            category: filters?.category,
            subCategory: filters?.subCategory,
            labDistributor: filters?.labDistributor,
            brandLab: filters?.brandLab,
            rangeName: filters?.rangeName,
            // Ajoutez d'autres filtres si nécessaire
          } as SalesFilters & { startDate?: string; endDate?: string });

        setDailySales(fetchedDailySales);
        setTotal(fetchedTotal);
      } catch (err) {
        console.error("Error fetching daily sales:", err);
        setError("Échec de la récupération des ventes quotidiennes");
      } finally {
        setLoading(false);
      }
    })();

    // Relancer la requête quand les filtres changent
  }, [filters]);

  return { dailySales, total, loading, error };
};
