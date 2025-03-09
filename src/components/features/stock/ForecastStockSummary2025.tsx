import React from "react";
import { motion } from "framer-motion";
import { HiChartBar, HiArchiveBox, HiClock, HiCurrencyDollar, HiSparkles } from "react-icons/hi2";
import DataBlock from "@/components/common/cards/DataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import PercentageControl from "@/components/common/inputs/PercentageControl";

// Types pour les prévisions
interface StockForecastValues {
  avgStock: number;
  stockValue: number;
  monthsOfStock: number;
  stockValuePercentage: number;
}

interface ForecastStockSummaryProps {
  forecastValues: StockForecastValues;
  previousYearValues: StockForecastValues;
  forecastPercentage: number;
  setForecastPercentage: (value: number) => void;
}

/**
 * Composant présentant les prévisions de stock pour 2025
 */
const ForecastStockSummary2025: React.FC<ForecastStockSummaryProps> = ({
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
  
  // Calcul de la valeur moyenne par unité en stock
  const avgStockUnitValue = forecastValues.avgStock > 0 
    ? forecastValues.stockValue / forecastValues.avgStock 
    : 0;
  
  const prevAvgStockUnitValue = previousYearValues.avgStock > 0
    ? previousYearValues.stockValue / previousYearValues.avgStock
    : 0;

  // Calcul du capital immobilisé estimé (basé sur la valeur du stock)
  const immobilizedCapital = forecastValues.stockValue;
  const prevImmobilizedCapital = previousYearValues.stockValue;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
    >
      {/* Header section */}
      <div className="relative p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-blue-50">
        {/* Accents décoratifs */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-500"></div>
        <div className="absolute -top-5 right-10 w-40 h-40 bg-indigo-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl"></div>
        
        {/* Entête avec titre et contrôle de pourcentage */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200/70">
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
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Prévisions Stock 2025
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
            accentColor="indigo"
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
          className="mt-4 p-3 bg-white/60 backdrop-blur-sm border border-indigo-100/40 rounded-lg text-xs text-gray-600 max-w-lg"
        >
          <p>
            <span className="font-medium text-indigo-600">Note:</span> Ajustez le pourcentage pour voir l'impact sur les prévisions. 
            Les valeurs sont calculées à partir des données historiques avec l'évolution spécifiée.
          </p>
        </motion.div>
      </div>

      {/* Content section */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* STOCK TOTAL FORECAST CARD */}
          <SummaryCard 
            title="Stock Total Prévisionnel" 
            icon={<HiArchiveBox className="w-5 h-5" />}
            iconColor="text-indigo-500"
            variant="glassmorphic"
            accentColor="indigo"
            animationDelay={0.1}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Stock Moyen" 
                value={forecastValues.avgStock} 
                previousValue={previousYearValues.avgStock} 
                accentColor="indigo"
                animationDelay={0.2}
                variant="minimal"
              />
              <DataBlock 
                title="Valeur du Stock" 
                value={forecastValues.stockValue} 
                previousValue={previousYearValues.stockValue} 
                isCurrency 
                accentColor="indigo"
                animationDelay={0.3}
                variant="minimal"
              />
            </div>
            
            {/* Bloc supplémentaire pour la valeur moyenne par unité */}
            <div className="mt-4 pt-3 border-t border-indigo-50">
              <DataBlock 
                title="Valeur Moyenne par Unité"
                value={avgStockUnitValue}
                previousValue={prevAvgStockUnitValue}
                isCurrency
                accentColor="indigo"
                animationDelay={0.4}
                variant="outlined"
                size="sm"
              />
            </div>
          </SummaryCard>

          {/* DÉTAILS STOCK FORECAST CARD */}
          <SummaryCard 
            title="Détails Stock Prévisionnel" 
            icon={<HiClock className="w-5 h-5" />}
            iconColor="text-blue-500"
            variant="glassmorphic"
            accentColor="blue"
            animationDelay={0.2}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DataBlock 
                title="Mois de Stock" 
                value={forecastValues.monthsOfStock} 
                previousValue={previousYearValues.monthsOfStock} 
                isDecimal
                accentColor="blue"
                animationDelay={0.3}
                variant="minimal"
              />
              <DataBlock 
                title="% Valeur / CA" 
                value={forecastValues.stockValuePercentage} 
                previousValue={previousYearValues.stockValuePercentage} 
                isPercentage 
                accentColor="blue"
                animationDelay={0.4}
                variant="minimal"
              />
            </div>
            
            {/* Bloc supplémentaire pour l'impact financier */}
            <div className="mt-4 pt-3 border-t border-blue-50">
              <DataBlock 
                title="Capital Immobilisé Estimé"
                value={immobilizedCapital}
                previousValue={prevImmobilizedCapital}
                isCurrency
                accentColor="blue"
                animationDelay={0.5}
                variant="outlined"
                size="sm"
              />
            </div>
          </SummaryCard>
        </div>
        
        {/* Indicateur de pourcentage d'évolution */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className={`mt-6 p-4 rounded-lg text-sm text-center font-medium ${
            forecastPercentage > 0 
              ? "bg-blue-50 text-blue-600 border border-blue-100" 
              : forecastPercentage < 0 
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-gray-50 text-gray-600 border border-gray-100"
          }`}
        >
          {forecastPercentage > 0 ? (
            <>
              <span className="inline-block mr-2">📈</span>
              Prévision d'augmentation des stocks de <span className="font-bold">+{forecastPercentage}%</span> par rapport à l'année précédente
            </>
          ) : forecastPercentage < 0 ? (
            <>
              <span className="inline-block mr-2">📉</span>
              Prévision de réduction des stocks de <span className="font-bold">{forecastPercentage}%</span> par rapport à l'année précédente
            </>
          ) : (
            <>
              <span className="inline-block mr-2">⚖️</span>
              Prévision de stocks équivalents à l'année précédente
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ForecastStockSummary2025;