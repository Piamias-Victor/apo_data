// src/global/sales/utils/salesCalculations.ts
import { SalesData, SalesMetrics } from "../hooks/useSalesData";

/**
 * Calcule les métriques de vente à partir d'un tableau de données
 */
export function calculateSalesMetrics(data: SalesData[]): SalesMetrics {
  return {
    sellOut: data.reduce((acc, cur) => 
      acc + parseFloat(String(cur.total_quantity || "0")), 0),
    revenue: data.reduce((acc, cur) => 
      acc + parseFloat(String(cur.revenue || "0")), 0),
    margin: data.reduce((acc, cur) => 
      acc + parseFloat(String(cur.margin || "0")), 0),
    sellIn: data.reduce((acc, cur) => 
      acc + parseFloat(String(cur.purchase_quantity || "0")), 0),
    purchaseAmount: data.reduce((acc, cur) => 
      acc + parseFloat(String(cur.purchase_amount || "0")), 0)
  };
}

/**
 * Filtre les données par année
 */
export function filterDataByYear(data: SalesData[], year: number): SalesData[] {
  return data.filter(d => d.month.startsWith(`${year}-`));
}

/**
 * Filtre les données par année et mois
 */
export function filterDataByYearAndMonths(
  data: SalesData[], 
  year: number, 
  monthsToInclude: string[]
): SalesData[] {
  return data.filter(d => {
    const [dataYear, dataMonth] = d.month.split("-");
    return dataYear === `${year}` && monthsToInclude.includes(dataMonth);
  });
}

/**
 * Applique un pourcentage d'évolution aux métriques
 */
export function applyGrowthPercentage(
  metrics: SalesMetrics, 
  percentage: number
): SalesMetrics {
  const factor = 1 + percentage / 100;
  return {
    sellOut: metrics.sellOut * factor,
    revenue: metrics.revenue * factor,
    margin: metrics.margin * factor,
    sellIn: metrics.sellIn * factor,
    purchaseAmount: metrics.purchaseAmount * factor
  };
}