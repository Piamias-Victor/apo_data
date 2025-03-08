// hooks/usePeriodSalesData.ts
import { useState, useEffect } from "react";
import { useFilterContext } from "@/contexts/FilterContext";

export interface PeriodSalesData {
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  type: "current" | "comparison";
}

export function usePeriodSalesData() {
  const { filters } = useFilterContext();
  const [salesData, setSalesData] = useState<PeriodSalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/sale/getSalesData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        setSalesData(result.salesData || []);
      } catch (err) {
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Extraire les données des périodes
  const currentPeriod = salesData.find((data) => data.type === "current");
  const comparisonPeriod = salesData.find((data) => data.type === "comparison");

  return { currentPeriod, comparisonPeriod, loading, error };
}