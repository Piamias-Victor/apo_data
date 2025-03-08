import React from "react";
import { motion } from "framer-motion";
import SalesDataComponent from "./sales/SalesDataComponent";
import MetricsDataComponent from "./metrics/MetricsDataComponent";
import StockBreakDataComponent from "./break/StockBreakDataComponent";
import StockDataComponent from "./stock/StockDataComponent";
import SalesPharmaciesComponent from "./pharmacies/SalesPharmaciesComponent";

// Animation réutilisable pour les titres
const titleAnimation = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

// Animation réutilisable pour les séparateurs
const separatorAnimation = {
  initial: { width: 0 },
  animate: { width: "75%" },
  transition: { duration: 0.8, ease: "easeOut" }
};

// Composant pour les titres de section
const SectionTitle = ({ emoji, title, description, color }) => (
  <motion.div
    {...titleAnimation}
    className="text-center"
  >
    <h2 className={`text-4xl font-extrabold ${color} tracking-wide flex items-center justify-center gap-3`}>
      <span className="text-yellow-500">{emoji}</span> {title}
    </h2>
    <p className="text-gray-600 mt-2 text-lg">
      {description}
    </p>
  </motion.div>
);

// Composant pour les séparateurs
const Separator = ({ from, via, to }) => (
  <motion.div
    className={`mt-12 border-t-4 border-gradient-to-r from-${from} via-${via} to-${to} mx-auto w-3/4`}
    {...separatorAnimation}
  ></motion.div>
);

const LaboratoryDashboardGlobal: React.FC = () => {
  return (
    <div className="max-w-8xl mx-auto p-8 space-y-16">
      {/* Section des ventes */}
      <SectionTitle 
        emoji="📊" 
        title="Suivi des Performances Commerciales" 
        description="Analyse des ventes, marges et prévisions pour une gestion optimale 📈"
        color="text-teal-600"
      />
      <SalesDataComponent />

      <Separator from="indigo-400" via="blue-400" to="teal-400" />

      {/* Section des ruptures de stock */}
      <SectionTitle 
        emoji="⚠️" 
        title="Analyse des Ruptures de Stock" 
        description="Impact des ruptures sur les ventes et la rentabilité 🚨"
        color="text-red-600"
      />
      <StockBreakDataComponent />

      <Separator from="teal-400" via="yellow-400" to="red-400" />

      {/* Section des stocks */}
      <SectionTitle 
        emoji="📦" 
        title="Analyse des Stocks" 
        description="Évaluation des niveaux de stock et de leur impact sur la trésorerie 📊"
        color="text-indigo-600"
      />
      <p className="text-sm text-gray-600 italic text-center">
        📢 Attention : Les données de stock ne sont pas disponibles avant 2025 pour les pharmacies LGPI.
      </p>
      <StockDataComponent />

      <Separator from="indigo-400" via="blue-400" to="teal-400" />

      {/* Section des indicateurs clés */}
      <SectionTitle 
        emoji="📈" 
        title="Indicateurs Clés de Performance" 
        description="Analyse des prix moyens, marges et références vendues 💡"
        color="text-purple-600"
      />
      <MetricsDataComponent />

      <Separator from="indigo-400" via="blue-400" to="teal-400" />

      {/* Section des performances des pharmacies */}
      <SectionTitle 
        emoji="🏥" 
        title="Performances des Pharmacies" 
        description="Analyse des ventes et marges des pharmacies partenaires 💊"
        color="text-pink-600"
      />
      <SalesPharmaciesComponent />
    </div>
  );
};

export default LaboratoryDashboardGlobal;