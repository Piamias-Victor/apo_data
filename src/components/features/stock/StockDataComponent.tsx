import React from "react";

import StockDataMonthly from "./StockDataMonthly";
import Loader from "@/components/common/feedback/Loader";
import { useStockData } from "@/hooks/data/useStockData";
import { useStockForecast } from "@/hooks/ui/useStockForecast";
import { motion } from "framer-motion";
import AnnualStockSummary2025 from "./AnnualStockSummary2025";
import ForecastStockSummary2025 from "./ForecastStockSummary2025";

/**
 * Composant principal d'affichage des données de stocks
 */
const StockDataComponent: React.FC = () => {
  // Récupération des données de stocks
  const { 
    stockSalesData, 
    loading, 
    error, 
    hasSelectedData,
    completeForecast,
    metrics 
  } = useStockData();

  // Calculs de prévisions
  const { 
    forecastPercentage, 
    setForecastPercentage, 
    forecastMetrics 
  } = useStockForecast(completeForecast, hasSelectedData);

  // Variantes d'animation pour le conteneur
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        duration: 0.6
      }
    }
  };

  // Variantes d'animation pour les éléments
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] // Courbe d'accélération Apple
      }
    }
  };

  // États conditionnels pour différentes situations
  if (!hasSelectedData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center p-10 my-8 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm"
      >
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full mb-5 border border-indigo-100/50 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sélectionnez un laboratoire</h3>
        <p className="text-gray-500 text-center max-w-md">
          Utilisez le sélecteur en haut de la page pour choisir un laboratoire ou une marque et visualiser les données de stock.
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return <Loader type="pulse" message="Analyse des données de stock en cours..." color="indigo" size="lg" />;
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-red-50/90 backdrop-blur-sm rounded-xl border border-red-200 text-center shadow-sm"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">Erreur de chargement</h3>
        <p className="text-red-600">{error}</p>
      </motion.div>
    );
  }

  if (!stockSalesData || stockSalesData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-amber-50/90 backdrop-blur-sm rounded-xl border border-amber-200 text-center shadow-sm"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-amber-700 mb-2">Aucune donnée disponible</h3>
        <p className="text-amber-600">Nous n'avons pas trouvé de données de stock pour les critères sélectionnés.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-8xl mx-auto space-y-8"
    >
      {/* Section résumé annuel */}
      <motion.div variants={itemVariants}>
        <AnnualStockSummary2025 
          currentPeriodData={metrics.current} 
          comparisonPeriodData={metrics.adjusted} 
        />
      </motion.div>

      {/* Section prévisions */}
      <motion.div variants={itemVariants}>
        <ForecastStockSummary2025
          forecastValues={forecastMetrics}
          previousYearValues={metrics.global}
          forecastPercentage={forecastPercentage}
          setForecastPercentage={setForecastPercentage}
        />
      </motion.div>

      {/* Section données mensuelles */}
      <motion.div variants={itemVariants}>
        <StockDataMonthly 
          stockData={stockSalesData} 
          loading={loading} 
          error={error} 
        />
      </motion.div>
    </motion.div>
  );
};

export default StockDataComponent;