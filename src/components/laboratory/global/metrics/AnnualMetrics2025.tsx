import React from "react";
import { FaTag, FaStore, FaChartLine } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface AnnualMetricsProps {
  avgSalePrice: number;
  prevAvgSalePrice: number;
  avgPurchasePrice: number;
  prevAvgPurchasePrice: number;
  avgMargin: number;
  prevAvgMargin: number;
  avgMarginPercentage: number;
  prevAvgMarginPercentage: number;
  uniqueProductsSold: number;
  prevUniqueProductsSold: number;
  uniqueSellingPharmacies: number;
  prevUniqueSellingPharmacies: number;
}

const AnnualMetrics2025: React.FC<AnnualMetricsProps> = ({
  avgSalePrice,
  prevAvgSalePrice,
  avgPurchasePrice,
  prevAvgPurchasePrice,
  avgMargin,
  prevAvgMargin,
  avgMarginPercentage,
  prevAvgMarginPercentage,
  uniqueProductsSold,
  prevUniqueProductsSold,
  uniqueSellingPharmacies,
  prevUniqueSellingPharmacies,
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Résumé Annuel (2025)</h2>
        <p className="text-sm opacity-80">Comparé à l'année précédente</p>
      </div>

      {/* 📈 Indicateurs Clés */}
      <div>
        <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
          <FaChartLine className="mr-2" /> Indicateurs Clés
        </h3>

        {/* 🌟 Nouvelle disposition en **2 colonnes équilibrées** */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DataBlock title="Prix Vente Moyen" value={avgSalePrice} previousValue={prevAvgSalePrice} isCurrency />
          <DataBlock title="Prix Achat Moyen" value={avgPurchasePrice} previousValue={prevAvgPurchasePrice} isCurrency />
          <DataBlock title="Marge Moyenne" value={avgMargin} previousValue={prevAvgMargin} isCurrency />
          <DataBlock title="Marge %" value={avgMarginPercentage} previousValue={prevAvgMarginPercentage} isPercentage />
          <DataBlock title="Réfs Vendues" value={uniqueProductsSold} previousValue={prevUniqueProductsSold} />
          <DataBlock title="Pharmacies" value={uniqueSellingPharmacies} previousValue={prevUniqueSellingPharmacies} />
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
  isPercentage?: boolean;
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, previousValue, isCurrency = false, isPercentage = false }) => {
  const percentageChange =
    previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : NaN;

  return (
    <div className="text-center">
      <p className="text-xl font-bold">
        {formatLargeNumber(value, isCurrency)}{isPercentage ? "%" : ""}
      </p>
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

export default AnnualMetrics2025;