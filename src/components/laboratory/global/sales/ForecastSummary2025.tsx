import React from "react";
import { FaShoppingCart, FaBoxOpen, FaPercentage, FaPlus, FaMinus } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { motion } from "framer-motion";

interface ForecastSummaryProps {
  forecastSellOut: number;
  forecastRevenue: number;
  forecastMargin: number;
  forecastSellIn: number;
  forecastPurchaseAmount: number;
  forecastPercentage: number;
  setForecastPercentage: (value: number) => void;
  globalSellOut2024: number;
  globalRevenue2024: number;
  globalMargin2024: number;
  globalSellIn2024: number;
  globalPurchaseAmount2024: number;
}

const ForecastSummary2025: React.FC<ForecastSummaryProps> = ({
  forecastSellOut,
  forecastRevenue,
  forecastMargin,
  forecastSellIn,
  forecastPurchaseAmount,
  forecastPercentage,
  setForecastPercentage,
  globalSellOut2024,
  globalRevenue2024,
  globalMargin2024,
  globalSellIn2024,
  globalPurchaseAmount2024,
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white rounded-xl shadow-lg border border-white">
      {/* 🔮 Titre + Input aligné à droite */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">🔮 Prévisions Année 2025</h2>
        
        {/* 📉 Input pour le pourcentage d'évolution */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-44"
        >
          <div className="relative flex items-center border border-gray-300 rounded-md shadow-md bg-white 
                          focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400 transition-all duration-300">
              
            {/* Bouton "-" */}
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 transition rounded-full p-2"
              onClick={() => setForecastPercentage(prev => Math.max(prev - 1, -100))} // Min -100%
            >
              <FaMinus className="text-gray-600 text-xs" />
            </button>

            {/* Icône % + Input */}
            <div className="flex items-center mx-auto">
              <input
                type="number"
                className="w-16 text-center text-gray-800 bg-transparent outline-none py-2 appearance-none no-spinner"
                placeholder="0"
                value={forecastPercentage}
                onChange={(e) => setForecastPercentage(parseFloat(e.target.value) || 0)}
              />
              <FaPercentage className="text-cyan-600 text-sm mr-1" />
            </div>

            {/* Bouton "+" */}
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 transition rounded-full p-2"
              onClick={() => setForecastPercentage(prev => Math.min(prev + 1, 100))} // Max +100%
            >
              <FaPlus className="text-gray-600 text-xs" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 🟢 Contenu avec deux colonnes */}
      <div className="grid grid-cols-2 gap-8">
        {/* 🔵 SELL-OUT */}
        <div className="border-r border-white pr-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaShoppingCart className="mr-2" /> Sell-Out
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <DataBlock
              title="Volume"
              value={forecastSellOut}
              previousValue={globalSellOut2024}
              isCurrency={false}
            />
            <DataBlock
              title="CA"
              value={forecastRevenue}
              previousValue={globalRevenue2024}
              isCurrency
            />
            <DataBlock
              title="Marge"
              value={forecastMargin}
              previousValue={globalMargin2024}
              isCurrency
            />
          </div>
        </div>

        {/* 🟠 SELL-IN */}
        <div className="pl-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaBoxOpen className="mr-2" /> Sell-In
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DataBlock
              title="Volume"
              value={forecastSellIn}
              previousValue={globalSellIn2024}
              isCurrency={false}
            />
            <DataBlock
              title="Montant"
              value={forecastPurchaseAmount}
              previousValue={globalPurchaseAmount2024}
              isCurrency
            />
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
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, previousValue, isCurrency = false }) => {
  const percentageChange =
    previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : NaN;

  return (
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(value, isCurrency)}</p>
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

export default ForecastSummary2025;