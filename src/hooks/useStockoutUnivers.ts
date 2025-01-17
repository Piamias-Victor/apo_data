import { useEffect, useState } from "react";
import { fetchStockoutUnivers, StockoutUnivers } from "@/libs/stockout";

/**
 * Hook personnalisé pour récupérer les taux de rupture par univers.
 * 
 * @returns Un objet contenant les données, le statut de chargement et les erreurs éventuelles.
 */
export const useStockoutUnivers = () => {
  const [stockoutUnivers, setStockoutUnivers] = useState<StockoutUnivers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async function getStockoutUnivers() {
      try {
        setLoading(true);
        const fetchedStockoutUnivers = await fetchStockoutUnivers();
        setStockoutUnivers(fetchedStockoutUnivers);
      } catch (err) {
        console.error("Erreur lors de la récupération des taux de rupture:", err);
        setError("Échec de la récupération des taux de rupture par univers.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { stockoutUnivers, loading, error };
};
