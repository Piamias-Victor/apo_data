// components/products/ProductDataBlock.tsx
import { formatLargeNumber } from "@/libs/formatUtils";
import React from "react";
import { motion } from "framer-motion";

interface ProductDataBlockProps {
  title: string;
  code: string;
  value: number;
  previousValue?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  extraValue?: number;
  accentColor?: "teal" | "blue" | "indigo" | "purple" | "rose" | "orange" | "gray" | "amber" | "emerald";
  variant?: "default" | "outlined" | "glassmorphic" | "minimal";
  animationDelay?: number;
}

const ProductDataBlock: React.FC<ProductDataBlockProps> = ({
  title,
  code,
  value,
  previousValue,
  isCurrency = false,
  isPercentage = false,
  extraValue,
  accentColor = "teal",
  variant = "default",
  animationDelay = 0
}) => {
  // Configuration des couleurs
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

  // Configuration des variantes
  const variantConfig = {
    default: `bg-white border border-gray-100 shadow-sm hover:shadow-md`,
    outlined: `bg-white border-2 ${colorConfig[accentColor].light.replace("bg-", "border-")} hover:shadow-md`,
    glassmorphic: `bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md`,
    minimal: `bg-white border-b-2 ${colorConfig[accentColor].light.replace("bg-", "border-")} hover:shadow-sm`
  };

  // Calcul du pourcentage de variation
  let percentageChange: string = "N/A";
  let changeClass = "bg-gray-300 text-gray-700";

  if (previousValue !== undefined && previousValue !== null) {
    if (previousValue === 0) {
      percentageChange = value > 0 ? "+100%" : "0%";
      changeClass = value > 0 
        ? colorConfig[accentColor].badge.increase 
        : colorConfig[accentColor].badge.neutral;
    } else {
      const change = ((value - previousValue) / previousValue) * 100;
      
      if (Number.isFinite(change)) {
        percentageChange = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
        changeClass = change > 0 
          ? colorConfig[accentColor].badge.increase 
          : change < 0 
            ? colorConfig[accentColor].badge.decrease 
            : colorConfig[accentColor].badge.neutral;
      }
    }
  }

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

  // Animation badge
  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: "easeOut", 
        delay: animationDelay + 0.3
      }
    }
  };

  // Fonction pour tronquer les noms trop longs
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <motion.div 
      className={`text-center mt-2 mb-4 p-4 rounded-xl ${variantConfig[variant]} transition-all duration-300`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {/* Code EAN-13 */}
      <p className={`text-xs font-medium ${colorConfig[accentColor].code} mb-1`}>{code}</p>
      
      {/* Nom du produit tronqué avec tooltip */}
      <p 
        className="text-sm opacity-80 truncate w-full mx-auto font-medium text-gray-600 mb-2" 
        title={title}
      >
        {truncateText(title, 25)}
      </p>
      
      {/* Valeur principale */}
      <p className="text-xl font-bold text-gray-800 mb-1">
        {isPercentage 
          ? `${value.toFixed(1)} %` 
          : formatLargeNumber(value, isCurrency)
        }
      </p>
      
      {/* Valeur supplémentaire (CA pour les produits en progression) */}
      {extraValue !== undefined && (
        <p className="text-sm font-medium text-gray-700 mb-2">
          {formatLargeNumber(extraValue, true)}
        </p>
      )}
      
      {/* Variation en pourcentage */}
      {previousValue !== undefined && previousValue !== null && (
        <div className="flex items-center justify-center mt-2">
          <motion.span 
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${changeClass}`}
            variants={badgeVariants}
          >
            {percentageChange}
            {percentageChange !== "N/A" && percentageChange !== "0%" && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className={`w-3 h-3 ml-1 ${percentageChange.startsWith("+") ? "" : "transform rotate-180"}`}
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 15a.75.75 0 01-.75-.75V7.612L6.295 10.44a.75.75 0 11-1.09-1.03l3.25-3.5a.75.75 0 011.09 0l3.25 3.5a.75.75 0 11-1.09 1.03l-2.955-2.828v6.638A.75.75 0 0110 15z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </motion.span>
        </div>
      )}
    </motion.div>
  );
};

export default ProductDataBlock;