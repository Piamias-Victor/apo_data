import React from "react";
import { FaTag, FaStore, FaChartLine } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface AnnualMetricsProps {
  avgSalePrice: number;
  avgPurchasePrice: number;
  avgMargin: number;
  avgMarginPercentage: number;
  uniqueProductsSold: number;
  uniqueSellingPharmacies: number;
}

const AnnualMetrics2024: React.FC<AnnualMetricsProps> = ({
  avgSalePrice,
  avgPurchasePrice,
  avgMargin,
  avgMarginPercentage,
  uniqueProductsSold,
  uniqueSellingPharmacies,
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Résumé Annuel (2024)</h2>
        <p className="text-sm opacity-80">Du 1er Janvier au 31 Décembre 2024</p>
      </div>

      {/* 📈 Indicateurs Clés */}
      <div>
        <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
          <FaChartLine className="mr-2" /> Indicateurs Clés
        </h3>

        {/* 🌟 Nouvelle disposition en **2 colonnes équilibrées** */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DataBlock title="Prix Vente Moyen" value={avgSalePrice} isCurrency />
          <DataBlock title="Prix Achat Moyen" value={avgPurchasePrice} isCurrency />
          <DataBlock title="Marge Moyenne" value={avgMargin} isCurrency />
          <DataBlock title="Marge %" value={avgMarginPercentage} isPercentage />
          <DataBlock title="Réfs Vendues" value={uniqueProductsSold} />
          <DataBlock title="Pharmacies" value={uniqueSellingPharmacies} />
        </div>
      </div>
    </div>
  );
};

interface DataBlockProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, isCurrency = false, isPercentage = false }) => {
    // ✅ Vérification : Si la valeur est NaN ou infinie, on affiche "N/A"
    const formattedValue =
      isNaN(value) || !isFinite(value) ? "N/A" : isPercentage ? `${value.toFixed(2)}%` : formatLargeNumber(value, isCurrency);
  
    return (
      <div className="text-center">
        <p className="text-xl font-bold">{formattedValue}</p>
        <p className="text-sm opacity-80">{title}</p>
      </div>
    );
  };

export default AnnualMetrics2024;