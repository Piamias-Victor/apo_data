// hooks/useStockBreakForecast.ts
import { useState, useEffect } from "react";
import { StockBreakData, BreakMetrics } from "../data/useStockBreakData";

export function useStockBreakForecast(
  completeForecast: StockBreakData[], 
  hasSelectedData: boolean
) {
  const [forecastPercentage, setForecastPercentage] = useState(0);
  const [forecastMetrics, setForecastMetrics] = useState<BreakMetrics>({
    productOrder: 0,
    breakProduct: 0,
    breakRate: 0,
    breakAmount: 0
  });

  useEffect(() => {
    if (!hasSelectedData || !completeForecast || completeForecast.length === 0) {
      // Réinitialiser les métriques si aucune donnée n'est disponible
      setForecastMetrics({
        productOrder: 0,
        breakProduct: 0,
        breakRate: 0,
        breakAmount: 0
      });
      return;
    }
  
    try {
      // Fonction utilitaire pour calculer les sommes en toute sécurité
      const parseNumber = (value: any): number => isNaN(parseFloat(value)) ? 0 : parseFloat(value);
      const sum = (arr: any[], key: string) => arr.reduce((acc, val) => acc + parseNumber(val[key]), 0);
      
      // Calculer les totaux de base
      const baseTotalProductOrder = sum(completeForecast, "total_products_ordered");
      const baseBreakProduct = sum(completeForecast, "stock_break_products");
      const baseBreakAmount = sum(completeForecast, "stock_break_amount");
      
      // Appliquer le pourcentage d'évolution
      const growthFactor = 1 + (Number(forecastPercentage) / 100);
      
      const forecastProductOrder = baseTotalProductOrder * growthFactor;
      const forecastBreakProduct = baseBreakProduct * growthFactor;
      const forecastBreakAmount = baseBreakAmount * growthFactor;
      
      // Calculer le taux de rupture prévisionnel
      const forecastBreakRate = forecastProductOrder > 0 
        ? (forecastBreakProduct / forecastProductOrder) * 100 
        : 0;
      
      // Mettre à jour les métriques avec vérification
      setForecastMetrics({
        productOrder: isFinite(forecastProductOrder) ? forecastProductOrder : 0,
        breakProduct: isFinite(forecastBreakProduct) ? forecastBreakProduct : 0,
        breakRate: isFinite(forecastBreakRate) ? forecastBreakRate : 0,
        breakAmount: isFinite(forecastBreakAmount) ? forecastBreakAmount : 0
      });
    } catch (error) {
      console.error("Erreur dans le calcul des prévisions:", error);
      // Réinitialiser les métriques en cas d'erreur
      setForecastMetrics({
        productOrder: 0,
        breakProduct: 0,
        breakRate: 0,
        breakAmount: 0
      });
    }
    
  }, [completeForecast, forecastPercentage, hasSelectedData]);

  return {
    forecastPercentage,
    setForecastPercentage,
    forecastMetrics
  };
}