// hooks/useMetricsData.ts
import { useState, useEffect } from "react";
import { useFilterContext } from "@/contexts/FilterContext";

export interface MetricsData {
  month: string;
  avg_sale_price: number;
  avg_purchase_price: number;
  avg_margin: number;
  avg_margin_percentage: number;
  unique_products_sold: number;
  unique_selling_pharmacies: number;
}

export interface MetricsValues {
  avgSalePrice: number;
  avgPurchasePrice: number;
  avgMargin: number;
  avgMarginPercentage: number;
  uniqueProductsSold: number;
  uniqueSellingPharmacies: number;
}

export function useMetricsData() {
  const { filters } = useFilterContext();
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Métriques pour l'année en cours (2025)
  const [metrics2025, setMetrics2025] = useState<MetricsValues>({
    avgSalePrice: 0,
    avgPurchasePrice: 0,
    avgMargin: 0,
    avgMarginPercentage: 0,
    uniqueProductsSold: 0,
    uniqueSellingPharmacies: 0
  });
  
  // Métriques ajustées pour l'année précédente (2024), jusqu'au mois courant
  const [adjustedMetrics2024, setAdjustedMetrics2024] = useState<MetricsValues>({
    avgSalePrice: 0,
    avgPurchasePrice: 0,
    avgMargin: 0,
    avgMarginPercentage: 0,
    uniqueProductsSold: 0,
    uniqueSellingPharmacies: 0
  });
  
  // Métriques globales pour l'année précédente complète (2024)
  const [globalMetrics2024, setGlobalMetrics2024] = useState<MetricsValues>({
    avgSalePrice: 0,
    avgPurchasePrice: 0,
    avgMargin: 0,
    avgMarginPercentage: 0,
    uniqueProductsSold: 0,
    uniqueSellingPharmacies: 0
  });

  // Vérifier si des filtres sont sélectionnés
  const hasSelectedData = 
    filters.distributors.length > 0 ||
    filters.brands.length > 0 ||
    filters.universes.length > 0 ||
    filters.categories.length > 0 ||
    filters.families.length > 0 ||
    filters.specificities.length > 0 || 
    filters.ean13Products.length > 0;

  useEffect(() => {
    if (!hasSelectedData) return;
    
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/getMetricsByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        const data = result.priceMarginData || [];
        setMetricsData(data);

        // Récupérer l'année actuelle et l'année précédente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = new Date().getMonth() + 1;

        // Filtrer les données par année
        const metrics2025Data = data.filter((d: MetricsData) => d.month.startsWith(`${currentYear}-`));
        const metrics2024Data = data.filter((d: MetricsData) => d.month.startsWith(`${previousYear}-`));
        
        // Calcul des métriques pour 2025
        if (metrics2025Data.length > 0) {
          const latestMetrics = metrics2025Data[metrics2025Data.length - 1];
          setMetrics2025({
            avgSalePrice: latestMetrics.avg_sale_price,
            avgPurchasePrice: latestMetrics.avg_purchase_price,
            avgMargin: latestMetrics.avg_margin,
            avgMarginPercentage: latestMetrics.avg_margin_percentage,
            uniqueProductsSold: latestMetrics.unique_products_sold,
            uniqueSellingPharmacies: latestMetrics.unique_selling_pharmacies
          });
        }
        
        // Calcul des métriques globales pour 2024
        if (metrics2024Data.length > 0) {
          const count = metrics2024Data.length;
          
          const totalAvgSalePrice = metrics2024Data.reduce((acc, cur) => acc + (cur.avg_sale_price || 0), 0);
          const totalAvgPurchasePrice = metrics2024Data.reduce((acc, cur) => acc + (cur.avg_purchase_price || 0), 0);
          const totalAvgMargin = metrics2024Data.reduce((acc, cur) => acc + (cur.avg_margin || 0), 0);
          const totalAvgMarginPercentage = metrics2024Data.reduce((acc, cur) => acc + (cur.avg_margin_percentage || 0), 0);
          const totalUniqueProductsSold = metrics2024Data.reduce((acc, cur) => acc + (cur.unique_products_sold || 0), 0);
          const totalUniqueSellingPharmacies = metrics2024Data.reduce((acc, cur) => acc + (cur.unique_selling_pharmacies || 0), 0);
          
          setGlobalMetrics2024({
            avgSalePrice: totalAvgSalePrice / count,
            avgPurchasePrice: totalAvgPurchasePrice / count,
            avgMargin: totalAvgMargin / count,
            avgMarginPercentage: totalAvgMarginPercentage / count,
            uniqueProductsSold: totalUniqueProductsSold / count,
            uniqueSellingPharmacies: totalUniqueSellingPharmacies / count
          });
          
          // Filtrer les données de 2024 jusqu'au mois courant pour les métriques ajustées
          const monthsUpToCurrent = Array.from({ length: currentMonth }, (_, i) => 
            (i + 1).toString().padStart(2, "0"));
            
          const adjustedMetrics2024Data = metrics2024Data.filter((d: MetricsData) => {
            const month = d.month.split("-")[1];
            return monthsUpToCurrent.includes(month);
          });
          
          if (adjustedMetrics2024Data.length > 0) {
            const adjustedCount = adjustedMetrics2024Data.length;
            
            const adjustedTotalAvgSalePrice = adjustedMetrics2024Data.reduce((acc, cur) => acc + (cur.avg_sale_price || 0), 0);
            const adjustedTotalAvgPurchasePrice = adjustedMetrics2024Data.reduce((acc, cur) => acc + (cur.avg_purchase_price || 0), 0);
            const adjustedTotalAvgMargin = adjustedMetrics2024Data.reduce((acc, cur) => acc + (cur.avg_margin || 0), 0);
            const adjustedTotalAvgMarginPercentage = adjustedMetrics2024Data.reduce((acc, cur) => acc + (cur.avg_margin_percentage || 0), 0);
            const adjustedTotalUniqueProductsSold = adjustedMetrics2024Data.reduce((acc, cur) => acc + (cur.unique_products_sold || 0), 0);
            const adjustedTotalUniqueSellingPharmacies = adjustedMetrics2024Data.reduce((acc, cur) => acc + (cur.unique_selling_pharmacies || 0), 0);
            
            setAdjustedMetrics2024({
              avgSalePrice: adjustedTotalAvgSalePrice / adjustedCount,
              avgPurchasePrice: adjustedTotalAvgPurchasePrice / adjustedCount,
              avgMargin: adjustedTotalAvgMargin / adjustedCount,
              avgMarginPercentage: adjustedTotalAvgMarginPercentage / adjustedCount,
              uniqueProductsSold: adjustedTotalUniqueProductsSold / adjustedCount,
              uniqueSellingPharmacies: adjustedTotalUniqueSellingPharmacies / adjustedCount
            });
          }
        }
      } catch (err) {
        setError("Impossible de récupérer les données");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [filters, hasSelectedData]);

  return {
    metricsData,
    loading,
    error,
    hasSelectedData,
    metrics: {
      current: metrics2025,
      adjusted: adjustedMetrics2024,
      global: globalMetrics2024
    }
  };
}