import React from 'react';
import { formatLargeNumber } from "@/libs/utils/formatUtils";

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
  // Fonction pour calculer l'évolution
  const getEvolution = (current: number, previous?: number) => {
    if (previous === undefined || previous === null) {
      return <span className="text-gray-500">N/A</span>;
    }
    
    if (previous === 0) {
      return current > 0 
        ? <span className="text-green-500">+100%</span> 
        : <span className="text-gray-500">0%</span>;
    }
  
    const percentage = ((current - previous) / previous) * 100;
    const isPositive = percentage >= 0;
  
    return (
      <span className={isPositive ? "text-green-500" : "text-red-500"}>
        {isNaN(percentage) || !isFinite(percentage) 
          ? "0%" 
          : (isPositive ? "+" : "") + percentage.toFixed(1) + "%"}
      </span>
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="text-sm font-medium">
        {formatLargeNumber(currentValue, formatAsPrice)}
      </div>
      {previousValue !== undefined && (
        <div className="text-xs mt-1">
          {getEvolution(currentValue, previousValue)}
        </div>
      )}
    </div>
  );
};

export default ValueWithEvolution;