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
  const formattedStartDate = dateRange[0] ? format(dateRange[0], "dd/MM/yy", { locale: fr }) : "--/--/--";
  const formattedEndDate = dateRange[1] ? format(dateRange[1], "dd/MM/yy", { locale: fr }) : "--/--/--";

  const formattedComparisonStartDate = comparisonDateRange[0]
    ? format(comparisonDateRange[0], "dd/MM/yy", { locale: fr })
    : "--/--/--";
  const formattedComparisonEndDate = comparisonDateRange[1]
    ? format(comparisonDateRange[1], "dd/MM/yy", { locale: fr })
    : "--/--/--";

  return (
    <div className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Stock Périodique</h2>

        {/* 🔹 Bloc des périodes */}
        <div className="flex text-right px-3 py-2 rounded-lg bg-white bg-opacity-20 gap-8">
          {/* 🔵 Période principale */}
          <div className="flex flex-col gap-1 text-left">
            <p className="text-xs uppercase text-gray-200 font-semibold tracking-wide">Période</p>
            <p className="text-sm font-medium">{formattedStartDate} → {formattedEndDate}</p>
          </div>
          {/* 🔸 Période de comparaison */}
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase text-gray-200 font-semibold tracking-wide">Comparaison</p>
            <p className="text-sm font-medium">{formattedComparisonStartDate} → {formattedComparisonEndDate}</p>
          </div>
        </div>
      </div>

      {/* 🟢 Affichage du statut de chargement / erreur */}
      {loading ? (
        <p className="text-center text-white">⏳ Chargement des données...</p>
      ) : error ? (
        <p className="text-center text-red-300">{error}</p>
      ) : (
        <div className="grid grid-cols-2 gap-8">
          {/* 🔵 STOCK TOTAL */}
          <div className="border-r border-white pr-6">
            <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
              <FaBoxOpen className="mr-2" /> Stock Total
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
          <div className="pl-6">
            <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
              <FaChartPie className="mr-2" /> Détails Stock
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DataBlock
                title="Nombre de Mois de Stock"
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