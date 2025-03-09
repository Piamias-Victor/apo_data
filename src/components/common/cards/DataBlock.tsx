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
  accentColor?: "teal" | "blue" | "indigo" | "purple" | "rose" | "orange" | "gray" | "amber" | "emerald";
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
  accentColor = "teal",
  size = "md",
  animationDelay = 0,
  variant = "default"
}) => {
  // Configuration des couleurs d'accent
  const colorConfig = {
    teal: {
      light: "bg-teal-50 text-teal-600 border-teal-200",
      medium: "bg-teal-100 text-teal-700 border-teal-300",
      dark: "bg-teal-600 text-white border-teal-700",
      gradient: "from-teal-500 to-teal-400",
      increase: "bg-teal-50 text-teal-600",
      badge: "bg-teal-100 text-teal-700",
      bar: "bg-teal-500/20"
    },
    blue: {
      light: "bg-blue-50 text-blue-600 border-blue-200",
      medium: "bg-blue-100 text-blue-700 border-blue-300",
      dark: "bg-blue-600 text-white border-blue-700",
      gradient: "from-blue-500 to-blue-400",
      increase: "bg-blue-50 text-blue-600",
      badge: "bg-blue-100 text-blue-700",
      bar: "bg-blue-500/20"
    },
    indigo: {
      light: "bg-indigo-50 text-indigo-600 border-indigo-200",
      medium: "bg-indigo-100 text-indigo-700 border-indigo-300",
      dark: "bg-indigo-600 text-white border-indigo-700",
      gradient: "from-indigo-500 to-indigo-400",
      increase: "bg-indigo-50 text-indigo-600",
      badge: "bg-indigo-100 text-indigo-700",
      bar: "bg-indigo-500/20"
    },
    purple: {
      light: "bg-purple-50 text-purple-600 border-purple-200",
      medium: "bg-purple-100 text-purple-700 border-purple-300",
      dark: "bg-purple-600 text-white border-purple-700",
      gradient: "from-purple-500 to-purple-400",
      increase: "bg-purple-50 text-purple-600",
      badge: "bg-purple-100 text-purple-700",
      bar: "bg-purple-500/20"
    },
    rose: {
      light: "bg-rose-50 text-rose-600 border-rose-200",
      medium: "bg-rose-100 text-rose-700 border-rose-300",
      dark: "bg-rose-600 text-white border-rose-700",
      gradient: "from-rose-500 to-rose-400",
      increase: "bg-rose-50 text-rose-600",
      badge: "bg-rose-100 text-rose-700",
      bar: "bg-rose-500/20"
    },
    orange: {
      light: "bg-orange-50 text-orange-600 border-orange-200",
      medium: "bg-orange-100 text-orange-700 border-orange-300",
      dark: "bg-orange-600 text-white border-orange-700",
      gradient: "from-orange-500 to-orange-400",
      increase: "bg-orange-50 text-orange-600",
      badge: "bg-orange-100 text-orange-700",
      bar: "bg-orange-500/20"
    },
    amber: {
      light: "bg-amber-50 text-amber-600 border-amber-200",
      medium: "bg-amber-100 text-amber-700 border-amber-300",
      dark: "bg-amber-600 text-white border-amber-700",
      gradient: "from-amber-500 to-amber-400",
      increase: "bg-amber-50 text-amber-600",
      badge: "bg-amber-100 text-amber-700",
      bar: "bg-amber-500/20"
    },
    emerald: {
      light: "bg-emerald-50 text-emerald-600 border-emerald-200",
      medium: "bg-emerald-100 text-emerald-700 border-emerald-300",
      dark: "bg-emerald-600 text-white border-emerald-700",
      gradient: "from-emerald-500 to-emerald-400",
      increase: "bg-emerald-50 text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
      bar: "bg-emerald-500/20"
    },
    gray: {
      light: "bg-gray-50 text-gray-600 border-gray-200",
      medium: "bg-gray-100 text-gray-700 border-gray-300",
      dark: "bg-gray-600 text-white border-gray-700",
      gradient: "from-gray-500 to-gray-400",
      increase: "bg-gray-50 text-gray-600",
      badge: "bg-gray-100 text-gray-700",
      bar: "bg-gray-500/20"
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
      container: `bg-gradient-to-br ${colorConfig[accentColor].gradient} border-none shadow-md`,
      valueColor: "text-white"
    }
  };

  const sizes = sizeConfig[size];
  const colors = colorConfig[accentColor];
  const variantClasses = variantConfig[variant];

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
    if (change > 0) {
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
    } else if (change < 0) {
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
              {percentageChange > 0 && '+'}
              {percentageChange.toFixed(1)}%
              {getChangeStyles(percentageChange).icon}
            </motion.div>
            
            {/* Valeur précédente */}
            {displayPreviousValue && (
              <span className={`${sizes.comparisonValue} ${variant === 'gradient' ? 'text-white/70' : 'text-gray-400'}`}>
                vs {displayPreviousValue}
              </span>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Barre d'accent stylisée */}
      <div className={`mt-3 w-full ${colors.bar} ${sizes.barHeight} rounded-full overflow-hidden`}>
        <motion.div 
          className={`h-full rounded-full bg-gradient-to-r ${colorConfig[accentColor].gradient}`}
          variants={barVariants}
          initial="hidden"
          animate="visible"
        />
      </div>
    </motion.div>
  );
};

export default DataBlock;