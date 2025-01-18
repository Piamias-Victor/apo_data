import { fetchStockData, StockData } from "@/libs/stockData";
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/filtersContext";

export const useStockData = () => {
  const { filters } = useFilterContext(); // Récupérer les filtres
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
    );

    console.log("Filtres appliqués pour stock-data :", cleanFilters); // DEBUG

    (async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchStockData(cleanFilters); // Passer les filtres nettoyés
        setStockData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des données de stock :", err);
        setError("Échec de la récupération des données de stock.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]); // Recharger les données si les filtres changent

  return { stockData, loading, error };
};
