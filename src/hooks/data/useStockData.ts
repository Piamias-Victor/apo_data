// hooks/useStockData.ts
import { useFilterContext } from "@/contexts/FilterContext";
import { useState, useEffect } from "react";

export interface StockSalesData {
  month: string;
  total_avg_stock: number;
  total_stock_value: number;
  total_quantity: number;
  total_revenue: number;
}

export interface StockMetrics {
  avgStock: number;
  stockValue: number;
  monthsOfStock: number;
  stockValuePercentage: number;
}

export function useStockData() {
  const { filters } = useFilterContext();
  const [stockSalesData, setStockSalesData] = useState<StockSalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Métriques pour l'année en cours (2025)
  const [metrics2025, setMetrics2025] = useState<StockMetrics>({
    avgStock: 0,
    stockValue: 0,
    monthsOfStock: 0,
    stockValuePercentage: 0
  });
  
  // Métriques ajustées pour l'année précédente (2024), jusqu'au mois courant
  const [adjustedMetrics2024, setAdjustedMetrics2024] = useState<StockMetrics>({
    avgStock: 0,
    stockValue: 0,
    monthsOfStock: 0,
    stockValuePercentage: 0
  });
  
  // Métriques globales pour l'année précédente complète (2024)
  const [globalMetrics2024, setGlobalMetrics2024] = useState<StockMetrics>({
    avgStock: 0,
    stockValue: 0,
    monthsOfStock: 0,
    stockValuePercentage: 0
  });
  
  // Données pour les prévisions
  const [completeForecast, setCompleteForecast] = useState<StockSalesData[]>([]);

  // Vérifier si des filtres sont sélectionnés
  const hasSelectedData = 
    filters.distributors.length > 0 ||
    filters.brands.length > 0 ||
    filters.universes.length > 0 ||
    filters.categories.length > 0 ||
    filters.families.length > 0 ||
    filters.specificities.length > 0 || 
    filters.ean13Products.length > 0;

  // Fonction utilitaire pour calculer les sommes en toute sécurité
  const parseNumber = (value: any): number => isNaN(parseFloat(value)) ? 0 : parseFloat(value);
  
  useEffect(() => {
    if (!hasSelectedData) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/stock/getStockByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        const data = result.stockSalesData || [];
        setStockSalesData(data);

        // Récupérer l'année actuelle et l'année précédente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = new Date().getMonth() + 1;

        // Filtrer les données par année
        const stock2025 = data.filter((d: StockSalesData) => d.month.startsWith(`${currentYear}-`));
        const stock2024 = data.filter((d: StockSalesData) => d.month.startsWith(`${previousYear}-`));
        
        // Calcul des métriques pour 2025
        const avgStock2025 = stock2025.length > 0
          ? stock2025.reduce((acc: number, cur: StockSalesData) => acc + parseNumber(cur.total_avg_stock), 0) / stock2025.length
          : 0;
        
        const stockValue2025 = stock2025.length > 0
          ? stock2025.reduce((acc: number, cur: StockSalesData) => acc + parseNumber(cur.total_stock_value), 0) / stock2025.length
          : 0;
          
        const revenue2025 = stock2025.reduce(
          (acc: number, cur: StockSalesData) => acc + parseNumber(cur.total_revenue), 0
        );
        
        const monthsOfStock2025 = revenue2025 > 0 
          ? stockValue2025 / (revenue2025 / 12) 
          : 0;
          
        const stockValuePercentage2025 = revenue2025 > 0 
          ? (stockValue2025 / revenue2025) * 100 
          : 0;
          
        setMetrics2025({
          avgStock: avgStock2025,
          stockValue: stockValue2025,
          monthsOfStock: monthsOfStock2025,
          stockValuePercentage: stockValuePercentage2025
        });
        
        // Calcul des métriques globales pour 2024
        const avgStock2024 = stock2024.length > 0
          ? stock2024.reduce((acc: number, cur: StockSalesData) => acc + parseNumber(cur.total_avg_stock), 0) / stock2024.length
          : 0;
        
        const stockValue2024 = stock2024.length > 0
          ? stock2024.reduce((acc: number, cur: StockSalesData) => acc + parseNumber(cur.total_stock_value), 0) / stock2024.length
          : 0;
          
        const revenue2024 = stock2024.reduce(
          (acc: number, cur: StockSalesData) => acc + parseNumber(cur.total_revenue), 0
        );
        
        const monthsOfStock2024 = revenue2024 > 0 
          ? stockValue2024 / (revenue2024 / 12) 
          : 0;
          
        const stockValuePercentage2024 = revenue2024 > 0 
          ? (stockValue2024 / revenue2024) * 100 
          : 0;
          
        setGlobalMetrics2024({
          avgStock: avgStock2024,
          stockValue: stockValue2024,
          monthsOfStock: monthsOfStock2024,
          stockValuePercentage: stockValuePercentage2024
        });
        
        // Filtrer les données de 2024 jusqu'au mois courant pour les métriques ajustées
        const monthsUpToCurrent = Array.from({ length: currentMonth }, (_, i) => 
          (i + 1).toString().padStart(2, "0"));
          
        const adjustedStock2024 = stock2024.filter((d: StockSalesData) => {
          const month = d.month.split("-")[1];
          return monthsUpToCurrent.includes(month);
        });
        
        // Calcul des métriques ajustées pour 2024
        const adjustedAvgStock = adjustedStock2024.length > 0
          ? adjustedStock2024.reduce((acc: number, cur: StockSalesData) => acc + parseNumber(cur.total_avg_stock), 0) / adjustedStock2024.length
          : 0;
        
        const adjustedStockValue = adjustedStock2024.length > 0
          ? adjustedStock2024.reduce((acc: number, cur: StockSalesData) => acc + parseNumber(cur.total_stock_value), 0) / adjustedStock2024.length
          : 0;
          
        const adjustedRevenue = adjustedStock2024.reduce(
          (acc: number, cur: StockSalesData) => acc + parseNumber(cur.total_revenue), 0
        );
        
        const adjustedMonthsOfStock = adjustedRevenue > 0 
          ? adjustedStockValue / (adjustedRevenue / 12) 
          : 0;
          
        const adjustedStockValuePercentage = adjustedRevenue > 0 
          ? (adjustedStockValue / adjustedRevenue) * 100 
          : 0;
          
        setAdjustedMetrics2024({
          avgStock: adjustedAvgStock,
          stockValue: adjustedStockValue,
          monthsOfStock: adjustedMonthsOfStock,
          stockValuePercentage: adjustedStockValuePercentage
        });
        
        // Préparer les données pour les prévisions
        // Séparer les données par mois pour faciliter l'accès
        const dataByMonth: Record<string, Record<string, StockSalesData>> = {
          [currentYear]: {},
          [previousYear]: {}
        };
        
        data.forEach((item: StockSalesData) => {
          if (!item.month) return;
          const [year, month] = item.month.split("-");
          if (!year || !month) return;
          
          if (!dataByMonth[year]) dataByMonth[year] = {};
          dataByMonth[year][month] = item;
        });
        
        const months = Array.from({ length: 12 }, (_, i) => 
          (i + 1).toString().padStart(2, "0"));
          
        const forecastData = months.map((month) => {
          const data2025 = dataByMonth[currentYear]?.[month];
          const data2024 = dataByMonth[previousYear]?.[month];
          
          return data2025 || 
            (data2024 ? {
              ...data2024,
              month: `${currentYear}-${month}`
            } : {
              month: `${currentYear}-${month}`,
              total_avg_stock: 0,
              total_stock_value: 0,
              total_quantity: 0,
              total_revenue: 0
            });
        });
        
        setCompleteForecast(forecastData);
        
      } catch (err) {
        setError("Impossible de récupérer les données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, hasSelectedData]);

  return {
    stockSalesData,
    loading,
    error,
    hasSelectedData,
    completeForecast,
    metrics: {
      current: metrics2025,
      adjusted: adjustedMetrics2024,
      global: globalMetrics2024
    }
  };
}