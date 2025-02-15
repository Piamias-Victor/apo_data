import React from "react";
import { motion } from "framer-motion";
import SalesDataComponent from "./sales/SalesDataComponent";
import StockBreakDataComponent from "./break/StockBreakDataComponent";
import StockDataComponent from "./stock/StockDataComponent";

const LaboratoryDashboardGlobal: React.FC = () => {
  return (
    <div className="max-w-8xl mx-auto p-8 space-y-16">
      {/* 📊 Titre principal de la section des ventes */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-4xl font-extrabold text-teal-600 tracking-wide flex items-center justify-center gap-3">
          <span className="text-yellow-500">📊</span> Suivi des Performances Commerciales
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Analyse des ventes, marges et prévisions pour une gestion optimale 📈
        </p>
      </motion.div>

      {/* 📊 Section des données de ventes */}
      <SalesDataComponent />

      {/* 🎨 Séparateur stylisé */}
      <motion.div
        className="mt-12 border-t-4 border-gradient-to-r from-teal-400 via-yellow-400 to-red-400 mx-auto w-3/4"
        initial={{ width: 0 }}
        animate={{ width: "75%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      ></motion.div>

      {/* 📦 Titre stylisé pour la section Stock */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-4xl font-extrabold text-indigo-600 tracking-wide flex items-center justify-center gap-3">
          <span className="text-green-500">📦</span> Analyse des Stocks
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Évaluation des niveaux de stock et de leur impact sur la trésorerie 📊
        </p>
      </motion.div>

      {/* 📦 Section Stock */}
      <StockDataComponent />

      {/* 🎨 Séparateur stylisé */}
      <motion.div
        className="mt-12 border-t-4 border-gradient-to-r from-indigo-400 via-blue-400 to-teal-400 mx-auto w-3/4"
        initial={{ width: 0 }}
        animate={{ width: "75%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      ></motion.div>

      {/* 📉 Titre stylisé pour la section Ruptures de Stock */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-4xl font-extrabold text-red-600 tracking-wide flex items-center justify-center gap-3">
          <span className="text-cyan-500">⚠️</span> Analyse des Ruptures de Stock
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Impact des ruptures sur les ventes et la rentabilité 🚨
        </p>
      </motion.div>

      {/* 📉 Section Rupture de Stock */}
      <StockBreakDataComponent />
    </div>
  );
};

export default LaboratoryDashboardGlobal;