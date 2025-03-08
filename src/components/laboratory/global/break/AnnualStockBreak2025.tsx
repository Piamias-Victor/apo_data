// AnnualStockBreak2025.tsx
import React from "react";
import DataBlock from "../DataBlock";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BreakMetrics } from "@/hooks/useStockBreakData";
import PeriodSelector from "@/components/ui/PeriodSelector";
import SummaryCard from "@/components/ui/SummaryCard";

interface AnnualStockBreakProps {
  currentPeriodData: BreakMetrics;
  comparisonPeriodData: BreakMetrics;
}

const AnnualStockBreak2025: React.FC<AnnualStockBreakProps> = ({
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
          📊 Taux de Rupture
        </h2>

        {/* Bloc des périodes */}
        <PeriodSelector 
          currentDateRange={dateRange} 
          comparisonDateRange={comparisonDateRange} 
          bgColor="bg-red-500"
          hoverColor="hover:bg-red-600"
        />
      </div>

      {/* Contenu */}
      <div className="grid grid-cols-4 gap-6 mt-6 relative z-10">
        {/* Produits commandés */}
        <SummaryCard title="📦 Produits Commandés" icon={null} iconColor="text-red-600">
          <DataBlock 
            title="Total" 
            value={currentPeriodData.productOrder} 
            previousValue={comparisonPeriodData.productOrder} 
          />
        </SummaryCard>

        {/* Produits en rupture */}
        <SummaryCard title="❌ Produits en Rupture" icon={null} iconColor="text-red-600">
          <DataBlock 
            title="Total" 
            value={currentPeriodData.breakProduct} 
            previousValue={comparisonPeriodData.breakProduct} 
          />
        </SummaryCard>

        {/* Taux de Rupture */}
        <SummaryCard title="📊 Taux de Rupture" icon={null} iconColor="text-red-600">
          <DataBlock 
            title="Taux %" 
            value={currentPeriodData.breakRate} 
            previousValue={comparisonPeriodData.breakRate} 
            isPercentage 
          />
        </SummaryCard>

        {/* Montant des Ruptures */}
        <SummaryCard title="💰 Montant Rupture (€)" icon={null} iconColor="text-red-600">
          <DataBlock 
            title="Montant" 
            value={currentPeriodData.breakAmount} 
            previousValue={comparisonPeriodData.breakAmount} 
            isCurrency 
          />
        </SummaryCard>
      </div>
    </div>
  );
};

export default AnnualStockBreak2025;