import { formatLargeNumber } from '@/libs/formatUtils';
import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface ValueWithEvolutionProps {
  currentValue: number;
  previousValue?: number;
  formatAsPrice?: boolean;
  className?: string;
}

/**
 * Composant qui affiche une valeur avec son évolution par rapport à une période précédente
 */
const ValueWithEvolution: React.FC<ValueWithEvolutionProps> = ({
  currentValue,
  previousValue,
  formatAsPrice = true,
  className = '',
}) => {
  // Calculer l'évolution en pourcentage
  const calculateEvolution = (current: number, previous?: number) => {
    if (previous === undefined || previous === null) {
      return { value: null, isPositive: false };
    }
    
    if (previous === 0) {
      return { 
        value: current > 0 ? 100 : 0, 
        isPositive: current > 0 
      };
    }
  
    const percentage = ((current - previous) / previous) * 100;
    const isPositive = percentage >= 0;
  
    // Vérifier si le pourcentage est valide
    if (isNaN(percentage) || !isFinite(percentage)) {
      return { value: 0, isPositive: false };
    }
    
    return { value: percentage, isPositive };
  };

  const evolution = calculateEvolution(currentValue, previousValue);

  // Animations pour l'apparition des valeurs
  const valueVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const evolutionVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { delay: 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Valeur actuelle formatée */}
      <motion.div 
        className="text-base font-medium text-gray-800"
        variants={valueVariants}
        initial="hidden"
        animate="visible"
      >
        {formatLargeNumber(currentValue, formatAsPrice)}
      </motion.div>
      
      {/* Indicateur d'évolution */}
      {evolution.value !== null && (
        <motion.div 
          className="flex justify-center mt-1.5"
          variants={evolutionVariants}
          initial="hidden"
          animate="visible"
        >
          <div 
            className={`
              flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full
              ${
                evolution.value === 0
                  ? "bg-gray-100 text-gray-600"
                  : evolution.isPositive
                    ? "bg-green-50 text-green-600 shadow-sm shadow-green-100"
                    : "bg-red-50 text-red-600 shadow-sm shadow-red-100"
              }
            `}
          >
            {evolution.value === 0 ? (
              "0%"
            ) : (
              <>
                {evolution.isPositive ? "+" : ""}
                {evolution.value.toFixed(1)}%
                {evolution.value !== 0 && (
                  <span className="ml-1">
                    {evolution.isPositive ? (
                      <FaArrowUp className="w-2.5 h-2.5" />
                    ) : (
                      <FaArrowDown className="w-2.5 h-2.5" />
                    )}
                  </span>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ValueWithEvolution;