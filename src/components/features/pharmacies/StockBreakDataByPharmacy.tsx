import Loader from "@/components/common/feedback/Loader";
import { useState, useEffect } from "react";
import StockBreakSummaryCard from "./StockBreakSummaryCard";
import StockBreakTable from "./StockBreakTable";
import { useFilterContext } from "@/contexts/FilterContext";

interface StockBreakData {
  pharmacy_id: string;
  pharmacy_name: string;
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
  type: "current" | "comparison";
}

interface StockBreakDataWithEvolution extends StockBreakData {
  evolution: {
    stock_break_products: number;
    stock_break_rate: number;
    stock_break_amount: number;
  };
}

const StockBreakDataByPharmacy: React.FC = () => {
  const { filters } = useFilterContext();
  
  const hasSelectedData =
    filters.distributors.length > 0 ||
    filters.brands.length > 0 ||
    filters.universes.length > 0 ||
    filters.categories.length > 0 ||
    filters.families.length > 0 ||
    filters.specificities.length > 0 ||
    filters.pharmacies.length > 0 ||
    filters.ean13Products.length > 0;

  const [stockBreakData, setStockBreakData] = useState<StockBreakDataWithEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSelectedData) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/stock/getStockBreakByPharmacy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        const data = result.stockBreakData || [];

        // 🔹 Regroupement des données par pharmacie
        const groupedData: Record<string, { current?: StockBreakData; comparison?: StockBreakData }> = {};

        data.forEach((entry: StockBreakData) => {
          if (!groupedData[entry.pharmacy_id]) {
            groupedData[entry.pharmacy_id] = {};
          }
          groupedData[entry.pharmacy_id][entry.type] = entry;
        });

        // 🔹 Calcul de l'évolution
        const stockBreakWithEvolution: StockBreakDataWithEvolution[] = Object.entries(groupedData).map(
          ([pharmacy_id, { current, comparison }]) => {
            const evolution = {
              stock_break_products: calculateEvolution(comparison?.stock_break_products, current?.stock_break_products),
              stock_break_rate: calculateEvolution(comparison?.stock_break_rate, current?.stock_break_rate),
              stock_break_amount: calculateEvolution(comparison?.stock_break_amount, current?.stock_break_amount),
            };

            return {
              pharmacy_id,
              pharmacy_name: current?.pharmacy_name || comparison?.pharmacy_name || "Pharmacie Inconnue",
              total_products_ordered: current?.total_products_ordered ?? 0,
              stock_break_products: current?.stock_break_products ?? 0,
              stock_break_rate: current?.stock_break_rate ?? 0,
              stock_break_amount: current?.stock_break_amount ?? 0,
              type: "current",
              evolution,
            };
          }
        );

        setStockBreakData(stockBreakWithEvolution);
      } catch (err) {
        setError("Impossible de récupérer les données");
        console.error("❌ Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, hasSelectedData]);

  // 📌 Fonction pour calculer l'évolution en pourcentage
  const calculateEvolution = (oldValue?: number, newValue?: number): number => {
    if (!oldValue || oldValue === 0) return newValue ? 100 : 0;
    if (!newValue) return -100;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  if (!hasSelectedData) return <p className="text-center">Sélectionnez un filtre.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!stockBreakData || stockBreakData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      {/* 🏆 Affichage des pharmacies les plus impactées */}
      <StockBreakSummaryCard stockBreakData={stockBreakData} loading={loading} error={error} />

      {/* 📊 Tableau détaillé des ruptures par pharmacie */}
      <StockBreakTable stockBreakData={stockBreakData} loading={loading} error={error} />
    </div>
  );
};

export default StockBreakDataByPharmacy;