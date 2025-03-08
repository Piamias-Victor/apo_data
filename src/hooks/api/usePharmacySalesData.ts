// hooks/usePharmacySalesData.ts
import { useState, useEffect } from "react";
import { useFilterContext } from "@/contexts/FilterContext";

export interface PharmacySalesData {
  pharmacy_id: string;
  pharmacy_name: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  type: "current" | "comparison";
}

export interface PharmacySalesWithEvolution extends PharmacySalesData {
  evolution: {
    total_quantity: number;
    revenue: number;
    margin: number;
    purchase_quantity: number;
    purchase_amount: number;
  };
}

export function usePharmacySalesData() {
  const { filters } = useFilterContext();
  const [salesData, setSalesData] = useState<PharmacySalesWithEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si des filtres sont sélectionnés
  const hasSelectedData = 
    filters.distributors.length > 0 ||
    filters.brands.length > 0 ||
    filters.universes.length > 0 ||
    filters.categories.length > 0 ||
    filters.families.length > 0 ||
    filters.specificities.length > 0 ||
    filters.pharmacies.length > 0 || 
    filters.ean13Products.length > 0;

  // Fonction pour calculer l'évolution en pourcentage
  const calculateEvolution = (oldValue?: number, newValue?: number): number => {
    if (!oldValue || oldValue === 0) return newValue ? 100 : 0;
    if (!newValue) return -100;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  useEffect(() => {
    if (!hasSelectedData) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/sell-out/getSalesByPharmacy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        const data = result.salesData || [];

        // Regroupement des données par pharmacie
        const groupedData: Record<string, { current?: PharmacySalesData; comparison?: PharmacySalesData }> = {};

        data.forEach((entry: PharmacySalesData) => {
          if (!groupedData[entry.pharmacy_id]) {
            groupedData[entry.pharmacy_id] = {};
          }
          groupedData[entry.pharmacy_id][entry.type] = entry;
        });

        // Calcul de l'évolution
        const salesWithEvolution: PharmacySalesWithEvolution[] = Object.entries(groupedData).map(
          ([pharmacy_id, { current, comparison }]) => {
            const evolution = {
              total_quantity: calculateEvolution(comparison?.total_quantity, current?.total_quantity),
              revenue: calculateEvolution(comparison?.revenue, current?.revenue),
              margin: calculateEvolution(comparison?.margin, current?.margin),
              purchase_quantity: calculateEvolution(comparison?.purchase_quantity, current?.purchase_quantity),
              purchase_amount: calculateEvolution(comparison?.purchase_amount, current?.purchase_amount),
            };

            return {
              pharmacy_id,
              pharmacy_name: current?.pharmacy_name || comparison?.pharmacy_name || "Pharmacie Inconnue",
              total_quantity: current?.total_quantity ?? 0,
              revenue: current?.revenue ?? 0,
              margin: current?.margin ?? 0,
              purchase_quantity: current?.purchase_quantity ?? 0,
              purchase_amount: current?.purchase_amount ?? 0,
              type: "current",
              evolution,
            };
          }
        );

        setSalesData(salesWithEvolution);
      } catch (err) {
        setError("Impossible de récupérer les données");
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, hasSelectedData]);

  // Trier les pharmacies pour les différents tops
  const getTopPharmacies = () => {
    if (salesData.length === 0) {
      return {
        topRevenue: [],
        topMargin: [],
        topGrowth: []
      };
    }
    
    const topRevenue = [...salesData].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
    const topMargin = [...salesData].sort((a, b) => b.margin - a.margin).slice(0, 3);
    const topGrowth = [...salesData]
      .filter(pharmacy => pharmacy.evolution.revenue !== null)
      .sort((a, b) => b.evolution.revenue - a.evolution.revenue)
      .slice(0, 3);
    
    return {
      topRevenue,
      topMargin,
      topGrowth
    };
  };

  return {
    salesData,
    loading,
    error,
    hasSelectedData,
    topPharmacies: getTopPharmacies()
  };
}