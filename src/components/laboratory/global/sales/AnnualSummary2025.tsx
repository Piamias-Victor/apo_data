import React from "react";
import { FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface AnnualSummaryProps {
  totalSellOut: number;
  totalRevenue: number;
  totalMargin: number;
  totalSellIn: number;
  totalPurchaseAmount: number;
  adjustedSellOut2024: number;
  adjustedRevenue2024: number;
  adjustedMargin2024: number;
  adjustedSellIn2024: number;
  adjustedPurchaseAmount2024: number;
}

const AnnualSummary2025: React.FC<AnnualSummaryProps> = ({
  totalSellOut,
  totalRevenue,
  totalMargin,
  totalSellIn,
  totalPurchaseAmount,
  adjustedSellOut2024,
  adjustedRevenue2024,
  adjustedMargin2024,
  adjustedSellIn2024,
  adjustedPurchaseAmount2024,
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Résumé Annuel (2025)</h2>
        <p className="text-sm opacity-80">Du 1er Janvier à aujourd'hui</p>
      </div>

      {/* 🟢 Contenu avec deux colonnes */}
      <div className="grid grid-cols-2 gap-8">
        {/* 🔵 SELL-OUT */}
        <div className="border-r border-white pr-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaShoppingCart className="mr-2" /> Sell-Out
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <DataBlock
              title="Volume"
              value={totalSellOut}
              previousValue={adjustedSellOut2024}
            />
            <DataBlock
              title="CA"
              value={totalRevenue}
              previousValue={adjustedRevenue2024}
              isCurrency
            />
            <DataBlock
              title="Marge"
              value={totalMargin}
              previousValue={adjustedMargin2024}
              isCurrency
            />
          </div>
        </div>

        {/* 🟠 SELL-IN */}
        <div className="pl-6">
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaBoxOpen className="mr-2" /> Sell-In
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DataBlock
              title="Volume"
              value={totalSellIn}
              previousValue={adjustedSellIn2024}
            />
            <DataBlock
              title="Montant"
              value={totalPurchaseAmount}
              previousValue={adjustedPurchaseAmount2024}
              isCurrency
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DataBlockProps {
  title: string;
  value: number;
  previousValue: number;
  isCurrency?: boolean;
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, previousValue, isCurrency = false }) => {
  const percentageChange =
    previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : NaN;

  return (
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(value, isCurrency)}</p>
      <p className="text-sm opacity-80">{title}</p>
      <div className="flex items-center justify-center mt-2">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
            percentageChange > 0
              ? "bg-green-400 text-white"
              : percentageChange < 0
              ? "bg-red-400 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          {!isNaN(percentageChange) ? `${percentageChange.toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>
  );
};

export default AnnualSummary2025;