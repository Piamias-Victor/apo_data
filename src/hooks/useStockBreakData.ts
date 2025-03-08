// hooks/useStockBreakData.ts
import { useState, useEffect } from "react";
import { useFilterContext } from "@/contexts/FilterContext";

export interface StockBreakData {
  month: string;
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
}

export interface BreakMetrics {
  productOrder: number;
  breakProduct: number;
  breakRate: number;
  breakAmount: number;
}

export function useStockBreakData() {
  const { filters } = useFilterContext();
  const [stockBreakData, setStockBreakData] = useState<StockBreakData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Métriques pour l'année en cours (2025)
  const [metrics2025, setMetrics2025] = useState<BreakMetrics>({
    productOrder: 0,
    breakProduct: 0,
    breakRate: 0,
    breakAmount: 0
  });
  
  // Métriques ajustées pour l'année précédente (2024), jusqu'au mois courant
  const [adjustedMetrics2024, setAdjustedMetrics2024] = useState<BreakMetrics>({
    productOrder: 0,
    breakProduct: 0,
    breakRate: 0,
    breakAmount: 0
  });
  
  // Métriques globales pour l'année précédente complète (2024)
  const [globalMetrics2024, setGlobalMetrics2024] = useState<BreakMetrics>({
    productOrder: 0,
    breakProduct: 0,
    breakRate: 0,
    breakAmount: 0
  });
  
  // Données pour les prévisions
  const [completeForecast, setCompleteForecast] = useState<StockBreakData[]>([]);

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
  const sum = (arr: any[], key: string) => arr.reduce((acc, val) => acc + parseNumber(val[key]), 0);

  useEffect(() => {
    if (!hasSelectedData) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/sell-out/getStockBreakRateByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        const data = result.stockBreakData || [];
        setStockBreakData(data);

        // Récupérer l'année actuelle et l'année précédente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = new Date().getMonth() + 1;

        // Séparer les données par année et par mois
        const dataByMonth: Record<string, Record<string, StockBreakData>> = {
          [currentYear]: {},
          [previousYear]: {}
        };
        
        data.forEach((item: StockBreakData) => {
          if (!item.month) return;
          const [year, month] = item.month.split("-");
          if (!year || !month) return;
          
          if (!dataByMonth[year]) dataByMonth[year] = {};
          dataByMonth[year][month] = item;
        });
        
        // Données de l'année en cours et précédente
        const data2025 = Object.values(dataByMonth[currentYear] || {});
        const data2024 = Object.values(dataByMonth[previousYear] || {});
        
        // Calcul des métriques pour 2025
        const total2025ProductOrder = sum(data2025, "total_products_ordered");
        const total2025BreakProduct = sum(data2025, "stock_break_products");
        const total2025BreakAmount = sum(data2025, "stock_break_amount");
        const breakRate2025 = total2025ProductOrder > 0 
          ? (total2025BreakProduct / total2025ProductOrder) * 100 
          : 0;
          
        setMetrics2025({
          productOrder: total2025ProductOrder,
          breakProduct: total2025BreakProduct,
          breakRate: breakRate2025,
          breakAmount: total2025BreakAmount
        });
        
        // Calcul des métriques globales pour 2024
        const total2024ProductOrder = sum(data2024, "total_products_ordered");
        const total2024BreakProduct = sum(data2024, "stock_break_products");
        const total2024BreakAmount = sum(data2024, "stock_break_amount");
        const breakRate2024 = total2024ProductOrder > 0 
          ? (total2024BreakProduct / total2024ProductOrder) * 100 
          : 0;
          
        setGlobalMetrics2024({
          productOrder: total2024ProductOrder,
          breakProduct: total2024BreakProduct,
          breakRate: breakRate2024,
          breakAmount: total2024BreakAmount
        });
        
        // Filtrer les données de 2024 jusqu'au mois courant pour les métriques ajustées
        const monthsUpToCurrent = Array.from({ length: currentMonth }, (_, i) => 
          (i + 1).toString().padStart(2, "0"));
          
        const adjustedData2024 = data2024.filter(d => {
          const month = d.month.split("-")[1];
          return monthsUpToCurrent.includes(month);
        });
        
        // Calcul des métriques ajustées pour 2024
        const adjustedProductOrder = sum(adjustedData2024, "total_products_ordered");
        const adjustedBreakProduct = sum(adjustedData2024, "stock_break_products");
        const adjustedBreakAmount = sum(adjustedData2024, "stock_break_amount");
        const adjustedBreakRate = adjustedProductOrder > 0 
          ? (adjustedBreakProduct / adjustedProductOrder) * 100 
          : 0;
          
        setAdjustedMetrics2024({
          productOrder: adjustedProductOrder,
          breakProduct: adjustedBreakProduct,
          breakRate: adjustedBreakRate,
          breakAmount: adjustedBreakAmount
        });
        
        // Préparer les données pour les prévisions
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
              total_products_ordered: 0,
              stock_break_products: 0,
              stock_break_rate: 0,
              stock_break_amount: 0
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
    stockBreakData,
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