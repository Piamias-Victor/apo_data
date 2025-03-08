// src/global/sales/hooks/useSalesData.ts
import { useState, useEffect } from "react";
import { useFilterContext } from "@/contexts/FilterContext";

export interface SalesData {
  month: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
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
    const fetchData = async () => {
      if (!hasSelectedData) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/sell-out/getSalesByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        const data = result.salesData || [];
        setSalesData(data);

        // Logique de calcul des métriques (comme dans SalesDataComponent)
        // ...
      } catch (err) {
        setError("Impossible de récupérer les données");
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