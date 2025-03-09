import React from "react";
import { motion } from "framer-motion";
import { HiShoppingCart, HiChartBar, HiCube } from "react-icons/hi2";
import { FaCrown } from "react-icons/fa";
import DataBlock from "@/components/common/cards/DataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import PeriodSelector from "@/components/common/sections/PeriodSelector";
import { useFilterContext } from "@/contexts/FilterContext";
import { PharmacySalesWithEvolution } from "@/hooks/api/usePharmacySalesData";

interface TopPharmaciesCardProps {
  topRevenue: PharmacySalesWithEvolution[];
  topMargin: PharmacySalesWithEvolution[];
  topGrowth: PharmacySalesWithEvolution[];
  loading: boolean;
  error: string | null;
}

const TopPharmaciesCard: React.FC<TopPharmaciesCardProps> = ({
  topRevenue,
  topMargin,
  topGrowth,
  loading,
  error
}) => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // Variables d'animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        delay: 0.2, 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const headerIconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: 0.1,
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 text-center"
      >
        <p className="text-gray-800">Chargement des données des pharmacies...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-red-50/90 backdrop-blur-md rounded-xl shadow-lg border border-red-200 text-center"
      >
        <p className="text-red-600">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
    >
      {/* En-tête avec titre et sélecteur de période */}
      <div className="p-6 md:p-8 relative bg-gradient-to-br from-pink-50 to-rose-50 border-b border-pink-100/50">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-rose-500 shadow-sm"></div>
        
        {/* Éléments de design de fond */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-100/80 text-pink-600 shadow-sm border border-pink-200/50 mr-4"
              variants={headerIconVariants}
            >
              <FaCrown className="w-6 h-6" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Pharmacies Leaders
              </h2>
              <motion.p variants={fadeInVariants} className="text-gray-500 text-sm mt-1">
                Analyse des performances des pharmacies partenaires
              </motion.p>
            </div>
          </div>

          {/* Sélecteur de période */}
          <PeriodSelector 
            currentDateRange={dateRange} 
            comparisonDateRange={comparisonDateRange} 
            bgColor="bg-gradient-to-r from-pink-500 to-rose-500"
            hoverColor="hover:shadow-lg"
          />
        </div>
      </div>

      {/* Contenu des métriques */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* TOP 3 CA */}
          <SummaryCard 
            title="Top 3 CA" 
            icon={<HiShoppingCart className="w-5 h-5" />}
            iconColor="text-pink-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.1}
            accentColor="pink"
          >
            <div className="grid grid-cols-1 gap-4">
              {topRevenue.map((pharmacy, index) => (
                <DataBlock 
                  key={pharmacy.pharmacy_id}
                  title={pharmacy.pharmacy_name}
                  value={pharmacy.revenue}
                  previousValue={pharmacy.previous?.revenue}
                  isCurrency
                  accentColor="pink"
                  animationDelay={0.2 + (index * 0.1)}
                  variant="minimal"
                />
              ))}
            </div>
          </SummaryCard>

          {/* TOP 3 MARGE */}
          <SummaryCard 
            title="Top 3 Marge" 
            icon={<HiChartBar className="w-5 h-5" />}
            iconColor="text-pink-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.2}
            accentColor="pink"
          >
            <div className="grid grid-cols-1 gap-4">
              {topMargin.map((pharmacy, index) => (
                <DataBlock 
                  key={pharmacy.pharmacy_id}
                  title={pharmacy.pharmacy_name}
                  value={pharmacy.margin}
                  previousValue={pharmacy.previous?.margin}
                  isCurrency
                  accentColor="pink"
                  animationDelay={0.3 + (index * 0.1)}
                  variant="minimal"
                />
              ))}
            </div>
          </SummaryCard>

          {/* TOP 3 PROGRESSIONS */}
          <SummaryCard 
            title="Top 3 Progressions" 
            icon={<HiCube className="w-5 h-5" />}
            iconColor="text-pink-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.3}
            accentColor="pink"
          >
            <div className="grid grid-cols-1 gap-4">
              {topGrowth.map((pharmacy, index) => (
                <DataBlock 
                  key={pharmacy.pharmacy_id}
                  title={pharmacy.pharmacy_name}
                  value={pharmacy.evolution?.revenue || 0}
                  previousValue={0}
                  isPercentage
                  accentColor="pink"
                  animationDelay={0.4 + (index * 0.1)}
                  variant="minimal"
                />
              ))}
            </div>
          </SummaryCard>
        </div>
      </div>
    </motion.div>
  );
};

export default TopPharmaciesCard;