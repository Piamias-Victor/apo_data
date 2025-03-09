// hooks/useMetricsData.ts
import { useFilterContext } from "@/contexts/FilterContext";
import { useState, useEffect } from "react";

export interface MetricsData {
  month: string;
  avg_sale_price: string | number;
  avg_purchase_price: string | number;
  avg_margin: string | number;
  avg_margin_percentage: string | number;
  unique_products_sold: string | number;
  unique_selling_pharmacies: string | number;
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

  // Fonction utilitaire pour convertir en nombre
  const toNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Vérifier si des filtres sont sélectionnés
  const hasSelectedData = 
    filters.distributors.length > 0 ||
    filters.brands.length > 0 ||
    filters.universes.length > 0 ||
    filters.categories.length > 0 ||
    filters.families.length > 0 ||
    filters.specificities.length > 0 || 
    filters.ean13Products.length > 0;

  // Fonction de calcul des métriques agrégées
  const calculateAggregatedMetrics = (data: MetricsData[]): MetricsValues => {
    if (data.length === 0) {
      return {
        avgSalePrice: 0,
        avgPurchasePrice: 0,
        avgMargin: 0,
        avgMarginPercentage: 0,
        uniqueProductsSold: 0,
        uniqueSellingPharmacies: 0
      };
    }

    // Conversion explicite des valeurs
    const processedData = data.map(item => ({
      ...item,
      avg_sale_price: toNumber(item.avg_sale_price),
      avg_purchase_price: toNumber(item.avg_purchase_price),
      avg_margin: toNumber(item.avg_margin),
      avg_margin_percentage: toNumber(item.avg_margin_percentage),
      unique_products_sold: toNumber(item.unique_products_sold),
      unique_selling_pharmacies: toNumber(item.unique_selling_pharmacies)
    }));

    // Calcul des moyennes simples
    return {
      avgSalePrice: Number((
        processedData.reduce((sum, item) => sum + item.avg_sale_price, 0) / 
        processedData.length
      ).toFixed(2)),
      avgPurchasePrice: Number((
        processedData.reduce((sum, item) => sum + item.avg_purchase_price, 0) / 
        processedData.length
      ).toFixed(2)),
      avgMargin: Number((
        processedData.reduce((sum, item) => sum + item.avg_margin, 0) / 
        processedData.length
      ).toFixed(2)),
      avgMarginPercentage: Number((
        processedData.reduce((sum, item) => sum + item.avg_margin_percentage, 0) / 
        processedData.length
      ).toFixed(2)),
      uniqueProductsSold: Math.round(
        processedData.reduce((sum, item) => sum + item.unique_products_sold, 0) / 
        processedData.length
      ),
      uniqueSellingPharmacies: Math.round(
        processedData.reduce((sum, item) => sum + item.unique_selling_pharmacies, 0) / 
        processedData.length
      )
    };
  };

  useEffect(() => {
    if (!hasSelectedData) {
      setLoading(false);
      return;
    }
    
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/metric/getMetricsByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Vérification explicite des données
        if (!result || !result.priceMarginData || !Array.isArray(result.priceMarginData)) {
          throw new Error("Données de métriques invalides ou manquantes");
        }

        const data = result.priceMarginData;
        setMetricsData(data);

        // Récupérer l'année actuelle et l'année précédente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = new Date().getMonth() + 1;

        // Filtrer les données par année
        const currentYearData = data.filter(d => d.month.startsWith(`${currentYear}-`));
        const previousYearData = data.filter(d => d.month.startsWith(`${previousYear}-`));

        // Calcul des métriques pour 2025
        setMetrics2025(calculateAggregatedMetrics(currentYearData));
        
        // Calcul des métriques globales pour 2024
        setGlobalMetrics2024(calculateAggregatedMetrics(previousYearData));
        
        // Filtrer les données de 2024 jusqu'au mois courant
        const monthsUpToCurrent = Array.from({ length: currentMonth }, (_, i) => 
          (i + 1).toString().padStart(2, "0"));
        
        const adjustedPreviousYearData = previousYearData.filter(d => {
          const month = d.month.split("-")[1];
          return monthsUpToCurrent.includes(month);
        });
        
        // Calcul des métriques ajustées pour 2024
        setAdjustedMetrics2024(calculateAggregatedMetrics(adjustedPreviousYearData));

      } catch (err) {
        console.error("Erreur lors de la récupération des données de métriques:", err);
        setError(err instanceof Error ? err.message : "Impossible de récupérer les données");
        
        // Réinitialiser toutes les métriques
        setMetrics2025({
          avgSalePrice: 0,
          avgPurchasePrice: 0,
          avgMargin: 0,
          avgMarginPercentage: 0,
          uniqueProductsSold: 0,
          uniqueSellingPharmacies: 0
        });
        setAdjustedMetrics2024({
          avgSalePrice: 0,
          avgPurchasePrice: 0,
          avgMargin: 0,
          avgMarginPercentage: 0,
          uniqueProductsSold: 0,
          uniqueSellingPharmacies: 0
        });
        setGlobalMetrics2024({
          avgSalePrice: 0,
          avgPurchasePrice: 0,
          avgMargin: 0,
          avgMarginPercentage: 0,
          uniqueProductsSold: 0,
          uniqueSellingPharmacies: 0
        });
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