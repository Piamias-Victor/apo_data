// AnnualMetrics2025.tsx
import React from "react";
import { FaChartLine, FaStore } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import DataBlock from "../DataBlock";
import PeriodSelector from "@/components/ui/PeriodSelector";
import SummaryCard from "@/components/ui/SummaryCard";
import { MetricsValues } from "@/hooks/useMetricsData";

interface AnnualMetricsProps {
  currentPeriodData: MetricsValues;
  comparisonPeriodData: MetricsValues;
}

const AnnualMetrics2025: React.FC<AnnualMetricsProps> = ({
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
          📊 Résumé Annuel
        </h2>

        {/* Bloc des périodes */}
        <PeriodSelector 
          currentDateRange={dateRange} 
          comparisonDateRange={comparisonDateRange} 
          bgColor="bg-violet-500"
          hoverColor="hover:bg-violet-600"
        />
      </div>

      {/* Contenu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 relative z-10">
        {/* INDICATEURS CLÉS */}
        <SummaryCard 
          title="Indicateurs Clés" 
          icon={<FaChartLine className="mr-2" />} 
          iconColor="text-violet-600"
        >
          <div className="grid grid-cols-2 gap-6">
            <DataBlock 
              title="Prix Vente Moyen" 
              value={currentPeriodData.avgSalePrice} 
              previousValue={comparisonPeriodData.avgSalePrice} 
              isCurrency 
            />
            <DataBlock 
              title="Prix Achat Moyen" 
              value={currentPeriodData.avgPurchasePrice} 
              previousValue={comparisonPeriodData.avgPurchasePrice} 
              isCurrency 
            />
            <DataBlock 
              title="Marge Moyenne" 
              value={currentPeriodData.avgMargin} 
              previousValue={comparisonPeriodData.avgMargin} 
              isCurrency 
            />
            <DataBlock 
              title="Marge %" 
              value={currentPeriodData.avgMarginPercentage} 
              previousValue={comparisonPeriodData.avgMarginPercentage} 
              isPercentage 
            />
          </div>
        </SummaryCard>

        {/* STOCK & DISTRIBUTION */}
        <SummaryCard 
          title="Stock & Distribution" 
          icon={<FaStore className="mr-2" />} 
          iconColor="text-violet-600"
        >
          <div className="grid grid-cols-2 gap-6">
            <DataBlock 
              title="Réfs Vendues" 
              value={currentPeriodData.uniqueProductsSold} 
              previousValue={comparisonPeriodData.uniqueProductsSold} 
            />
            <DataBlock 
              title="Pharmacies" 
              value={currentPeriodData.uniqueSellingPharmacies} 
              previousValue={comparisonPeriodData.uniqueSellingPharmacies} 
            />
          </div>
        </SummaryCard>
      </div>
    </div>
  );
};

export default AnnualMetrics2025;