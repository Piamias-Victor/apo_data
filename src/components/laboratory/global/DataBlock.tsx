import React from "react";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface DataBlockProps {
  title: string;
  value: number;
  previousValue?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, previousValue, isCurrency = false, isPercentage = false }) => {
  const percentageChange =
  previousValue !== undefined && previousValue !== null && !isNaN(previousValue) && previousValue !== 0
    ? ((value - previousValue) / previousValue) * 100
    : value > 0 ? 100 : 0; // Si previousValue est 0, on affiche 100% d'évolution

  return (
    <div className="text-center">
      <p className="text-xl font-bold">
        {formatLargeNumber(value, isCurrency)} {isPercentage ? "%" : ""}
      </p>
      <p className="text-sm opacity-80">{title}</p>
      {previousValue !== undefined && previousValue !== null && (
        <div className="mt-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              percentageChange !== null && percentageChange > 0 ? "bg-green-400 text-white" 
              : percentageChange !== null && percentageChange < 0 ? "bg-red-400 text-white" 
              : "bg-gray-300 text-gray-700"
            }`}
          >
            {percentageChange !== null ? `${percentageChange.toFixed(1)}%` : "0%"}
          </span>
        </div>
      )}
    </div>
  );
};

export default DataBlock;