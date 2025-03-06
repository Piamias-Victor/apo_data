import React from "react";
import { FaPercentage, FaPlus, FaMinus } from "react-icons/fa";
import { motion } from "framer-motion";
import DataBlock from "../DataBlock";

interface ForecastStockBreakProps {
  forecastBreakProduct: number;
  forecastBreakRate: number;
  forecastBreakAmount: number;
  forecastProductOrder: number;
  forecastPercentage: number;
  setForecastPercentage: (value: number) => void;
  globalBreakProduct2024: number;
  globalBreakRate2024: number;
  globalBreakAmount2024: number;
  globalProductOrder2024: number;
}

const ForecastStockBreak2025: React.FC<ForecastStockBreakProps> = ({
  forecastBreakProduct,
  forecastBreakRate,
  forecastBreakAmount,
  forecastProductOrder,
  forecastPercentage,
  setForecastPercentage,
  globalBreakProduct2024,
  globalBreakRate2024,
  globalBreakAmount2024,
  globalProductOrder2024,
}) => {
  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* 📊 Titre & Évolution */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🔮 Prévisions Ruptures 2025
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
            <FaPercentage className="text-red-600 text-sm" />
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-6 relative z-10">
        {/* 🔴 Produits commandés */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-red-600">
            📦 Produits Commandés
          </h3>
          <DataBlock
            title="Total"
            value={forecastProductOrder}
            previousValue={globalProductOrder2024}
          />
        </div>

        {/* 🚨 Produits en rupture */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-red-600">
            ❌ Produits en Rupture
          </h3>
          <DataBlock
            title="Total"
            value={forecastBreakProduct}
            previousValue={globalBreakProduct2024}
          />
        </div>

        {/* 📉 Taux de Rupture */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-red-600">
            📊 Taux de Rupture
          </h3>
          <DataBlock
            title="Taux %"
            value={forecastBreakRate}
            previousValue={globalBreakRate2024}
            isPercentage
          />
        </div>

        {/* 💰 Montant des Ruptures */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-red-600">
            💰 Montant Rupture (€)
          </h3>
          <DataBlock
            title="Montant"
            value={forecastBreakAmount}
            previousValue={globalBreakAmount2024}
            isCurrency
          />
        </div>
      </div>
    </div>
  );
};

export default ForecastStockBreak2025;