import { fetchFinancialData } from "@/libs/financialData";
import { useEffect, useState } from "react";

interface FinancialData {
  totalRevenue: number;
  totalPurchase: number;
}

/**
 * Hook pour récupérer les données financières.
 * 
 * @returns Un objet contenant les données financières, le statut de chargement et les erreurs éventuelles.
 */
export const useFinancialData = () => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async function getFinancialData() {
      try {
        setLoading(true);
        const fetchedData = await fetchFinancialData();
        setFinancialData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des données financières :", err);
        setError("Échec de la récupération des données financières.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { financialData, loading, error };
};
