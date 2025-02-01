// useFinancialData.ts
import { fetchFinancialData, FinancialData } from "@/libs/fetch/global/financialData";
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";

/**
 * Hook pour récupérer les données financières dynamiques basées sur les filtres.
 */
export const useFinancialData = () => {
  const { filters } = useFilterContext(); 
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1) Dès que les filtres changent, on repasse loading à true
    setLoading(true);
    setError(null);         // (optionnel) on peut reset l'erreur 
    setFinancialData(null); // (optionnel) on peut vider l'ancienne data le temps du fetch

    // 2) On effectue le fetch dans la foulée
    (async () => {
      try {
        console.log("on rentre du useFinancialData");
        const fetchedData = await fetchFinancialData(filters);
        setFinancialData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des données financières :", err);
        setError("Impossible de récupérer les données financières.");
      } finally {
        console.log("on sort du useFinancialData");
        setLoading(false);
      }
    })();

    // IMPORTANT : on inclut [filters] dans les dépendances
  }, [filters]);

  return { financialData, loading, error };
};