import DataBlock from "@/components/common/cards/DataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import PeriodSelector from "@/components/common/sections/PeriodSelector";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion } from "framer-motion";
import React from "react";
import { HiCalendarDays, HiArchiveBox, HiCurrencyDollar, HiClock } from "react-icons/hi2";

interface AnnualStockSummaryProps {
  currentPeriodData: {
    avgStock: number;
    stockValue: number;
    monthsOfStock: number;
    stockValuePercentage: number;
  };
  comparisonPeriodData: {
    avgStock: number;
    stockValue: number;
    monthsOfStock: number;
    stockValuePercentage: number;
  };
}

const AnnualStockSummary2025: React.FC<AnnualStockSummaryProps> = ({
  currentPeriodData,
  comparisonPeriodData
}) => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // Dérive des métriques pour formater les données
  const hasData = 
    currentPeriodData && 
    typeof currentPeriodData.stockValue === 'number' && 
    !isNaN(currentPeriodData.stockValue);
    
  // Calcul du ratio stockValue/avgStock (valeur moyenne par unité en stock)
  const avgStockUnitValue = hasData && currentPeriodData.avgStock > 0 
    ? currentPeriodData.stockValue / currentPeriodData.avgStock 
    : 0;
    
  const prevAvgStockUnitValue = comparisonPeriodData && comparisonPeriodData.avgStock > 0
    ? comparisonPeriodData.stockValue / comparisonPeriodData.avgStock
    : 0;
    
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
    >
      {/* En-tête avec titre et sélecteur de période */}
      <div className="p-6 md:p-8 relative bg-gradient-to-br from-indigo-50 to-blue-50 border-b border-indigo-100/50">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-500 shadow-sm"></div>
        
        {/* Éléments de design de fond */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100/80 text-indigo-600 shadow-sm border border-indigo-200/50 mr-4"
              variants={headerIconVariants}
            >
              <HiArchiveBox className="w-6 h-6" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Résumé des Stocks
              </h2>
              <motion.p variants={fadeInVariants} className="text-gray-500 text-sm mt-1">
                Analyse de la valeur et des niveaux de stock
              </motion.p>
            </div>
          </div>

          {/* Sélecteur de période */}
          <PeriodSelector 
            currentDateRange={dateRange} 
            comparisonDateRange={comparisonDateRange} 
            bgColor="bg-gradient-to-r from-indigo-500 to-blue-500"
            hoverColor="hover:shadow-lg"
          />
        </div>
      </div>

      {/* Contenu des métriques */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* STOCK TOTAL CARD */}
          <SummaryCard 
            title="Stock Total" 
            icon={<HiArchiveBox className="w-5 h-5" />}
            iconColor="text-indigo-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.1}
            accentColor="indigo"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Stock Moyen" 
                value={hasData ? currentPeriodData.avgStock : 0} 
                previousValue={comparisonPeriodData?.avgStock}
                accentColor="indigo"
                animationDelay={0.2}
                variant="minimal"
              />
              <DataBlock 
                title="Valeur du Stock" 
                value={hasData ? currentPeriodData.stockValue : 0} 
                previousValue={comparisonPeriodData?.stockValue}
                isCurrency
                accentColor="indigo"
                animationDelay={0.3}
                variant="minimal"
              />
            </div>
            
            {/* Bloc supplémentaire pour le prix moyen par unité */}
            <div className="mt-4 pt-3 border-t border-indigo-50">
              <DataBlock 
                title="Valeur Moyenne par Unité"
                value={avgStockUnitValue || 0}
                previousValue={prevAvgStockUnitValue || 0}
                isCurrency
                accentColor="indigo"
                animationDelay={0.4}
                variant="outlined"
                size="sm"
              />
            </div>
          </SummaryCard>

          {/* DÉTAILS STOCK CARD */}
          <SummaryCard 
            title="Détails Stock" 
            icon={<HiClock className="w-5 h-5" />}
            iconColor="text-blue-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.2}
            accentColor="blue"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Mois de Stock" 
                value={hasData ? currentPeriodData.monthsOfStock : 0} 
                previousValue={comparisonPeriodData?.monthsOfStock}
                isDecimal
                accentColor="blue"
                animationDelay={0.3}
                variant="minimal"
              />
              <DataBlock 
                title="% Valeur / CA" 
                value={hasData ? currentPeriodData.stockValuePercentage : 0} 
                previousValue={comparisonPeriodData?.stockValuePercentage}
                isPercentage
                accentColor="blue"
                animationDelay={0.4}
                variant="minimal"
              />
            </div>
            
            {/* Note explicative sur l'interprétation */}
            <div className="mt-4 pt-3 border-t border-blue-50">
              <motion.div 
                variants={fadeInVariants}
                className="bg-blue-50/50 rounded-lg p-3 text-xs text-blue-700 flex items-start"
              >
                <HiCurrencyDollar className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <p>
                  Un stock représentant <strong>{currentPeriodData.monthsOfStock.toFixed(1)} mois</strong> de ventes. 
                  Les stocks constituent <strong>{currentPeriodData.stockValuePercentage.toFixed(1)}%</strong> du chiffre d'affaires annualisé.
                </p>
              </motion.div>
            </div>
          </SummaryCard>
        </div>
      </div>
    </motion.div>
  );
};

export default AnnualStockSummary2025;