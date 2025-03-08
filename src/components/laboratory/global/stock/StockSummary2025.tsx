// StockSummary2025.tsx
import React from "react";
import { FaBoxOpen, FaChartPie } from "react-icons/fa";
import DataBlock from "../DataBlock";
import { useFilterContext } from "@/contexts/FilterContext";
import PeriodSelector from "@/components/ui/PeriodSelector";
import SummaryCard from "@/components/ui/SummaryCard";
import { StockMetrics } from "@/hooks/useStockData";

interface StockSummaryProps {
  currentPeriodData: StockMetrics;
  comparisonPeriodData: StockMetrics;
}

const StockSummary2025: React.FC<StockSummaryProps> = ({
  currentPeriodData,
  comparisonPeriodData
}) => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* Titre & Dates */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📊 Stock Périodique
        </h2>

        {/* Bloc des périodes */}
        <PeriodSelector 
          currentDateRange={dateRange} 
          comparisonDateRange={comparisonDateRange} 
          bgColor="bg-indigo-500"
          hoverColor="hover:bg-indigo-600"
        />
      </div>

      {/* Contenu */}
      <div className="grid grid-cols-2 gap-10 mt-6 relative z-10">
        {/* STOCK TOTAL */}
        <SummaryCard 
          title="Stock Total" 
          icon={<FaBoxOpen className="mr-2" />} 
          iconColor="text-indigo-600"
        >
          <div className="grid grid-cols-2 gap-6">
            <DataBlock
              title="Stock Moyen"
              value={currentPeriodData.avgStock}
              previousValue={comparisonPeriodData.avgStock}
            />
            <DataBlock
              title="Valeur du Stock"
              value={currentPeriodData.stockValue}
              previousValue={comparisonPeriodData.stockValue}
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
              value={currentPeriodData.monthsOfStock}
              previousValue={comparisonPeriodData.monthsOfStock}
              isDecimal
            />
            <DataBlock
              title="% Valeur / CA"
              value={currentPeriodData.stockValuePercentage}
              previousValue={comparisonPeriodData.stockValuePercentage}
              isPercentage
            />
          </div>
        </SummaryCard>
      </div>
    </div>
  );
};

export default StockSummary2025;