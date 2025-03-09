import React from "react";
import AnnualMetrics2025 from "./AnnualMetrics2025";
import MetricsDataMonthly from "./MetricsDataMonthly";
import Loader from "@/components/common/feedback/Loader";
import { useMetricsData } from "@/hooks/data/useMetricsData";
import { motion } from "framer-motion";

/**
 * Composant principal d'affichage des métriques commerciales
 */
const MetricsDataComponent: React.FC = () => {
  // Récupération des données de métriques
  const { 
    metricsData, 
    loading, 
    error, 
    hasSelectedData,
    metrics 
  } = useMetricsData();

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
        <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-full mb-5 border border-violet-100/50 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sélectionnez un laboratoire</h3>
        <p className="text-gray-500 text-center max-w-md">
          Utilisez le sélecteur en haut de la page pour choisir un laboratoire ou une marque et visualiser les indicateurs de performance.
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return <Loader type="pulse" message="Analyse des indicateurs de performance en cours..." color="purple" size="lg" />;
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

  if (!metricsData || metricsData.length === 0) {
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
        <p className="text-amber-600">Nous n'avons pas trouvé d'indicateurs de performance pour les critères sélectionnés.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-8xl mx-auto space-y-10"
    >
      {/* Section résumé annuel */}
      <motion.div variants={itemVariants}>
        <AnnualMetrics2025 
          currentPeriodData={metrics.current} 
          comparisonPeriodData={metrics.adjusted} 
        />
      </motion.div>

      {/* Section données mensuelles */}
      <motion.div variants={itemVariants}>
        <MetricsDataMonthly 
          metricsData={metricsData} 
          loading={loading} 
          error={error} 
        />
      </motion.div>
    </motion.div>
  );
};

export default MetricsDataComponent;