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
  isRatio?: boolean; // Nouveau: pour indiquer si c'est un ratio achats/ventes
  accentColor?: "teal" | "blue" | "indigo" | "purple" | "rose" | "orange" | "gray" | "amber" | "emerald" | "red";
  size?: "sm" | "md" | "lg";
  animationDelay?: number;
  variant?: "default" | "outlined" | "glassmorphic" | "minimal" | "gradient";
}

const DataBlock: React.FC<DataBlockProps> = ({
  title,
  value,
  previousValue,
  isCurrency = false,
  isPercentage = false,
  isDecimal = false,
  isRatio = false,
  accentColor = "teal",
  size = "md",
  animationDelay = 0,
  variant = "default"
}) => {
  // Configuration des couleurs d'accent
  const colorConfig = {
    teal: {
      light: "bg-teal-50 text-teal-700 border-teal-200",
      medium: "bg-teal-100 text-teal-800",
      badge: {
        increase: "bg-teal-500 text-white",
        decrease: "bg-red-500 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-teal-500",
      shadow: "shadow-teal-100"
    },
    blue: {
      light: "bg-blue-50 text-blue-700 border-blue-200",
      medium: "bg-blue-100 text-blue-800",
      badge: {
        increase: "bg-blue-500 text-white",
        decrease: "bg-red-500 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-blue-500",
      shadow: "shadow-blue-100"
    },
    indigo: {
      light: "bg-indigo-50 text-indigo-700 border-indigo-200",
      medium: "bg-indigo-100 text-indigo-800",
      badge: {
        increase: "bg-indigo-500 text-white",
        decrease: "bg-red-500 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-indigo-500",
      shadow: "shadow-indigo-100"
    },
    purple: {
      light: "bg-purple-50 text-purple-700 border-purple-200",
      medium: "bg-purple-100 text-purple-800",
      badge: {
        increase: "bg-purple-500 text-white",
        decrease: "bg-red-500 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-purple-500",
      shadow: "shadow-purple-100"
    },
    rose: {
      light: "bg-rose-50 text-rose-700 border-rose-200",
      medium: "bg-rose-100 text-rose-800",
      badge: {
        increase: "bg-rose-500 text-white",
        decrease: "bg-red-500 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-rose-500",
      shadow: "shadow-rose-100"
    },
    orange: {
      light: "bg-orange-50 text-orange-700 border-orange-200",
      medium: "bg-orange-100 text-orange-800",
      badge: {
        increase: "bg-orange-500 text-white",
        decrease: "bg-red-500 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-orange-500",
      shadow: "shadow-orange-100"
    },
    amber: {
      light: "bg-amber-50 text-amber-700 border-amber-200",
      medium: "bg-amber-100 text-amber-800",
      badge: {
        increase: "bg-amber-500 text-white",
        decrease: "bg-red-500 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-amber-500",
      shadow: "shadow-amber-100"
    },
    emerald: {
      light: "bg-emerald-50 text-emerald-700 border-emerald-200",
      medium: "bg-emerald-100 text-emerald-800",
      badge: {
        increase: "bg-emerald-500 text-white",
        decrease: "bg-red-500 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-emerald-500",
      shadow: "shadow-emerald-100"
    },
    red: {
      light: "bg-red-50 text-red-700 border-red-200",
      medium: "bg-red-100 text-red-800",
      badge: {
        increase: "bg-red-500 text-white",
        decrease: "bg-red-600 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-red-500",
      shadow: "shadow-red-100"
    },
    gray: {
      light: "bg-gray-50 text-gray-700 border-gray-200",
      medium: "bg-gray-100 text-gray-800",
      badge: {
        increase: "bg-gray-500 text-white",
        decrease: "bg-red-500 text-white",
        neutral: "bg-gray-300 text-gray-700"
      },
      code: "text-gray-500",
      shadow: "shadow-gray-100"
    }
  };
  
  // Configuration des tailles
  const sizeConfig = {
    sm: {
      container: "p-3 gap-1.5",
      title: "text-xs",
      value: "text-xl",
      change: "text-xs py-0.5 px-1.5",
      comparisonValue: "text-xs",
      barHeight: "h-1"
    },
    md: {
      container: "p-4 gap-2",
      title: "text-sm",
      value: "text-2xl",
      change: "text-xs py-1 px-2",
      comparisonValue: "text-xs",
      barHeight: "h-1.5"
    },
    lg: {
      container: "p-5 gap-3",
      title: "text-base",
      value: "text-3xl",
      change: "text-sm py-1 px-2.5",
      comparisonValue: "text-sm",
      barHeight: "h-2"
    }
  };

  // Configuration des variantes
  const variantConfig = {
    default: {
      container: "bg-white border border-gray-100 shadow-sm",
      valueColor: "text-gray-900"
    },
    outlined: {
      container: `bg-white border-2 ${colorConfig[accentColor].light.replace("bg-", "border-")}`,
      valueColor: "text-gray-900"
    },
    glassmorphic: {
      container: "bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm",
      valueColor: "text-gray-900"
    },
    minimal: {
      container: "bg-transparent border-b border-gray-200",
      valueColor: "text-gray-900"
    },
    gradient: {
      container: `bg-gradient-to-br from-${accentColor}-500 to-${accentColor}-400 border-none shadow-md`,
      valueColor: "text-white"
    }
  };

  const sizes = sizeConfig[size] || sizeConfig.md;
  const colors = colorConfig[accentColor] || colorConfig.teal;
  const variantClasses = variantConfig[variant] || variantConfig.default;

  // Calcul du pourcentage de variation
  let percentageChange: number | null = null; 

  if (previousValue !== undefined && previousValue !== null) {
    if (previousValue === 0) {
      percentageChange = value > 0 ? 100 : 0;
    } else {
      percentageChange = ((value - previousValue) / previousValue) * 100;
    }
  }

  // Formatage de la valeur principale
  const getDisplayValue = () => {
    if (isRatio) {
      // Pour le ratio Achats/Ventes, afficher "X cts par €" pour plus de clarté
      return `${value.toFixed(1)} cts par €`;
    } else if (isDecimal) {
      return value.toFixed(2);
    } else if (isPercentage) {
      return `${value.toFixed(1)}%`;
    } else {
      return formatLargeNumber(value, isCurrency);
    }
  };
  
  // Formatage de la valeur précédente avec la même logique
  const getDisplayPreviousValue = () => {
    if (previousValue === undefined || previousValue === null) return null;
    
    if (isRatio) {
      return `${previousValue.toFixed(1)} cts par €`;
    } else if (isDecimal) {
      return previousValue.toFixed(2);
    } else if (isPercentage) {
      return `${previousValue.toFixed(1)}%`;
    } else {
      return formatLargeNumber(previousValue, isCurrency);
    }
  };

  const displayValue = getDisplayValue();
  const displayPreviousValue = getDisplayPreviousValue();

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

  const barVariants = {
    hidden: { width: 0 },
    visible: { 
      width: "60%",
      transition: { 
        delay: animationDelay + 0.4, 
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };

  // Détermine la couleur et l'icône en fonction de la variation
  const getChangeStyles = (change: number) => {
    // Pour les ratios, la logique est inversée (diminution = positif)
    const isRatioDecrease = isRatio && change < 0;
    const isRatioIncrease = isRatio && change > 0;
    
    if ((change > 0 && !isRatio) || isRatioDecrease) {
      return {
        bgColor: "bg-green-50",
        textColor: "text-green-600",
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-3 h-3"
          >
            <path 
              fillRule="evenodd" 
              d="M10 15a.75.75 0 01-.75-.75V7.612L6.295 10.44a.75.75 0 11-1.09-1.03l3.25-3.5a.75.75 0 011.09 0l3.25 3.5a.75.75 0 11-1.09 1.03l-2.955-2.828v6.638A.75.75 0 0110 15z" 
              clipRule="evenodd" 
            />
          </svg>
        )
      };
    } else if ((change < 0 && !isRatio) || isRatioIncrease) {
      return {
        bgColor: "bg-red-50",
        textColor: "text-red-600",
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-3 h-3"
          >
            <path 
              fillRule="evenodd" 
              d="M10 5a.75.75 0 01.75.75v6.638l2.955-2.828a.75.75 0 111.09 1.03l-3.25 3.5a.75.75 0 01-1.09 0l-3.25-3.5a.75.75 0 111.09-1.03L9.25 12.388V5.75A.75.75 0 0110 5z" 
              clipRule="evenodd" 
            />
          </svg>
        )
      };
    } else {
      return {
        bgColor: "bg-gray-50",
        textColor: "text-gray-600",
        icon: null
      };
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${variantClasses.container} ${sizes.container} rounded-xl flex flex-col hover:shadow-md transition-shadow duration-300`}
    >
      {/* Titre */}
      <h3 className={`${sizes.title} font-medium ${variant === 'gradient' ? 'text-white/80' : 'text-gray-500'} mb-1`}>{title}</h3>
      
      {/* Valeur principale avec animation */}
      <motion.div 
        variants={valueVariants}
        className="flex flex-col"
      >
        <span className={`${sizes.value} font-bold ${variantClasses.valueColor}`}>
          {displayValue}
        </span>
        
        {/* Variation et valeur précédente */}
        {percentageChange !== null && (
          <div className="flex items-center mt-2 gap-2">
            {/* Badge de variation */}
            <motion.div 
              className={`${getChangeStyles(percentageChange).bgColor} ${getChangeStyles(percentageChange).textColor} ${sizes.change}
                         flex items-center gap-1 rounded-full font-medium`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: animationDelay + 0.3, duration: 0.3 }}
            >
              {isRatio ? 
                // Pour les ratios, on inverse le signe pour clarifier l'interprétation (une baisse est positive)
                (percentageChange > 0 ? "" : "+") + Math.abs(percentageChange).toFixed(1) + "%"
                : 
                (percentageChange > 0 ? "+" : "") + percentageChange.toFixed(1) + "%"
              }
              {getChangeStyles(percentageChange).icon}
            </motion.div>
            
            {/* Valeur précédente */}
            {displayPreviousValue && (
              <div className={`${sizes.comparisonValue} ${variant === 'gradient' ? 'text-white/70' : 'text-gray-400'} h-5 min-h-[1.25rem]`}>
                vs {displayPreviousValue}
              </div>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Barre d'accent stylisée */}
      <div className={`mt-3 w-full ${colors.bar} ${sizes.barHeight} rounded-full overflow-hidden`}>
        <motion.div 
          className={`h-full rounded-full bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-400`}
          variants={barVariants}
          initial="hidden"
          animate="visible"
        />
      </div>
    </motion.div>
  );
};

export default DataBlock;