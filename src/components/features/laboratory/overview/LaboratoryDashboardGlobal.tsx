import React from "react";
import { motion } from "framer-motion";
import MetricsDataComponent from "../../metrics/MetricsDataComponent";
import SalesPharmaciesComponent from "../../pharmacies/SalesPharmaciesComponent";
import SalesDataComponent from "../../sales/SalesDataComponent";
import StockBreakDataComponent from "../../stock-break/StockBreakDataComponent";
import StockDataComponent from "../../stock/StockDataComponent";

// Variantes d'animation pour les conteneurs
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Variantes d'animation pour les éléments individuels
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15
    }
  }
};

// Composant pour les titres de section avec animation
const SectionTitle = ({ emoji, title, description, color, emojiColor = "text-yellow-400" }) => (
  <motion.div
    variants={itemVariants}
    className="text-center mb-8"
  >
    <h2 className={`text-3xl md:text-4xl font-extrabold ${color} tracking-wide flex items-center justify-center gap-3`}>
      <motion.span 
        className={emojiColor}
        animate={{ 
          rotate: [0, -5, 5, -3, 3, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2, 
          ease: "easeInOut", 
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          repeat: Infinity,
          repeatDelay: 5
        }}
      >
        {emoji}
      </motion.span>
      {title}
    </h2>
    <p className="text-gray-600 mt-2 text-lg">
      {description}
    </p>
  </motion.div>
);

// Composant pour les séparateurs de section avec animation
const Separator = ({ from, via, to }) => (
  <motion.div 
    className="my-16 relative"
    variants={itemVariants}
  >
    <motion.div
      className={`h-1 w-32 md:w-48 rounded-full mx-auto bg-gradient-to-r from-${from} via-${via} to-${to}`}
      initial={{ width: 0 }}
      animate={{ width: "80px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
    <motion.div
      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-200"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    />
  </motion.div>
);

const LaboratoryDashboardGlobal: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible" 
      className="max-w-8xl mx-auto p-6 md:p-8 space-y-12"
    >
      {/* Ventes */}
      <motion.div variants={itemVariants}>
        <SectionTitle 
          emoji="📊" 
          title="Suivi des Performances Commerciales" 
          description="Analyse des ventes, marges et prévisions pour une gestion optimale 📈"
          color="text-teal-600"
        />
        <SalesDataComponent />
      </motion.div>

      <Separator from="indigo-400" via="blue-400" to="teal-400" />

      {/* Ruptures de stock */}
      <motion.div variants={itemVariants}>
        <SectionTitle 
          emoji="⚠️" 
          title="Analyse des Ruptures de Stock" 
          description="Impact des ruptures sur les ventes et la rentabilité 🚨"
          color="text-red-600"
        />
        {/* <StockBreakDataComponent /> */}
      </motion.div>

      <Separator from="teal-400" via="yellow-400" to="red-400" />

      {/* Stocks */}
      <motion.div variants={itemVariants}>
        <SectionTitle 
          emoji="📦" 
          title="Analyse des Stocks" 
          description="Évaluation des niveaux de stock et de leur impact sur la trésorerie 📊"
          color="text-indigo-600"
        />
        
        <motion.p 
          className="text-sm text-gray-600 italic text-center mb-8 bg-indigo-50 py-3 px-4 rounded-lg shadow-sm mx-auto max-w-3xl border border-indigo-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          📢 Attention : Les données de stock ne sont pas disponibles avant 2025 pour les pharmacies LGPI.
        </motion.p>
        
        {/* <StockDataComponent /> */}
      </motion.div>

      <Separator from="indigo-400" via="purple-400" to="violet-400" />

      {/* Métriques */}
      <motion.div variants={itemVariants}>
        <SectionTitle 
          emoji="📈" 
          title="Indicateurs Clés de Performance" 
          description="Analyse des prix moyens, marges et références vendues 💡"
          color="text-purple-600"
        />
        {/* <MetricsDataComponent /> */}
      </motion.div>

      <Separator from="purple-400" via="pink-400" to="rose-400" />

      {/* Pharmacies */}
      <motion.div variants={itemVariants}>
        <SectionTitle 
          emoji="🏥" 
          title="Performances des Pharmacies" 
          description="Analyse des ventes et marges des pharmacies partenaires 💊"
          color="text-pink-600"
        />
        {/* <SalesPharmaciesComponent /> */}
      </motion.div>
    </motion.div>
  );
};

export default LaboratoryDashboardGlobal;