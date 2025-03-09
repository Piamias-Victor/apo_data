// src/hooks/data/useSalesData.ts
import { useFilterContext } from "@/contexts/FilterContext";
import { useState, useEffect } from "react";

export interface SalesData {
  month: string;
  total_quantity: string | number;
  revenue: string | number;
  margin: string | number;
  purchase_quantity: string | number;
  purchase_amount: string | number;
}

export interface SalesMetrics {
  sellOut: number;
  revenue: number;
  margin: number;
  sellIn: number;
  purchaseAmount: number;
}

export function useSalesData() {
  const { filters } = useFilterContext();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [metrics2025, setMetrics2025] = useState<SalesMetrics>({
    sellOut: 0, revenue: 0, margin: 0, sellIn: 0, purchaseAmount: 0
  });
  
  const [adjustedMetrics2024, setAdjustedMetrics2024] = useState<SalesMetrics>({
    sellOut: 0, revenue: 0, margin: 0, sellIn: 0, purchaseAmount: 0
  });
  
  const [globalMetrics2024, setGlobalMetrics2024] = useState<SalesMetrics>({
    sellOut: 0, revenue: 0, margin: 0, sellIn: 0, purchaseAmount: 0
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
  const calculateMetrics = (data: SalesData[]): SalesMetrics => {
    if (data.length === 0) {
      return {
        sellOut: 0,
        revenue: 0,
        margin: 0,
        sellIn: 0,
        purchaseAmount: 0
      };
    }

    return {
      sellOut: Number(data.reduce((sum, item) => sum + toNumber(item.total_quantity), 0).toFixed(2)),
      revenue: Number(data.reduce((sum, item) => sum + toNumber(item.revenue), 0).toFixed(2)),
      margin: Number(data.reduce((sum, item) => sum + toNumber(item.margin), 0).toFixed(2)),
      sellIn: Number(data.reduce((sum, item) => sum + toNumber(item.purchase_quantity), 0).toFixed(2)),
      purchaseAmount: Number(data.reduce((sum, item) => sum + toNumber(item.purchase_amount), 0).toFixed(2))
    };
  };

  useEffect(() => {
    if (!hasSelectedData) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/sales/getSalesByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Vérification explicite des données
        if (!result || !result.salesData || !Array.isArray(result.salesData)) {
          throw new Error("Données de ventes invalides ou manquantes");
        }

        const data = result.salesData;
        
        // Convertir toutes les valeurs numériques en nombres
        const processedData = data.map(item => ({
          ...item,
          total_quantity: toNumber(item.total_quantity),
          revenue: toNumber(item.revenue),
          margin: toNumber(item.margin),
          purchase_quantity: toNumber(item.purchase_quantity),
          purchase_amount: toNumber(item.purchase_amount)
        }));

        setSalesData(processedData);

        // Récupérer l'année actuelle et l'année précédente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = new Date().getMonth() + 1;

        // Filtrer les données par année
        const currentYearData = processedData.filter(d => d.month.startsWith(`${currentYear}-`));
        const previousYearData = processedData.filter(d => d.month.startsWith(`${previousYear}-`));

        // Calculer les métriques globales
        setMetrics2025(calculateMetrics(currentYearData));
        setGlobalMetrics2024(calculateMetrics(previousYearData));

        // Filtrer les données de l'année précédente jusqu'au mois courant
        const monthsUpToCurrent = Array.from({ length: currentMonth }, (_, i) => 
          (i + 1).toString().padStart(2, "0"));
        
        const adjustedPreviousYearData = previousYearData.filter(d => {
          const month = d.month.split("-")[1];
          return monthsUpToCurrent.includes(month);
        });

        // Calculer les métriques ajustées
        setAdjustedMetrics2024(calculateMetrics(adjustedPreviousYearData));

      } catch (err) {
        console.error("Erreur lors de la récupération des données de ventes:", err);
        setError(err instanceof Error ? err.message : "Impossible de récupérer les données");
        
        // Réinitialiser toutes les données
        setSalesData([]);
        setMetrics2025({
          sellOut: 0, revenue: 0, margin: 0, sellIn: 0, purchaseAmount: 0
        });
        setAdjustedMetrics2024({
          sellOut: 0, revenue: 0, margin: 0, sellIn: 0, purchaseAmount: 0
        });
        setGlobalMetrics2024({
          sellOut: 0, revenue: 0, margin: 0, sellIn: 0, purchaseAmount: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, hasSelectedData]);

  return {
    salesData,
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