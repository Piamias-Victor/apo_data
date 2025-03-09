import React from "react";
import AnnualStockBreak2025 from "./AnnualStockBreak2025";
import ForecastStockBreak2025 from "./ForecastStockBreak2025";
import StockBreakDataMonthly from "./StockBreakDataMonthly";
import Loader from "@/components/common/feedback/Loader";
import { useStockBreakData } from "@/hooks/data/useStockBreakData";
import { useStockBreakForecast } from "@/hooks/ui/useStockBreakForecast";
import { motion } from "framer-motion";

/**
 * Composant principal d'affichage des données de ruptures de stock
 */
const StockBreakDataComponent: React.FC = () => {
  // Récupération des données de ruptures
  const { 
    stockBreakData, 
    loading, 
    error, 
    hasSelectedData,
    completeForecast,
    metrics 
  } = useStockBreakData();

  // Calculs de prévisions
  const { 
    forecastPercentage, 
    setForecastPercentage, 
    forecastMetrics 
  } = useStockBreakForecast(completeForecast, hasSelectedData);

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
        <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-full mb-5 border border-red-100/50 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sélectionnez un laboratoire</h3>
        <p className="text-gray-500 text-center max-w-md">
          Utilisez le sélecteur en haut de la page pour choisir un laboratoire ou une marque et visualiser les données de ruptures de stock.
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return <Loader type="pulse" message="Analyse des données de ruptures en cours..." color="red" size="lg" />;
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

  if (!stockBreakData || stockBreakData.length === 0) {
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
        <p className="text-amber-600">Nous n'avons pas trouvé de données de ruptures pour les critères sélectionnés.</p>
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
        <AnnualStockBreak2025 
          currentPeriodData={metrics.current} 
          comparisonPeriodData={metrics.adjusted} 
        />
      </motion.div>

      {/* Section prévisions */}
      <motion.div variants={itemVariants}>
        <ForecastStockBreak2025
          forecastValues={forecastMetrics}
          previousYearValues={metrics.global}
          forecastPercentage={forecastPercentage}
          setForecastPercentage={setForecastPercentage}
        />
      </motion.div>

      {/* Section données mensuelles */}
      <motion.div variants={itemVariants}>
        <StockBreakDataMonthly 
          stockBreakData={stockBreakData} 
          loading={loading} 
          error={error} 
        />
      </motion.div>
    </motion.div>
  );
};

export default StockBreakDataComponent;