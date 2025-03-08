import React from "react";
import { motion } from "framer-motion";
import { formatLargeNumber } from "@/libs/formatUtils";

export interface DataBlockProps {
  title: string;
  value: number;
  previousValue?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  isDecimal?: boolean;
  accentColor?: "teal" | "blue" | "indigo" | "purple" | "rose" | "orange" | "gray";
  size?: "sm" | "md" | "lg";
  animationDelay?: number;
}

const DataBlock: React.FC<DataBlockProps> = ({
  title,
  value,
  previousValue,
  isCurrency = false,
  isPercentage = false,
  isDecimal = false,
  accentColor = "teal",
  size = "md",
  animationDelay = 0
}) => {
  // Configuration des couleurs d'accent
  const colorConfig = {
    teal: "from-teal-500 to-teal-400 text-teal-600 bg-teal-50 border-teal-200",
    blue: "from-blue-500 to-blue-400 text-blue-600 bg-blue-50 border-blue-200",
    indigo: "from-indigo-500 to-indigo-400 text-indigo-600 bg-indigo-50 border-indigo-200",
    purple: "from-purple-500 to-purple-400 text-purple-600 bg-purple-50 border-purple-200",
    rose: "from-rose-500 to-rose-400 text-rose-600 bg-rose-50 border-rose-200",
    orange: "from-orange-500 to-orange-400 text-orange-600 bg-orange-50 border-orange-200",
    gray: "from-gray-500 to-gray-400 text-gray-600 bg-gray-50 border-gray-200"
  };
  
  // Configuration des tailles
  const sizeConfig = {
    sm: {
      container: "p-3",
      title: "text-xs",
      value: "text-xl",
      change: "text-xs"
    },
    md: {
      container: "p-4",
      title: "text-sm",
      value: "text-2xl",
      change: "text-sm"
    },
    lg: {
      container: "p-5",
      title: "text-base",
      value: "text-3xl",
      change: "text-sm"
    }
  };

  const sizes = sizeConfig[size];
  const colors = colorConfig[accentColor];

  // Calcul de la variation en pourcentage
  let percentageChange: number | null = null; 

  if (previousValue !== undefined && previousValue !== null) {
    if (previousValue === 0) {
      percentageChange = value > 0 ? 100 : 0;
    } else {
      percentageChange = ((value - previousValue) / previousValue) * 100;
    }
  }

  // Formatage de la valeur principale
  const displayValue = isDecimal 
    ? value.toFixed(2)
    : isPercentage 
    ? `${value.toFixed(1)}%` 
    : formatLargeNumber(value, isCurrency);
    
  // Formatage de la valeur précédente
  const displayPreviousValue = previousValue !== undefined && previousValue !== null
    ? isPercentage 
      ? `${previousValue.toFixed(1)}%` 
      : formatLargeNumber(previousValue, isCurrency)
    : null;

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut", 
        delay: animationDelay
      }
    }
  };

  const valueVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.4, 
        delay: animationDelay + 0.2, 
        ease: "easeOut" 
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${sizes.container} rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300`}
    >
      {/* Titre */}
      <h3 className={`${sizes.title} font-medium text-gray-500 mb-1`}>{title}</h3>
      
      {/* Valeur principale avec animation */}
      <motion.div 
        variants={valueVariants}
        className="flex flex-col"
      >
        <span className={`${sizes.value} font-bold text-gray-900`}>
          {displayValue}
        </span>
        
        {/* Variation et valeur précédente */}
        {percentageChange !== null && (
          <div className="flex items-center mt-2 gap-2">
            <div 
              className={`px-2 py-1 rounded-full ${sizes.change} font-medium flex items-center gap-1 ${
                percentageChange > 0 
                  ? 'bg-green-50 text-green-600' 
                  : percentageChange < 0 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              {percentageChange > 0 && '+'}
              {percentageChange.toFixed(1)}%
              
              {percentageChange !== 0 && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className={`w-3 h-3 ${percentageChange > 0 ? 'rotate-0' : 'rotate-180'}`}
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </div>
            
            {displayPreviousValue && (
              <span className="text-xs text-gray-400">
                vs {displayPreviousValue}
              </span>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Barre d'accent stylisée */}
      <div className="mt-3 w-full h-1 rounded-full overflow-hidden bg-gray-100">
        <motion.div 
          className={`h-full rounded-full bg-gradient-to-r ${colors}`}
          initial={{ width: 0 }}
          animate={{ width: "60%" }}
          transition={{ delay: animationDelay + 0.4, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

export default DataBlock;