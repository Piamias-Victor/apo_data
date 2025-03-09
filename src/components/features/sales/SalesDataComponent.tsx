import React from "react";
import AnnualSummary2025 from "./AnnualSummary2025";
import ForecastSummary2025 from "./ForecastSummary2025";
import SalesDataMonthly from "./SalesDataMonthly";
import Loader from "@/components/common/feedback/Loader";
import { useSalesData } from "@/hooks/data/useSalesData";
import { useForecastCalculation } from "@/hooks/ui/useForecastCalculation";
import { motion } from "framer-motion";

/**
 * Composant principal d'affichage des données de ventes
 */
const SalesDataComponent: React.FC = () => {
  // Récupération des données de ventes
  const { 
    salesData, 
    loading, 
    error, 
    hasSelectedData,
    metrics 
  } = useSalesData();

  // Calculs de prévisions
  const { 
    forecastPercentage, 
    setForecastPercentage, 
    forecastMetrics 
  } = useForecastCalculation(salesData, hasSelectedData);

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
        <div className="p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-full mb-5 border border-teal-100/50 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sélectionnez un laboratoire</h3>
        <p className="text-gray-500 text-center max-w-md">
          Utilisez le sélecteur en haut de la page pour choisir un laboratoire ou une marque et visualiser les données de ventes.
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return <Loader type="pulse" message="Analyse des données de ventes en cours..." color="teal" size="lg" />;
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

  if (!salesData || salesData.length === 0) {
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
        <p className="text-amber-600">Nous n'avons pas trouvé de données de ventes pour les critères sélectionnés.</p>
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
        <AnnualSummary2025 
          currentPeriodData={metrics.current} 
          comparisonPeriodData={metrics.adjusted} 
        />
      </motion.div>

      {/* Section prévisions */}
      <motion.div variants={itemVariants}>
        <ForecastSummary2025
          forecastValues={forecastMetrics}
          previousYearValues={metrics.global}
          forecastPercentage={forecastPercentage}
          setForecastPercentage={setForecastPercentage}
        />
      </motion.div>

      {/* Section données mensuelles */}
      <motion.div variants={itemVariants}>
        <SalesDataMonthly 
          salesData={salesData} 
          loading={loading} 
          error={error} 
        />
      </motion.div>
    </motion.div>
  );
};

export default SalesDataComponent;