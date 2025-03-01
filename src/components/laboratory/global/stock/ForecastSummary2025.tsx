import React from "react";
import { FaBoxOpen, FaChartPie, FaPercentage, FaPlus, FaMinus } from "react-icons/fa";
import { motion } from "framer-motion";
import DataBlock from "../DataBlock";

interface ForecastSummaryProps {
  forecastAvgStock: number;
  forecastStockValue: number;
  forecastMonthsOfStock: number;
  forecastStockValuePercentage: number;
  forecastPercentage: number;
  setForecastPercentage: (value: number) => void;
  globalAvgStock2024: number;
  globalStockValue2024: number;
  globalMonthsOfStock2024: number;
  globalStockValuePercentage2024: number;
}

const ForecastSummary2025: React.FC<ForecastSummaryProps> = ({
  forecastAvgStock,
  forecastStockValue,
  forecastMonthsOfStock,
  forecastStockValuePercentage,
  forecastPercentage,
  setForecastPercentage,
  globalAvgStock2024,
  globalStockValue2024,
  globalMonthsOfStock2024,
  globalStockValuePercentage2024,
}) => {
  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* 📊 Titre & Évolution */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🔮 Prévisions Stock 2025
        </h2>

        {/* 🔹 Input du pourcentage de prévision */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative flex items-center bg-gray-100 rounded-lg px-4 py-2 shadow-md border border-gray-300"
        >
          {/* ➖ Bouton de diminution */}
          <button
            className="bg-gray-200 hover:bg-gray-300 transition rounded-full p-2"
            onClick={() => setForecastPercentage(prev => Math.max(prev - 1, -100))}
          >
            <FaMinus className="text-gray-600 text-xs" />
          </button>

          {/* 📊 Input */}
          <div className="flex items-center mx-3">
            <input
              type="number"
              className="w-14 text-center text-gray-800 bg-transparent outline-none appearance-none no-spinner font-bold"
              placeholder="0"
              value={forecastPercentage}
              onChange={(e) => setForecastPercentage(parseFloat(e.target.value) || 0)}
            />
            <FaPercentage className="text-indigo-600 text-sm" />
          </div>

          {/* ➕ Bouton d'augmentation */}
          <button
            className="bg-gray-200 hover:bg-gray-300 transition rounded-full p-2"
            onClick={() => setForecastPercentage(prev => Math.min(prev + 1, 100))}
          >
            <FaPlus className="text-gray-600 text-xs" />
          </button>
        </motion.div>
      </div>

      {/* 📦 Section des prévisions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-6 relative z-10">
        {/* 🔵 STOCK TOTAL */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-indigo-600">
            <FaBoxOpen className="mr-2" /> Stock Total
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <DataBlock
              title="Stock Moyen"
              value={forecastAvgStock}
              previousValue={globalAvgStock2024}
            />
            <DataBlock
              title="Valeur du Stock"
              value={forecastStockValue}
              previousValue={globalStockValue2024}
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
              value={forecastMonthsOfStock}
              previousValue={globalMonthsOfStock2024}
              isDecimal
            />
            <DataBlock
              title="% Valeur / CA"
              value={forecastStockValuePercentage}
              previousValue={globalStockValuePercentage2024}
              isPercentage
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastSummary2025;