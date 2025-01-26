import { fetchFinancialData, FinancialData } from "@/libs/fetch/global/financialData";
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";

/**
 * Hook pour récupérer les données financières dynamiques basées sur les filtres.
 * 
 * @returns Données financières, statut de chargement et erreurs éventuelles.
 */
export const useFinancialData = () => {
  const { filters } = useFilterContext(); // Récupérer les filtres du contexte
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchFinancialData(filters); // Utilisation des filtres
        setFinancialData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des données financières :", err);
        setError("Impossible de récupérer les données financières.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]); // Recharge les données si les filtres changent

  return { financialData, loading, error };
};
