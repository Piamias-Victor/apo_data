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
    previousValue !== undefined && previousValue !== 0
      ? ((value - previousValue) / previousValue) * 100
      : NaN;

  return (
    <div className="text-center">
      <p className="text-xl font-bold">
        {formatLargeNumber(value, isCurrency)} {isPercentage ? "%" : ""}
      </p>
      <p className="text-sm opacity-80">{title}</p>
      {previousValue !== undefined && (
        <div className="mt-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              percentageChange > 0 ? "bg-green-400 text-white" : percentageChange < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            {!isNaN(percentageChange) ? `${percentageChange.toFixed(1)}%` : "N/A"}
          </span>
        </div>
      )}
    </div>
  );
};

export default DataBlock;