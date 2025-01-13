import { useEffect, useState } from "react";
import { StockEvolutionEntry } from "@/pages/api/stockEvolution";

export const useStockEvolution = () => {
  const [stockEvolution, setStockEvolution] = useState<StockEvolutionEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockEvolution = async () => {
      try {
        const response = await fetch("/api/stockEvolution");
        if (!response.ok) throw new Error("Erreur lors de la récupération des données");

        const data = await response.json();
        setStockEvolution(data.stockEvolution);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchStockEvolution();
  }, []);

  return { stockEvolution, loading, error };
};
