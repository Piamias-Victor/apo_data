import React from "react";
import { motion } from "framer-motion";
import { HiChartBar, HiExclamationTriangle, HiShoppingBag, HiCurrencyDollar, HiSparkles } from "react-icons/hi2";
import DataBlock from "@/components/common/cards/DataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import PercentageControl from "@/components/common/inputs/PercentageControl";

// Types pour les prévisions
interface BreakValues {
  productOrder: number;
  breakProduct: number;
  breakRate: number;
  breakAmount: number;
}

interface ForecastStockBreakProps {
  forecastValues: BreakValues;
  previousYearValues: BreakValues;
  forecastPercentage: number;
  setForecastPercentage: (value: number) => void;
}

/**
 * Composant présentant les prévisions de ruptures de stock pour 2025
 */
const ForecastStockBreak2025: React.FC<ForecastStockBreakProps> = ({
  forecastValues,
  previousYearValues,
  forecastPercentage,
  setForecastPercentage,
}) => {
  // Variantes d'animation
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
  
  const sparkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: [0, 1.2, 1],
      opacity: [0, 1, 1],
      transition: { 
        delay: 0.3, 
        duration: 0.6,
        times: [0, 0.7, 1]
      }
    }
  };
  
  // Calcul du ratio de rupture
  const breakRatio = forecastValues.productOrder > 0 
    ? (forecastValues.breakProduct / forecastValues.productOrder) * 100 
    : 0;
  
  const prevBreakRatio = previousYearValues.productOrder > 0
    ? (previousYearValues.breakProduct / previousYearValues.productOrder) * 100
    : 0;

  // Calcul du coût moyen par rupture
  const breakCostPerUnit = forecastValues.breakProduct > 0 
    ? forecastValues.breakAmount / forecastValues.breakProduct
    : 0;
    
  const prevBreakCostPerUnit = previousYearValues.breakProduct > 0
    ? previousYearValues.breakAmount / previousYearValues.breakProduct
    : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
    >
      {/* Header section */}
      <div className="relative p-6 md:p-8 bg-gradient-to-br from-rose-50 to-amber-50">
        {/* Accents décoratifs */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-amber-500"></div>
        <div className="absolute -top-5 right-10 w-40 h-40 bg-rose-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl"></div>
        
        {/* Entête avec titre et contrôle de pourcentage */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="w-12 h-12 rounded-full bg-rose-100/80 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200/70">
                <HiChartBar className="w-6 h-6" />
              </div>
              <motion.div 
                variants={sparkVariants}
                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center"
              >
                <HiSparkles className="text-yellow-400" />
              </motion.div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                Prévisions Ruptures 2025
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Projections basées sur les données historiques
              </p>
            </div>
          </div>

          {/* Contrôle du pourcentage */}
          <PercentageControl 
            value={forecastPercentage}
            onChange={setForecastPercentage}
            min={-100}
            max={100}
            accentColor="rose"
            size="md"
            withAnimation={true}
            variant="glassmorphic"
            withShadow={true}
          />
        </div>
        
        {/* Légende des prévisions */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-4 p-3 bg-white/60 backdrop-blur-sm border border-rose-100/40 rounded-lg text-xs text-gray-600 max-w-lg"
        >
          <p>
            <span className="font-medium text-rose-600">Note:</span> Ajustez le pourcentage pour voir l'impact sur les prévisions de ruptures. 
            Un pourcentage négatif indique une réduction des ruptures attendue.
          </p>
        </motion.div>
      </div>

      {/* Content section */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6">
          {/* PRODUITS COMMANDÉS */}
          <SummaryCard 
            title="Produits Commandés" 
            icon={<HiShoppingBag className="w-5 h-5" />}
            iconColor="text-purple-500"
            variant="glassmorphic"
            accentColor="purple"
            animationDelay={0.1}
          >
            <DataBlock 
              title="Prévision" 
              value={forecastValues.productOrder} 
              previousValue={previousYearValues.productOrder} 
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
            accentColor="red"
            animationDelay={0.2}
          >
            <DataBlock 
              title="Prévision" 
              value={forecastValues.breakProduct} 
              previousValue={previousYearValues.breakProduct} 
              accentColor="red"
              animationDelay={0.3}
              variant="minimal"
            />
          </SummaryCard>

          {/* TAUX DE RUPTURE */}
          <SummaryCard 
            title="Taux de Rupture" 
            icon={<HiChartBar className="w-5 h-5" />}
            iconColor="text-amber-500"
            variant="glassmorphic"
            accentColor="amber"
            animationDelay={0.3}
          >
            <DataBlock 
              title="Pourcentage" 
              value={forecastValues.breakRate} 
              previousValue={previousYearValues.breakRate} 
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
            accentColor="orange"
            animationDelay={0.4}
          >
            <DataBlock 
              title="Montant" 
              value={forecastValues.breakAmount} 
              previousValue={previousYearValues.breakAmount} 
              isCurrency
              accentColor="orange"
              animationDelay={0.5}
              variant="minimal"
            />
          </SummaryCard>
        </div>

        {/* Section supplémentaire de métriques calculées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {/* Métriques dérivées */}
          <SummaryCard 
            title="Métriques Prévisionnelles" 
            icon={<HiSparkles className="w-5 h-5" />}
            iconColor="text-rose-500"
            variant="glassmorphic"
            accentColor="rose"
            animationDelay={0.5}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Ratio Rupture/Commandes" 
                value={breakRatio} 
                previousValue={prevBreakRatio}
                isPercentage
                accentColor="rose"
                animationDelay={0.6}
                variant="minimal"
              />
              <DataBlock 
                title="Coût Moyen par Rupture" 
                value={breakCostPerUnit} 
                previousValue={prevBreakCostPerUnit}
                isCurrency
                accentColor="rose"
                animationDelay={0.7}
                variant="minimal"
              />
            </div>
          </SummaryCard>
          
          {/* Indicateur de pourcentage d'évolution */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className={`bg-white rounded-xl shadow-sm border p-6 flex items-center ${
              forecastPercentage > 0 
                ? "border-red-200" 
                : forecastPercentage < 0 
                  ? "border-green-200"
                  : "border-gray-200"
            }`}
          >
            <div className={`rounded-full p-3 mr-4 shadow-sm flex-shrink-0 ${
              forecastPercentage > 0 
                ? "bg-red-50 text-red-600" 
                : forecastPercentage < 0 
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-50 text-gray-600"
            }`}>
              {forecastPercentage > 0 ? (
                <HiExclamationTriangle className="w-6 h-6" />
              ) : forecastPercentage < 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${
                forecastPercentage > 0 
                  ? "text-red-700" 
                  : forecastPercentage < 0 
                    ? "text-green-700"
                    : "text-gray-700"
              }`}>
                {forecastPercentage > 0 ? (
                  <>
                    Augmentation prévue des ruptures de <span className="font-bold">+{forecastPercentage}%</span>
                  </>
                ) : forecastPercentage < 0 ? (
                  <>
                    Réduction prévue des ruptures de <span className="font-bold">{forecastPercentage}%</span>
                  </>
                ) : (
                  <>
                    Stabilité des ruptures prévue pour l'année à venir
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {forecastPercentage > 0 
                  ? "Envisagez des actions d'amélioration des approvisionnements." 
                  : forecastPercentage < 0 
                    ? "Continuez les bonnes pratiques d'approvisionnement."
                    : "Maintenez votre stratégie d'approvisionnement actuelle."}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForecastStockBreak2025;