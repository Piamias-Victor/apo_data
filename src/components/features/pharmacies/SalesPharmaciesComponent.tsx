import React from "react";
import { motion } from "framer-motion";
import { usePharmacySalesData } from "@/hooks/api/usePharmacySalesData";
import Loader from "@/components/common/feedback/Loader";
import SalesDataByPharmacy from "./SalesDataByPharmacy";
import SectionTitle from "@/components/common/sections/SectionTitle";
import TopPharmaciesCard from "./SalesSummaryCard";

const SalesPharmaciesComponent: React.FC = () => {
  // Récupération des données de ventes par pharmacie
  const { 
    salesData, 
    loading, 
    error, 
    hasSelectedData,
    topPharmacies 
  } = usePharmacySalesData();

  // Variantes d'animation pour le conteneur
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

  // Variantes d'animation pour les éléments
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

  // États de chargement et d'erreur
  if (!hasSelectedData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center p-10 my-8 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm"
      >
        <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full mb-5 border border-pink-100/50 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sélectionnez un laboratoire</h3>
        <p className="text-gray-500 text-center max-w-md">
          Utilisez le sélecteur en haut de la page pour choisir un laboratoire ou une marque et visualiser les ventes par pharmacie.
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return <Loader type="pulse" message="Analyse des données de pharmacies en cours..." color="pink" size="lg" />;
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
      className="max-w-8xl mx-auto p-6 md:p-8 space-y-12"
    >
      {/* Carte des meilleures pharmacies */}
      <motion.div variants={itemVariants}>
        <TopPharmaciesCard 
          topRevenue={topPharmacies.topRevenue}
          topMargin={topPharmacies.topMargin}
          topGrowth={topPharmacies.topGrowth}
          loading={loading}
          error={error}
        />
      </motion.div>

      {/* Tableau détaillé des ventes par pharmacie */}
      <motion.div variants={itemVariants}>
        <SalesDataByPharmacy 
          salesData={salesData} 
          loading={loading} 
          error={error} 
        />
      </motion.div>
    </motion.div>
  );
};

export default SalesPharmaciesComponent;