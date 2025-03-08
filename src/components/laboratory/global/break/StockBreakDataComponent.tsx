// StockBreakDataComponent.tsx
import React from "react";
import Loader from "@/components/ui/Loader";
import AnnualStockBreak2025 from "./AnnualStockBreak2025";
import ForecastStockBreak2025 from "./ForecastStockBreak2025";
import StockBreakDataMonthly from "./StockBreakDataMonthly";
import { useStockBreakData } from "@/hooks/useStockBreakData";
import { useStockBreakForecast } from "@/hooks/useStockBreakForecast";

const StockBreakDataComponent: React.FC = () => {
  // Récupération des données de ruptures
  const { 
    stockBreakData, 
    loading, 
    error, 
    hasSelectedData,
    completeForecast,
    metrics 
  } = useStockBreakData();

  // Calculs de prévisions
  const { 
    forecastPercentage, 
    setForecastPercentage, 
    forecastMetrics 
  } = useStockBreakForecast(completeForecast, hasSelectedData);

  // Afficher différents états selon les données
  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!stockBreakData || stockBreakData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      <AnnualStockBreak2025 
        currentPeriodData={metrics.current} 
        comparisonPeriodData={metrics.adjusted} 
      />

      <ForecastStockBreak2025
        forecastValues={forecastMetrics}
        previousYearValues={metrics.global}
        forecastPercentage={forecastPercentage}
        setForecastPercentage={setForecastPercentage}
      />

      <StockBreakDataMonthly 
        stockBreakData={stockBreakData} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default StockBreakDataComponent;