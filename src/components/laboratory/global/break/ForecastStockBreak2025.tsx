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
    <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-xl shadow-lg border border-white">
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
                          focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400 transition-all duration-300">
              
            {/* ➖ Bouton "-" */}
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 transition rounded-full p-2"
              onClick={() => setForecastPercentage((prev) => Math.max(prev - 1, -100))} // Min -100%
            >
              <FaMinus className="text-gray-600 text-xs" />
            </button>

            {/* 🔢 Icône % + Input */}
            <div className="flex items-center mx-auto">
              <input
                type="number"
                className="w-16 text-center text-gray-800 bg-transparent outline-none py-2 appearance-none no-spinner"
                placeholder="0"
                value={forecastPercentage}
                onChange={(e) => setForecastPercentage(parseFloat(e.target.value) || 0)}
              />
              <FaPercentage className="text-amber-600 text-sm mr-1" />
            </div>

            {/* ➕ Bouton "+" */}
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 transition rounded-full p-2"
              onClick={() => setForecastPercentage((prev) => Math.min(prev + 1, 100))} // Max +100%
            >
              <FaPlus className="text-gray-600 text-xs" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 📦 Contenu en une seule ligne */}
      <div className="grid grid-cols-4 gap-4">
        <DataBlock title="Produits commandés" value={forecastProductOrder} previousValue={globalProductOrder2024} />
        <DataBlock title="Produits en rupture" value={forecastBreakProduct} previousValue={globalBreakProduct2024} />
        <DataBlock title="Taux de rupture" value={forecastBreakRate} previousValue={globalBreakRate2024} isPercentage />
        <DataBlock title="Montant rupture" value={forecastBreakAmount} previousValue={globalBreakAmount2024} isCurrency />
      </div>
    </div>
  );
};

export default ForecastStockBreak2025;