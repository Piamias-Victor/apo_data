// src/hooks/useForecastCalculation.ts
import { useState, useEffect } from "react";
import { SalesData, SalesMetrics } from "./useSalesData";

export function useForecastCalculation(
  salesData: SalesData[], 
  hasSelectedData: boolean
) {
  const [forecastPercentage, setForecastPercentage] = useState(0);
  const [forecastMetrics, setForecastMetrics] = useState<SalesMetrics>({
    sellOut: 0,
    revenue: 0,
    margin: 0,
    sellIn: 0,
    purchaseAmount: 0
  });

  useEffect(() => {
    if (!hasSelectedData || !salesData || salesData.length === 0) {
      // Réinitialiser les métriques si aucune donnée n'est disponible
      setForecastMetrics({
        sellOut: 0,
        revenue: 0,
        margin: 0,
        sellIn: 0,
        purchaseAmount: 0
      });
      return;
    }
  
    try {
      // Récupérer l'année actuelle et l'année précédente
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
    
      // Séparer les données par année et par mois
      const salesByMonth: Record<string, Record<string, SalesData>> = {
        [currentYear]: {},
        [previousYear]: {}
      };
      
      // S'assurer que les données sont correctement formatées
      salesData.forEach((item) => {
        if (!item.month) return; // Ignorer les données sans mois
        
        const [year, month] = item.month.split("-");
        if (!year || !month) return; // Ignorer les formats invalides
        
        if (!salesByMonth[year]) salesByMonth[year] = {};
        salesByMonth[year][month] = item;
      });
      
      // Générer les valeurs prévisionnelles
      const months = Array.from({ length: 12 }, (_, i) => 
        (i + 1).toString().padStart(2, "0"));
      
      // Créer les prévisions complètes
      const completeForecast = months.map(month => {
        const data2025 = salesByMonth[currentYear]?.[month];
        const data2024 = salesByMonth[previousYear]?.[month];
        
        return data2025 || 
          (data2024 ? {
            ...data2024,
            month: `${currentYear}-${month}`
          } : {
            month: `${currentYear}-${month}`,
            total_quantity: 0,
            revenue: 0,
            margin: 0,
            purchase_quantity: 0,
            purchase_amount: 0
          });
      });
      
      // Calculer les totaux avec sécurité pour les types
      const baseSellOut = completeForecast.reduce((acc, cur) => 
        acc + (Number(cur.total_quantity) || 0), 0);
      const baseRevenue = completeForecast.reduce((acc, cur) => 
        acc + (Number(cur.revenue) || 0), 0);
      const baseMargin = completeForecast.reduce((acc, cur) => 
        acc + (Number(cur.margin) || 0), 0);
      const baseSellIn = completeForecast.reduce((acc, cur) => 
        acc + (Number(cur.purchase_quantity) || 0), 0);
      const basePurchaseAmount = completeForecast.reduce((acc, cur) => 
        acc + (Number(cur.purchase_amount) || 0), 0);
      
      // Appliquer le pourcentage d'évolution avec vérification
      const growthFactor = 1 + (Number(forecastPercentage) / 100);
      
      // Mettre à jour les métriques avec des valeurs finales sûres
      setForecastMetrics({
        sellOut: isFinite(baseSellOut * growthFactor) ? baseSellOut * growthFactor : 0,
        revenue: isFinite(baseRevenue * growthFactor) ? baseRevenue * growthFactor : 0,
        margin: isFinite(baseMargin * growthFactor) ? baseMargin * growthFactor : 0,
        sellIn: isFinite(baseSellIn * growthFactor) ? baseSellIn * growthFactor : 0,
        purchaseAmount: isFinite(basePurchaseAmount * growthFactor) ? basePurchaseAmount * growthFactor : 0
      });
    } catch (error) {
      console.error("Erreur dans le calcul des prévisions:", error);
      // Réinitialiser les métriques en cas d'erreur
      setForecastMetrics({
        sellOut: 0,
        revenue: 0,
        margin: 0,
        sellIn: 0,
        purchaseAmount: 0
      });
    }
    
  }, [salesData, forecastPercentage, hasSelectedData]);

  return {
    forecastPercentage,
    setForecastPercentage,
    forecastMetrics
  };
}