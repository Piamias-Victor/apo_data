import React, { useEffect, useState } from "react";
import { FaCrown } from "react-icons/fa";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useFilterContext } from "@/contexts/FilterContext";
import { formatLargeNumber } from "@/libs/formatUtils";

interface StockBreakData {
  pharmacy_id: string;
  pharmacy_name: string;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
  type: "current" | "comparison";
  stockBreakEvolution?: number;
}

const StockBreakSummaryCard: React.FC<{ stockBreakData: StockBreakData[]; loading: boolean; error: string | null }> = ({ stockBreakData, loading, error }) => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  const [topStockBreaks, setTopStockBreaks] = useState<StockBreakData[]>([]);

  useEffect(() => {
    if (!stockBreakData) return;

    // Trier les pharmacies par nombre de ruptures
    const sortedData = [...stockBreakData].sort((a, b) => b.stock_break_products - a.stock_break_products).slice(0, 3);
    setTopStockBreaks(sortedData);
  }, [stockBreakData]);

  const formatDate = (date: Date | null) =>
    date ? format(date, "dd/MM/yy", { locale: fr }) : "--/--/--";

  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaCrown className="text-red-500" /> Top 3 Pharmacies en Rupture
        </h2>

        <div className="flex justify-center gap-8 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white shadow-sm">
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

      {loading ? (
        <p className="text-center text-gray-800 mt-6">⏳ Chargement des données...</p>
      ) : error ? (
        <p className="text-center text-red-500 mt-6">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-6">
          {topStockBreaks.map((pharmacy) => (
            <div key={pharmacy.pharmacy_id} className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
              <h3 className="text-md font-semibold mb-4 border-b border-gray-300 pb-2 text-red-600">
                🚨 {pharmacy.pharmacy_name}
              </h3>
              <p className="text-xl font-bold">{formatLargeNumber(pharmacy.stock_break_products, false)} produits en rupture</p>
              <p className="text-sm text-gray-600 mt-2">Taux : {pharmacy.stock_break_rate.toFixed(2)}%</p>
              <p className="text-sm text-gray-600 mt-2">Montant : {formatLargeNumber(pharmacy.stock_break_amount, true)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockBreakSummaryCard;