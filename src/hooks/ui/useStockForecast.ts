// hooks/useStockForecast.ts
import { useState, useEffect } from "react";
import { StockSalesData, StockMetrics } from "../data/useStockData";

export function useStockForecast(
  completeForecast: StockSalesData[], 
  hasSelectedData: boolean
) {
  const [forecastPercentage, setForecastPercentage] = useState(0);
  const [forecastMetrics, setForecastMetrics] = useState<StockMetrics>({
    avgStock: 0,
    stockValue: 0,
    monthsOfStock: 0,
    stockValuePercentage: 0
  });

  useEffect(() => {
    if (!hasSelectedData || !completeForecast || completeForecast.length === 0) {
      // Réinitialiser les métriques si aucune donnée n'est disponible
      setForecastMetrics({
        avgStock: 0,
        stockValue: 0,
        monthsOfStock: 0,
        stockValuePercentage: 0
      });
      return;
    }
  
    try {
      // Fonction utilitaire pour calculer les sommes en toute sécurité
      const parseNumber = (value: any): number => isNaN(parseFloat(value)) ? 0 : parseFloat(value);
      
      // Calculer les totaux prévisionnels
      const forecastAvgStock = completeForecast.length > 0
        ? completeForecast.reduce((acc, cur) => acc + parseNumber(cur.total_avg_stock), 0) / completeForecast.length
        : 0;
        
      const forecastStockValue = completeForecast.length > 0
        ? completeForecast.reduce((acc, cur) => acc + parseNumber(cur.total_stock_value), 0) / completeForecast.length
        : 0;
        
      const totalForecastRevenue = completeForecast.reduce(
        (acc, cur) => acc + parseNumber(cur.total_revenue), 0
      );
      
      // Appliquer le pourcentage d'évolution
      const growthFactor = 1 + (Number(forecastPercentage) / 100);
      
      const projectedAvgStock = forecastAvgStock * growthFactor;
      const projectedStockValue = forecastStockValue * growthFactor;
      
      // Calculer les métriques dérivées
      const projectedMonthsOfStock = totalForecastRevenue > 0 
        ? projectedStockValue / (totalForecastRevenue / 12) 
        : 0;
        
      const projectedStockValuePercentage = totalForecastRevenue > 0 
        ? (projectedStockValue / totalForecastRevenue) * 100 
        : 0;
      
      // Mettre à jour les métriques avec vérification
      setForecastMetrics({
        avgStock: isFinite(projectedAvgStock) ? projectedAvgStock : 0,
        stockValue: isFinite(projectedStockValue) ? projectedStockValue : 0,
        monthsOfStock: isFinite(projectedMonthsOfStock) ? projectedMonthsOfStock : 0,
        stockValuePercentage: isFinite(projectedStockValuePercentage) ? projectedStockValuePercentage : 0
      });
    } catch (error) {
      console.error("Erreur dans le calcul des prévisions:", error);
      // Réinitialiser les métriques en cas d'erreur
      setForecastMetrics({
        avgStock: 0,
        stockValue: 0,
        monthsOfStock: 0,
        stockValuePercentage: 0
      });
    }
    
  }, [completeForecast, forecastPercentage, hasSelectedData]);

  return {
    forecastPercentage,
    setForecastPercentage,
    forecastMetrics
  };
}