// MetricsDataComponent.tsx
import React from "react";
import Loader from "@/components/ui/Loader";
import AnnualMetrics2025 from "./AnnualMetrics2025";
import MetricsDataMonthly from "./MetricsDataMonthly";
import { useMetricsData } from "@/hooks/useMetricsData";

const MetricsDataComponent: React.FC = () => {
  // Récupération des données de métriques
  const { 
    metricsData, 
    loading, 
    error, 
    hasSelectedData,
    metrics
  } = useMetricsData();

  // Afficher différents états selon les données
  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!metricsData || metricsData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      <AnnualMetrics2025 
        currentPeriodData={metrics.current} 
        comparisonPeriodData={metrics.adjusted} 
      />

      <MetricsDataMonthly 
        metricsData={metricsData} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default MetricsDataComponent;