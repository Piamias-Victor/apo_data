import Loader from "@/components/common/feedback/Loader";
import { useStockData } from "@/hooks/data/useStockData";
import { useStockForecast } from "@/hooks/ui/useStockForecast";
import ForecastSummary2025 from "./ForecastSummary2025";
import StockDataMonthly from "./StockDataMonthly";
import StockSummary2025 from "./StockSummary2025";

const StockDataComponent: React.FC = () => {
  // Récupération des données de stock
  const { 
    stockSalesData, 
    loading, 
    error, 
    hasSelectedData,
    completeForecast,
    metrics 
  } = useStockData();

  // Calculs de prévisions
  const { 
    forecastPercentage, 
    setForecastPercentage, 
    forecastMetrics 
  } = useStockForecast(completeForecast, hasSelectedData);

  // Afficher différents états selon les données
  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!stockSalesData || stockSalesData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      <StockSummary2025 
        currentPeriodData={metrics.current} 
        comparisonPeriodData={metrics.adjusted} 
      />

      <ForecastSummary2025
        forecastValues={forecastMetrics}
        previousYearValues={metrics.global}
        forecastPercentage={forecastPercentage}
        setForecastPercentage={setForecastPercentage}
      />

      <StockDataMonthly 
        stockData={stockSalesData} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default StockDataComponent;