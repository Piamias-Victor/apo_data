import DataBlock from "@/components/common/cards/DataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import PeriodSelector from "@/components/common/sections/PeriodSelector";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion } from "framer-motion";
import React from "react";
import { HiCalendarDays, HiExclamationTriangle, HiCurrencyDollar, HiShoppingBag } from "react-icons/hi2";

interface AnnualStockBreakProps {
  currentPeriodData: {
    productOrder: number;
    breakProduct: number;
    breakRate: number;
    breakAmount: number;
  };
  comparisonPeriodData: {
    productOrder: number;
    breakProduct: number;
    breakRate: number;
    breakAmount: number;
  };
}

const AnnualStockBreak2025: React.FC<AnnualStockBreakProps> = ({
  currentPeriodData,
  comparisonPeriodData
}) => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // Dérive des métriques pour formater les données
  const hasData = 
    currentPeriodData && 
    typeof currentPeriodData.productOrder === 'number' && 
    !isNaN(currentPeriodData.productOrder);
    
  // Calcul du ratio de rupture sur commandes
  const breakRatio = hasData && currentPeriodData.productOrder > 0 
    ? (currentPeriodData.breakProduct / currentPeriodData.productOrder) * 100 
    : 0;
    
  // Calcul du ratio de rupture pour la période précédente
  const prevBreakRatio = comparisonPeriodData && comparisonPeriodData.productOrder > 0
    ? (comparisonPeriodData.breakProduct / comparisonPeriodData.productOrder) * 100
    : 0;
    
  // Calcul du coût moyen par rupture
  const breakCostPerUnit = hasData && currentPeriodData.breakProduct > 0 
    ? currentPeriodData.breakAmount / currentPeriodData.breakProduct
    : 0;
    
  const prevBreakCostPerUnit = comparisonPeriodData && comparisonPeriodData.breakProduct > 0
    ? comparisonPeriodData.breakAmount / comparisonPeriodData.breakProduct
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
      <div className="p-6 md:p-8 relative bg-gradient-to-br from-red-50 to-orange-50 border-b border-red-100/50">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-500 shadow-sm"></div>
        
        {/* Éléments de design de fond */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100/80 text-red-600 shadow-sm border border-red-200/50 mr-4"
              variants={headerIconVariants}
            >
              <HiExclamationTriangle className="w-6 h-6" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Suivi des Ruptures
              </h2>
              <motion.p variants={fadeInVariants} className="text-gray-500 text-sm mt-1">
                Analyse des produits en rupture et de leur impact financier
              </motion.p>
            </div>
          </div>

          {/* Sélecteur de période */}
          <PeriodSelector 
            currentDateRange={dateRange} 
            comparisonDateRange={comparisonDateRange} 
            bgColor="bg-gradient-to-r from-red-500 to-orange-500"
            hoverColor="hover:shadow-lg"
          />
        </div>
      </div>

      {/* Contenu des métriques */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6">
          {/* PRODUITS COMMANDÉS */}
          <SummaryCard 
            title="Produits Commandés" 
            icon={<HiShoppingBag className="w-5 h-5" />}
            iconColor="text-purple-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.1}
            accentColor="purple"
          >
            <DataBlock 
              title="Nombre Total" 
              value={hasData ? currentPeriodData.productOrder : 0} 
              previousValue={comparisonPeriodData?.productOrder}
              accentColor="purple"
              animationDelay={0.2}
              variant="minimal"
            />
          </SummaryCard>

          {/* PRODUITS EN RUPTURE */}
          <SummaryCard 
            title="Produits en Rupture" 
            icon={<HiExclamationTriangle className="w-5 h-5" />}
            iconColor="text-red-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.2}
            accentColor="red"
          >
            <DataBlock 
              title="Nombre Total" 
              value={hasData ? currentPeriodData.breakProduct : 0} 
              previousValue={comparisonPeriodData?.breakProduct}
              accentColor="red"
              animationDelay={0.3}
              variant="minimal"
            />
          </SummaryCard>

          {/* TAUX DE RUPTURE */}
          <SummaryCard 
            title="Taux de Rupture" 
            icon={<HiCalendarDays className="w-5 h-5" />}
            iconColor="text-amber-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.3}
            accentColor="amber"
          >
            <DataBlock 
              title="Pourcentage" 
              value={hasData ? currentPeriodData.breakRate : 0} 
              previousValue={comparisonPeriodData?.breakRate}
              isPercentage
              accentColor="amber"
              animationDelay={0.4}
              variant="minimal"
            />
          </SummaryCard>

          {/* MONTANT DES RUPTURES */}
          <SummaryCard 
            title="Montant des Ruptures" 
            icon={<HiCurrencyDollar className="w-5 h-5" />}
            iconColor="text-orange-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.4}
            accentColor="orange"
          >
            <DataBlock 
              title="Total" 
              value={hasData ? currentPeriodData.breakAmount : 0} 
              previousValue={comparisonPeriodData?.breakAmount}
              isCurrency
              accentColor="orange"
              animationDelay={0.5}
              variant="minimal"
            />
          </SummaryCard>
        </div>

        {/* Section supplémentaire de métriques calculées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {/* Ratio de rupture sur commandes */}
          <SummaryCard 
            title="Statistiques Avancées" 
            icon={<HiExclamationTriangle className="w-5 h-5" />}
            iconColor="text-red-500"
            variant="glass"
            noPadding={false}
            animationDelay={0.5}
            accentColor="red"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Ratio Rupture/Commandes" 
                value={breakRatio} 
                previousValue={prevBreakRatio}
                isPercentage
                accentColor="red"
                animationDelay={0.6}
                variant="minimal"
              />
              <DataBlock 
                title="Coût Moyen par Rupture" 
                value={breakCostPerUnit} 
                previousValue={prevBreakCostPerUnit}
                isCurrency
                accentColor="red"
                animationDelay={0.7}
                variant="minimal"
              />
            </div>
          </SummaryCard>
          
          {/* Note explicative */}
          <motion.div 
            variants={fadeInVariants}
            className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 flex items-start border border-red-100 shadow-sm"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-full p-3 mr-4 shadow-sm border border-red-100/50">
              <HiExclamationTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Impact des ruptures</h3>
              <p className="text-sm text-gray-600">
                Les ruptures de stock entraînent une perte de chiffre d'affaires directe, mais aussi indirecte par une dégradation de la satisfaction client. 
                Une analyse régulière permet d'optimiser votre approvisionnement.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnnualStockBreak2025;