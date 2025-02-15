import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/FilterContext";
import Loader from "./ui/Loader";

interface StockData {
  totalStockQuantity: number;
  totalStockValue: number;
  totalSalesQuantity: number;
  totalSalesRevenue: number;
  stockMonthsQuantity: number | null;
  stockMonthsValue: number | null;
  stockValuePercentage: number | null;
  stockQuantityEvolution: number | null;
  stockValueEvolution: number | null;
  stockMonthsQuantityEvolution: number | null;
  stockMonthsValueEvolution: number | null;
}

const SalesDataRaw: React.FC = () => {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilterContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const response = await fetch("/api/stock/getStockByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });
    
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
    
        const result = await response.json();
    
        console.log("🟢 Réponse API :", result); // ✅ Ajout du log
        setData(result.stockSalesData); // ✅ Correction ici (changer stockData → stockSalesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  console.log("Données reçues :", data);

  if (loading) return <Loader message="Chargement des données JSON..." />;
  if (error) return <p className="text-red-600 text-center">Erreur : {error}</p>;
  if (!data) return <p className="text-gray-600 text-center">Aucune donnée disponible.</p>;

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-lg font-semibold text-teal-600 mb-2">Réponse JSON :</h2>
      <div className="bg-white p-3 rounded-md shadow text-sm overflow-x-auto max-h-80 border border-gray-200">
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SalesDataRaw;