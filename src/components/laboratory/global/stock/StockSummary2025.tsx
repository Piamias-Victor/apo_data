import React, { useEffect, useState } from "react";
import { FaBoxOpen, FaChartPie } from "react-icons/fa";
import DataBlock from "../DataBlock";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Interface des données récupérées
interface StockSalesData {
  total_avg_stock: number;
  total_stock_value: number;
  total_quantity: number;
  total_revenue: number;
  type: "current" | "comparison";
}

const StockSummary2025: React.FC = () => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // 🟢 Stocker les données API
  const [stockData, setStockData] = useState<StockSalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Appel API pour récupérer les données de stock et de ventes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/stock/getStock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        setStockData(result.stockSalesData || []);
      } catch (err) {
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]); // ⏳ Rafraîchissement à chaque changement de filtre

  // 🔵 Extraire les données des périodes
  const currentPeriod = stockData.find((data) => data.type === "current");
  const comparisonPeriod = stockData.find((data) => data.type === "comparison");

  // 📌 Calcul du nombre de mois de stock
  const monthsOfStock =
    currentPeriod?.total_avg_stock && currentPeriod?.total_quantity
      ? currentPeriod.total_avg_stock / currentPeriod.total_quantity
      : 0;

  const adjustedMonthsOfStock2024 =
    comparisonPeriod?.total_avg_stock && comparisonPeriod?.total_quantity
      ? comparisonPeriod.total_avg_stock / comparisonPeriod.total_quantity
      : 0;

  // 📌 Calcul du pourcentage de valeur du stock par rapport au CA
  const stockValuePercentage =
    currentPeriod?.total_revenue && currentPeriod?.total_stock_value
      ? (currentPeriod.total_stock_value / currentPeriod.total_revenue) * 100
      : 0;

  const adjustedStockValuePercentage2024 =
    comparisonPeriod?.total_revenue && comparisonPeriod?.total_stock_value
      ? (comparisonPeriod.total_stock_value / comparisonPeriod.total_revenue) * 100
      : 0;

  // 🔹 Formatage des dates
  const formatDate = (date: Date | null) =>
    date ? format(date, "dd/MM/yy", { locale: fr }) : "--/--/--";

  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* 📊 Titre & Dates */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📊 Stock Périodique
        </h2>

        {/* 🔹 Bloc des périodes */}
        <div className="flex justify-center md:justify-start gap-8 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-white shadow-sm relative z-10">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase">Période</span>
            <span className="text-sm font-medium">{formatDate(dateRange[0])} → {formatDate(dateRange[1])}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase">Comparaison</span>
            <span className="text-sm font-medium">{formatDate(comparisonDateRange[0])} → {formatDate(comparisonDateRange[1])}</span>
          </div>
        </div>
      </div>

      {/* 🟢 Affichage du statut de chargement / erreur */}
      {loading ? (
        <p className="text-center text-gray-800 mt-6">⏳ Chargement des données...</p>
      ) : error ? (
        <p className="text-center text-red-500 mt-6">{error}</p>
      ) : (
        <div className="grid grid-cols-2 gap-10 mt-6 relative z-10">
          {/* 🔵 STOCK TOTAL */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-indigo-600">
              <FaBoxOpen className="mr-2" /> Stock Total
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <DataBlock
                title="Stock Moyen"
                value={currentPeriod?.total_avg_stock || 0}
                previousValue={comparisonPeriod?.total_avg_stock || 0}
              />
              <DataBlock
                title="Valeur du Stock"
                value={currentPeriod?.total_stock_value || 0}
                previousValue={comparisonPeriod?.total_stock_value || 0}
                isCurrency
              />
            </div>
          </div>

          {/* 🟠 DÉTAILS STOCK */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-indigo-600">
              <FaChartPie className="mr-2" /> Détails Stock
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <DataBlock
                title="Mois de Stock"
                value={monthsOfStock}
                previousValue={adjustedMonthsOfStock2024}
                isDecimal
              />
              <DataBlock
                title="% Valeur / CA"
                value={stockValuePercentage}
                previousValue={adjustedStockValuePercentage2024}
                isPercentage
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSummary2025;