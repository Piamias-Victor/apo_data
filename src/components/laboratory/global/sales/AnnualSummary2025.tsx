// AnnualSummary2025.tsx
import React from "react";
import { FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import DataBlock from "../DataBlock";

import Loader from "@/components/ui/Loader";
import PeriodSelector from "@/components/ui/PeriodSelector";
import SummaryCard from "@/components/ui/SummaryCard";
import { usePeriodSalesData } from "@/hooks/usePeriodSalesData";

const AnnualSummary2025: React.FC = () => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;
  const { currentPeriod, comparisonPeriod, loading, error } = usePeriodSalesData();

  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* Titre & Dates */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📊 Résumé Périodique
        </h2>

        {/* Bloc des périodes */}
        <PeriodSelector 
          currentDateRange={dateRange} 
          comparisonDateRange={comparisonDateRange} 
        />
      </div>

      {/* Affichage du statut de chargement / erreur */}
      {loading ? (
        <Loader text="Chargement des données..." />
      ) : error ? (
        <p className="text-center text-red-500 mt-6">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-6 relative z-10">
          {/* SELL-OUT */}
          <SummaryCard title="Sell-Out" icon={<FaShoppingCart className="mr-2" />}>
            <div className="grid grid-cols-3 gap-6">
              <DataBlock 
                title="Volume" 
                value={currentPeriod?.total_quantity || 0} 
                previousValue={comparisonPeriod?.total_quantity || 0} 
              />
              <DataBlock 
                title="CA" 
                value={currentPeriod?.revenue || 0} 
                previousValue={comparisonPeriod?.revenue || 0} 
                isCurrency 
              />
              <DataBlock 
                title="Marge" 
                value={currentPeriod?.margin || 0} 
                previousValue={comparisonPeriod?.margin || 0} 
                isCurrency 
              />
            </div>
          </SummaryCard>

          {/* SELL-IN */}
          <SummaryCard title="Sell-In" icon={<FaBoxOpen className="mr-2" />}>
            <div className="grid grid-cols-2 gap-6">
              <DataBlock 
                title="Volume" 
                value={currentPeriod?.purchase_quantity || 0} 
                previousValue={comparisonPeriod?.purchase_quantity || 0} 
              />
              <DataBlock 
                title="Montant" 
                value={currentPeriod?.purchase_amount || 0} 
                previousValue={comparisonPeriod?.purchase_amount || 0} 
                isCurrency 
              />
            </div>
          </SummaryCard>
        </div>
      )}
    </div>
  );
};

export default AnnualSummary2025;