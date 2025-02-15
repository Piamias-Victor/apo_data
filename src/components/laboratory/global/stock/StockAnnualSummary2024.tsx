import React from "react";
import { FaBoxOpen, FaChartPie } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface StockAnnualSummaryProps {
  globalAvgStock2024: number;
  globalStockValue2024: number;
  globalMonthsOfStock2024: number;
  globalStockValuePercentage2024: number;
}

const StockAnnualSummary2024: React.FC<StockAnnualSummaryProps> = ({
  globalAvgStock2024,
  globalStockValue2024,
  globalMonthsOfStock2024,
  globalStockValuePercentage2024,
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Stock Annuel (2024)</h2>
        <p className="text-sm opacity-80">Du 1er Janvier au 31 Décembre 2024</p>
      </div>

      {/* 🟢 Contenu avec une grille de 2 colonnes */}
      <div className="grid grid-cols-2 gap-8">
        
        {/* 🔵 STOCK TOTAL */}
        <div className="border-r border-white pr-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaBoxOpen className="mr-2" /> Stock Total
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DataBlock title="Stock Moyen" value={globalAvgStock2024} />
            <DataBlock title="Valeur du Stock" value={globalStockValue2024} isCurrency />
          </div>
        </div>

        {/* 🟠 DÉTAILS STOCK */}
        <div className="pl-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaChartPie className="mr-2" /> Détails Stock
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DataBlock title="Nombre de Mois de Stock" value={globalMonthsOfStock2024} isDecimal />
            <DataBlock title="% Valeur / CA" value={globalStockValuePercentage2024} isPercentage />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DataBlockProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  isDecimal?: boolean;
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, isCurrency = false, isPercentage = false, isDecimal = false }) => {
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
    </div>
  );
};

export default StockAnnualSummary2024;