import { formatLargeNumber } from "@/libs/formatUtils";
import React from "react";

export interface DataBlockProps {
  title: string;
  value: number;
  previousValue?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, previousValue, isCurrency = false, isPercentage = false }) => {
  let percentageChange: number | string = "N/A"; // Valeur par défaut

  const previousNumber = Number(previousValue);

  if (previousNumber !== undefined && previousValue !== null) {
    if (previousNumber === 0) {
      percentageChange = value > 0 ? "+100%" : "0%"; // Si `previousValue` est 0, on évite `Infinity%`
    } else {
      percentageChange = ((value - previousNumber) / previousNumber) * 100;
      percentageChange = Number(percentageChange.toFixed(1)); // ✅ Convertir en nombre avant d'afficher
      percentageChange = `${percentageChange}%`;
    }
  }

  return (
    <div className="text-center">
      {/* 🔹 Valeur actuelle */}
      <p className="text-xl font-bold">
        {formatLargeNumber(value, isCurrency)} {isPercentage ? "%" : ""}
      </p>
      <p className="text-sm opacity-80">{title}</p>

      {/* 🔺 Variation en pourcentage */}
      {previousValue !== undefined && previousValue !== null && (
        <div className="flex items-center justify-center mt-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
              typeof percentageChange === "string" && percentageChange.includes("-")
                ? "bg-red-400 text-white"
                : percentageChange !== "N/A" && percentageChange !== "0%"
                ? "bg-green-400 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {percentageChange}
          </span>
        </div>
      )}

      {/* 🔸 Valeur de comparaison */}
      <p className="text-sm font-semibold opacity-80 py-1">
        {previousValue !== undefined && previousValue !== null
          ? formatLargeNumber(previousValue, isCurrency)
          : "--"}
      </p>
    </div>
  );
};

export default DataBlock;