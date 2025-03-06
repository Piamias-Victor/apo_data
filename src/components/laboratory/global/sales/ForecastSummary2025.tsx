import React from "react";
import { FaShoppingCart, FaBoxOpen, FaPercentage, FaPlus, FaMinus } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { motion } from "framer-motion";
import DataBlock from "../DataBlock";

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
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* 📊 Titre & Évolution */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🔮 Prévisions Année 2025
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
            <FaPercentage className="text-teal-600 text-sm" />
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

      {/* 📈 Section de prévisions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-6 relative z-10">
        {/* 🔵 SELL-OUT */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-teal-600">
            <FaShoppingCart className="mr-2" /> Sell-Out
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <DataBlock title="Volume" value={forecastSellOut} previousValue={globalSellOut2024} />
            <DataBlock title="CA" value={forecastRevenue} previousValue={globalRevenue2024} isCurrency />
            <DataBlock title="Marge" value={forecastMargin} previousValue={globalMargin2024} isCurrency />
          </div>
        </div>

        {/* 🟠 SELL-IN */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-teal-600">
            <FaBoxOpen className="mr-2" /> Sell-In
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <DataBlock title="Volume" value={forecastSellIn} previousValue={globalSellIn2024} />
            <DataBlock title="Montant" value={forecastPurchaseAmount} previousValue={globalPurchaseAmount2024} isCurrency />
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

export default ForecastSummary2025;