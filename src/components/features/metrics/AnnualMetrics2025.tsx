import React, { useEffect } from "react";
import DataBlock from "@/components/common/cards/DataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import PeriodSelector from "@/components/common/sections/PeriodSelector";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion } from "framer-motion";
import { HiChartBar, HiCurrencyDollar, HiCalendarDays, HiShoppingBag } from "react-icons/hi2";

interface AnnualMetricsProps {
  currentPeriodData: {
    avgSalePrice: number;
    avgPurchasePrice: number;
    avgMargin: number;
    avgMarginPercentage: number;
    uniqueProductsSold: number;
    uniqueSellingPharmacies: number;
  };
  comparisonPeriodData: {
    avgSalePrice: number;
    avgPurchasePrice: number;
    avgMargin: number;
    avgMarginPercentage: number;
    uniqueProductsSold: number;
    uniqueSellingPharmacies: number;
  };
}

const AnnualMetrics2025: React.FC<AnnualMetricsProps> = ({
  currentPeriodData,
  comparisonPeriodData
}) => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // Debug log pour comprendre les données
  useEffect(() => {
    console.log('Current Period Data:', currentPeriodData);
    console.log('Comparison Period Data:', comparisonPeriodData);
  }, [currentPeriodData, comparisonPeriodData]);

  // Dérive des métriques pour formater les données
  const hasData = 
    currentPeriodData && 
    Object.values(currentPeriodData).some(value => 
      typeof value === 'number' && !isNaN(value) && value !== 0
    );
    
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

  // Si aucune donnée n'est disponible, ne pas afficher le composant
  if (!hasData) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
    >
      {/* En-tête avec titre et sélecteur de période */}
      <div className="p-6 md:p-8 relative bg-gradient-to-br from-violet-50 to-purple-50 border-b border-violet-100/50">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-purple-500 shadow-sm"></div>
        
        {/* Éléments de design de fond */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-violet-100/80 text-violet-600 shadow-sm border border-violet-200/50 mr-4"
              variants={headerIconVariants}
            >
              <HiChartBar className="w-6 h-6" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Indicateurs Clés
              </h2>
              <motion.p variants={fadeInVariants} className="text-gray-500 text-sm mt-1">
                Analyse des prix, marges et références commercialisées
              </motion.p>
            </div>
          </div>

          {/* Sélecteur de période */}
          <PeriodSelector 
            currentDateRange={dateRange} 
            comparisonDateRange={comparisonDateRange} 
            bgColor="bg-gradient-to-r from-violet-500 to-purple-500"
            hoverColor="hover:shadow-lg"
          />
        </div>
      </div>

      {/* Contenu des métriques */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* PRIX & MARGES CARD */}
          <SummaryCard 
            title="Prix & Marges" 
            icon={<HiCurrencyDollar className="w-5 h-5" />}
            iconColor="text-violet-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.1}
            accentColor="violet"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Prix Vente Moyen" 
                value={currentPeriodData.avgSalePrice} 
                previousValue={comparisonPeriodData?.avgSalePrice}
                isCurrency
                accentColor="violet"
                animationDelay={0.2}
                variant="minimal"
              />
              <DataBlock 
                title="Prix Achat Moyen" 
                value={currentPeriodData.avgPurchasePrice} 
                previousValue={comparisonPeriodData?.avgPurchasePrice}
                isCurrency
                accentColor="violet"
                animationDelay={0.3}
                variant="minimal"
              />
            </div>
            
            {/* Bloc supplémentaire pour la marge et son taux */}
            <div className="mt-4 pt-3 border-t border-violet-50 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Marge Moyenne"
                value={currentPeriodData.avgMargin}
                previousValue={comparisonPeriodData?.avgMargin}
                isCurrency
                accentColor="violet"
                animationDelay={0.4}
                variant="minimal"
              />
              <DataBlock 
                title="Taux de Marge"
                value={currentPeriodData.avgMarginPercentage}
                previousValue={comparisonPeriodData?.avgMarginPercentage}
                isPercentage
                accentColor="violet"
                animationDelay={0.5}
                variant="minimal"
              />
            </div>
          </SummaryCard>

          {/* DISTRIBUTION CARD */}
          <SummaryCard 
            title="Distribution" 
            icon={<HiCalendarDays className="w-5 h-5" />}
            iconColor="text-purple-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.2}
            accentColor="purple"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Références Vendues" 
                value={currentPeriodData.uniqueProductsSold} 
                previousValue={comparisonPeriodData?.uniqueProductsSold}
                accentColor="purple"
                animationDelay={0.3}
                variant="minimal"
              />
              <DataBlock 
                title="Pharmacies Actives" 
                value={currentPeriodData.uniqueSellingPharmacies} 
                previousValue={comparisonPeriodData?.uniqueSellingPharmacies}
                accentColor="purple"
                animationDelay={0.4}
                variant="minimal"
              />
            </div>
            
            {/* Note explicative sur la couverture du réseau */}
            <div className="mt-4 pt-3 border-t border-purple-50">
              <motion.div 
                variants={fadeInVariants}
                className="bg-purple-50/50 rounded-lg p-3 text-xs text-purple-700 flex items-start"
              >
                <HiShoppingBag className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <p>
                  Une dynamique commerciale solide se dessine : <strong>{currentPeriodData.uniqueProductsSold}</strong> références différentes 
                  sont distribuées sur <strong>{currentPeriodData.uniqueSellingPharmacies}</strong> points de vente, 
                  générant un prix moyen de <strong>{currentPeriodData.avgSalePrice.toFixed(2)}€</strong>. 
                  Le taux de marge attractif de <strong>{currentPeriodData.avgMarginPercentage.toFixed(2)}%</strong> 
                  témoigne d'une stratégie tarifaire optimisée et d'une valeur ajoutée significative.
                </p>
              </motion.div>
            </div>
          </SummaryCard>
        </div>
      </div>
    </motion.div>
  );
};

export default AnnualMetrics2025;