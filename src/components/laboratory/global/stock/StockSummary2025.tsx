import React from "react";
import { FaBoxOpen, FaChartPie } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface StockSummaryProps {
  totalAvgStock: number;
  totalStockValue: number;
  monthsOfStock: number;
  stockValuePercentage: number;
  adjustedAvgStock2024: number;
  adjustedStockValue2024: number;
  adjustedMonthsOfStock2024: number;
  adjustedStockValuePercentage2024: number;
}

const StockSummary2025: React.FC<StockSummaryProps> = ({
  totalAvgStock,
  totalStockValue,
  monthsOfStock,
  stockValuePercentage,
  adjustedAvgStock2024,
  adjustedStockValue2024,
  adjustedMonthsOfStock2024,
  adjustedStockValuePercentage2024,
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Stock Annuel (2025)</h2>
        <p className="text-sm opacity-80">Du 1er Janvier à aujourd'hui</p>
      </div>

      {/* 🟢 Contenu avec une grille de 2 colonnes */}
      <div className="grid grid-cols-2 gap-8">
        
        {/* 🔵 STOCK TOTAL */}
        <div className="border-r border-white pr-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaBoxOpen className="mr-2" /> Stock Total
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DataBlock title="Stock Moyen" value={totalAvgStock} previousValue={adjustedAvgStock2024} />
            <DataBlock title="Valeur du Stock" value={totalStockValue} previousValue={adjustedStockValue2024} isCurrency />
          </div>
        </div>

        {/* 🟠 DÉTAILS STOCK */}
        <div className="pl-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaChartPie className="mr-2" /> Détails Stock
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DataBlock title="Nombre de Mois de Stock" value={monthsOfStock} previousValue={adjustedMonthsOfStock2024} isDecimal />
            <DataBlock title="% Valeur / CA" value={stockValuePercentage} previousValue={adjustedStockValuePercentage2024} isPercentage />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DataBlockProps {
  title: string;
  value: number;
  previousValue: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  isDecimal?: boolean;
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, previousValue, isCurrency = false, isPercentage = false, isDecimal = false }) => {
  const percentageChange = previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : NaN;

  return (
    <div className="text-center">
      <p className="text-xl font-bold">
        {isPercentage
          ? `${value.toFixed(2)}%`
          : isDecimal
          ? value.toFixed(1)
          : formatLargeNumber(value, isCurrency)}
      </p>
      <p className="text-sm opacity-80">{title}</p>
      <div className="flex items-center justify-center mt-2">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
            percentageChange > 0
              ? "bg-green-400 text-white"
              : percentageChange < 0
              ? "bg-red-400 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          {!isNaN(percentageChange) ? `${percentageChange.toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>
  );
};

export default StockSummary2025;