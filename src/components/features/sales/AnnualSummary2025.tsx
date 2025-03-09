import DataBlock from "@/components/common/cards/DataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import PeriodSelector from "@/components/common/sections/PeriodSelector";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion } from "framer-motion";
import React from "react";
import { HiCalendarDays, HiShoppingCart, HiCube } from "react-icons/hi2";

interface AnnualSummaryProps {
  currentPeriodData: {
    sellOut: number;
    revenue: number;
    margin: number;
    sellIn: number;
    purchaseAmount: number;
  };
  comparisonPeriodData: {
    sellOut: number;
    revenue: number;
    margin: number;
    sellIn: number;
    purchaseAmount: number;
  };
}

const AnnualSummary2025: React.FC<AnnualSummaryProps> = ({
  currentPeriodData,
  comparisonPeriodData
}) => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // Dérive des métriques pour formater les données
  const hasData = 
    currentPeriodData && 
    typeof currentPeriodData.revenue === 'number' && 
    !isNaN(currentPeriodData.revenue);
    
  // Calcul du ratio de marge (en pourcentage)
  const marginRatio = hasData && currentPeriodData.revenue > 0 
    ? (currentPeriodData.margin / currentPeriodData.revenue) * 100 
    : 0;
    
  // Calcul du ratio de marge pour la période précédente
  const prevMarginRatio = comparisonPeriodData && comparisonPeriodData.revenue > 0
    ? (comparisonPeriodData.margin / comparisonPeriodData.revenue) * 100
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
      <div className="p-6 md:p-8 relative bg-gradient-to-br from-teal-50 to-blue-50 border-b border-teal-100/50">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500 shadow-sm"></div>
        
        {/* Éléments de design de fond */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-100/80 text-teal-600 shadow-sm border border-teal-200/50 mr-4"
              variants={headerIconVariants}
            >
              <HiCalendarDays className="w-6 h-6" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Résumé Périodique
              </h2>
              <motion.p variants={fadeInVariants} className="text-gray-500 text-sm mt-1">
                Analyse des performances de vente et d'achat
              </motion.p>
            </div>
          </div>

          {/* Sélecteur de période */}
          <PeriodSelector 
            currentDateRange={dateRange} 
            comparisonDateRange={comparisonDateRange} 
            bgColor="bg-gradient-to-r from-teal-500 to-blue-500"
            hoverColor="hover:shadow-lg"
          />
        </div>
      </div>

      {/* Contenu des métriques */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* SELL-OUT CARD */}
          <SummaryCard 
            title="Ventes (Sell-Out)" 
            icon={<HiShoppingCart className="w-5 h-5" />}
            iconColor="text-teal-500"
            variant="glass"
            noPadding={false}
            animationDelay={0.1}
            accentColor="teal"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <DataBlock 
                title="Volume" 
                value={hasData ? currentPeriodData.sellOut : 0} 
                previousValue={comparisonPeriodData?.sellOut}
                accentColor="teal"
                animationDelay={0.2}
                variant="minimal"
              />
              <DataBlock 
                title="Chiffre d'Affaires" 
                value={hasData ? currentPeriodData.revenue : 0} 
                previousValue={comparisonPeriodData?.revenue}
                isCurrency
                accentColor="teal"
                animationDelay={0.3}
                variant="minimal"
              />
              <DataBlock 
                title="Marge" 
                value={hasData ? currentPeriodData.margin : 0} 
                previousValue={comparisonPeriodData?.margin}
                isCurrency
                accentColor="teal"
                animationDelay={0.4}
                variant="minimal"
              />
            </div>
            
            {/* Bloc supplémentaire pour le taux de marge */}
            <div className="mt-4 pt-3 border-t border-teal-50">
              <DataBlock 
                title="Taux de Marge"
                value={marginRatio || 0}
                previousValue={prevMarginRatio || 0}
                isPercentage
                accentColor="teal"
                animationDelay={0.5}
                variant="outlined"
                size="sm"
              />
            </div>
          </SummaryCard>

          {/* SELL-IN CARD */}
          <SummaryCard 
            title="Achats (Sell-In)" 
            icon={<HiCube className="w-5 h-5" />}
            iconColor="text-blue-500"
            variant="glass"
            noPadding={false}
            animationDelay={0.2}
            accentColor="blue"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Volume" 
                value={hasData ? currentPeriodData.sellIn : 0} 
                previousValue={comparisonPeriodData?.sellIn}
                accentColor="blue"
                animationDelay={0.3}
                variant="minimal"
              />
              <DataBlock 
                title="Montant" 
                value={hasData ? currentPeriodData.purchaseAmount : 0} 
                previousValue={comparisonPeriodData?.purchaseAmount}
                isCurrency
                accentColor="blue"
                animationDelay={0.4}
                variant="minimal"
              />
            </div>
            
            {/* Ratio achats/ventes */}
            <div className="mt-4 pt-3 border-t border-blue-50">
              <DataBlock 
                title="Ratio Achats/Ventes"
                value={hasData && currentPeriodData.revenue > 0 
                  ? (currentPeriodData.purchaseAmount / currentPeriodData.revenue) * 100 
                  : 0}
                previousValue={comparisonPeriodData && comparisonPeriodData.revenue > 0
                  ? (comparisonPeriodData.purchaseAmount / comparisonPeriodData.revenue) * 100
                  : 0}
                isPercentage
                accentColor="blue"
                animationDelay={0.5}
                variant="outlined"
                size="sm"
              />
            </div>
          </SummaryCard>
        </div>
      </div>
    </motion.div>
  );
};

export default AnnualSummary2025;