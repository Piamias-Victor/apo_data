// ForecastSummary2025.tsx (pour la section stock)
import React from "react";
import { FaBoxOpen, FaChartPie } from "react-icons/fa";
import DataBlock from "../DataBlock";
import PercentageControl from "@/components/ui/PercentageControl";
import SummaryCard from "@/components/ui/SummaryCard";

// Séparation de l'interface en sous-interfaces plus précises
interface StockForecastValues {
  avgStock: number;
  stockValue: number;
  monthsOfStock: number;
  stockValuePercentage: number;
}

interface ForecastSummaryProps {
  forecastValues: StockForecastValues;
  previousYearValues: StockForecastValues;
  forecastPercentage: number;
  setForecastPercentage: (value: number) => void;
}

const ForecastSummary2025: React.FC<ForecastSummaryProps> = ({
  forecastValues,
  previousYearValues,
  forecastPercentage,
  setForecastPercentage,
}) => {
  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* Titre & Contrôle du pourcentage */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🔮 Prévisions Stock 2025
        </h2>

        <PercentageControl 
          value={forecastPercentage}
          onChange={setForecastPercentage}
          min={-100}
          max={100}
          accentColor="text-indigo-600"
        />
      </div>

      {/* Section de prévisions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-6 relative z-10">
        {/* STOCK TOTAL */}
        <SummaryCard 
          title="Stock Total"
          icon={<FaBoxOpen className="mr-2" />}
          iconColor="text-indigo-600"
        >
          <div className="grid grid-cols-2 gap-6">
            <DataBlock
              title="Stock Moyen"
              value={forecastValues.avgStock}
              previousValue={previousYearValues.avgStock}
            />
            <DataBlock
              title="Valeur du Stock"
              value={forecastValues.stockValue}
              previousValue={previousYearValues.stockValue}
              isCurrency
            />
          </div>
        </SummaryCard>

        {/* DÉTAILS STOCK */}
        <SummaryCard 
          title="Détails Stock"
          icon={<FaChartPie className="mr-2" />}
          iconColor="text-indigo-600"
        >
          <div className="grid grid-cols-2 gap-6">
            <DataBlock
              title="Mois de Stock"
              value={forecastValues.monthsOfStock}
              previousValue={previousYearValues.monthsOfStock}
              isDecimal
            />
            <DataBlock
              title="% Valeur / CA"
              value={forecastValues.stockValuePercentage}
              previousValue={previousYearValues.stockValuePercentage}
              isPercentage
            />
          </div>
        </SummaryCard>
      </div>
    </div>
  );
};

export default ForecastSummary2025;