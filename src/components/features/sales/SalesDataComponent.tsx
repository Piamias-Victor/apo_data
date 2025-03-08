import React from "react";
import AnnualSummary2025 from "./AnnualSummary2025";
import ForecastSummary2025 from "./ForecastSummary2025";
import SalesDataMonthly from "./SalesDataMonthly";
import Loader from "@/components/common/feedback/Loader";
import { useSalesData } from "@/hooks/data/useSalesData";
import { useForecastCalculation } from "@/hooks/ui/useForecastCalculation";


const SalesDataComponent: React.FC = () => {
  // Récupération des données de ventes
  const { 
    salesData, 
    loading, 
    error, 
    hasSelectedData,
    metrics 
  } = useSalesData();

  // Calculs de prévisions
  const { 
    forecastPercentage, 
    setForecastPercentage, 
    forecastMetrics 
  } = useForecastCalculation(salesData, hasSelectedData);

  // Afficher différents états selon les données
  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!salesData || salesData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      <AnnualSummary2025 
        currentPeriodData={metrics.current} 
        comparisonPeriodData={metrics.adjusted} 
      />

      <ForecastSummary2025
        forecastValues={forecastMetrics}
        previousYearValues={metrics.global}
        forecastPercentage={forecastPercentage}
        setForecastPercentage={setForecastPercentage}
      />

      <SalesDataMonthly 
        salesData={salesData} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default SalesDataComponent;