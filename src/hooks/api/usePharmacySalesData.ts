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
  previous?: PharmacySalesData;
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
    if (!hasSelectedData) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/sales/getSalesByPharmacy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) {
          throw new Error(`Erreur de requête: ${response.status}`);
        }

        const result = await response.json();
        
        // Grouper les données par pharmacie et type
        const groupedData: Record<string, { current?: PharmacySalesData, comparison?: PharmacySalesData }> = {};
        
        result.salesData.forEach((item: PharmacySalesData) => {
          if (!groupedData[item.pharmacy_id]) {
            groupedData[item.pharmacy_id] = {};
          }
          groupedData[item.pharmacy_id][item.type] = item;
        });

        // Transformer les données pour inclure l'évolution
        const processedData: PharmacySalesWithEvolution[] = Object.entries(groupedData).map(
          ([pharmacy_id, { current, comparison }]) => ({
            ...(current || comparison)!,
            previous: comparison,
            evolution: {
              total_quantity: calculateEvolution(comparison?.total_quantity, current?.total_quantity),
              revenue: calculateEvolution(comparison?.revenue, current?.revenue),
              margin: calculateEvolution(comparison?.margin, current?.margin),
              purchase_quantity: calculateEvolution(comparison?.purchase_quantity, current?.purchase_quantity),
              purchase_amount: calculateEvolution(comparison?.purchase_amount, current?.purchase_amount)
            }
          })
        );

        setSalesData(processedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setError(err instanceof Error ? err.message : "Impossible de récupérer les données");
        setSalesData([]);
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
      .filter(pharmacy => pharmacy.evolution?.revenue !== undefined)
      .sort((a, b) => (b.evolution.revenue || 0) - (a.evolution.revenue || 0))
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