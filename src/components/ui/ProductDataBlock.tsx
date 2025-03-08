// components/products/ProductDataBlock.tsx
import React from "react";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface ProductDataBlockProps {
  title: string;
  code: string;
  value: number;
  previousValue?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  extraValue?: number;
}

const ProductDataBlock: React.FC<ProductDataBlockProps> = ({
  title,
  code,
  value,
  previousValue,
  isCurrency = false,
  isPercentage = false,
  extraValue
}) => {
  // Calcul du pourcentage de variation
  let percentageChange: string = "N/A";
  let changeClass = "bg-gray-300 text-gray-700";

  if (previousValue !== undefined && previousValue !== null) {
    if (previousValue === 0) {
      percentageChange = value > 0 ? "+100%" : "0%";
      changeClass = value > 0 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700";
    } else {
      const change = ((value - previousValue) / previousValue) * 100;
      
      if (Number.isFinite(change)) {
        percentageChange = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
        changeClass = change > 0 
          ? "bg-green-500 text-white" 
          : change < 0 
            ? "bg-red-500 text-white" 
            : "bg-gray-300 text-gray-700";
      }
    }
  }

  // Fonction pour tronquer les noms trop longs
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="text-center mt-2 mb-4">
      {/* Valeur principale */}
      <p className="text-xl font-bold">
        {isPercentage 
          ? `${value.toFixed(1)} %` 
          : formatLargeNumber(value, isCurrency)
        }
      </p>
      
      {/* Code EAN-13 */}
      <p className="text-xs font-medium text-gray-600">{code}</p>
      
      {/* Nom du produit tronqué avec tooltip */}
      <p 
        className="text-sm opacity-80 truncate w-full mx-auto" 
        title={title}
      >
        {truncateText(title, 25)}
      </p>
      
      {/* Valeur supplémentaire (CA pour les produits en progression) */}
      {extraValue !== undefined && (
        <p className="text-sm font-medium text-gray-700">
          {formatLargeNumber(extraValue, true)}
        </p>
      )}
      
      {/* Variation en pourcentage */}
      {previousValue !== undefined && previousValue !== null && (
        <div className="flex items-center justify-center mt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${changeClass}`}>
            {percentageChange}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductDataBlock;