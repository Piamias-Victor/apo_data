import { fetchStockData, StockData } from "@/libs/fetch/global/stockData";
import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";

export const useStockData = (skip = false)  => {
  const { filters } = useFilterContext(); // Récupérer les filtres
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log('dans le stock context :', skip)

  useEffect(() => {
    if (skip) {
      return;
    }

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
    );

    console.log("Filtres appliqués pour stock-data :", cleanFilters); // DEBUG

    (async () => {
      try {
        console.log('on rentre du useStockData')
        setLoading(true);
        const fetchedData = await fetchStockData(cleanFilters); // Passer les filtres nettoyés
        setStockData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des données de stock :", err);
        setError("Échec de la récupération des données de stock.");
      } finally {
        console.log('on sort du useStockData')
        setLoading(false);
      }
    })();
  }, [filters, skip]); // Recharger les données si les filtres changent

  return { stockData, loading, error };
};
