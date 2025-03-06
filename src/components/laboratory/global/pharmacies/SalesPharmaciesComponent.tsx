import React, { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/FilterContext";
import Loader from "@/components/ui/Loader";
import SalesDataByPharmacy from "./SalesDataByPharmacy";
import SalesSummaryCard from "./SalesSummaryCard";
import TopPharmaciesCard from "./SalesSummaryCard";

interface SalesData {
  pharmacy_id: string;
  pharmacy_name: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  type: "current" | "comparison";
}

interface SalesDataWithEvolution extends SalesData {
  evolution: {
    total_quantity: number;
    revenue: number;
    margin: number;
    purchase_quantity: number;
    purchase_amount: number;
  };
}

const SalesDataTest: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedData =
    filters.distributors.length > 0 ||
    filters.brands.length > 0 ||
    filters.universes.length > 0 ||
    filters.categories.length > 0 ||
    filters.families.length > 0 ||
    filters.specificities.length > 0 ||
    filters.pharmacies.length > 0 || 
    filters.ean13Products.length > 0;;

  const [salesData, setSalesData] = useState<SalesDataWithEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // 🔹 Regroupement des données par pharmacie
        const groupedData: Record<string, { current?: SalesData; comparison?: SalesData }> = {};

        data.forEach((entry: SalesData) => {
          if (!groupedData[entry.pharmacy_id]) {
            groupedData[entry.pharmacy_id] = {};
          }
          groupedData[entry.pharmacy_id][entry.type] = entry;
        });

        // 🔹 Calcul de l'évolution
        const salesWithEvolution: SalesDataWithEvolution[] = Object.entries(groupedData).map(
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
        console.error("❌ Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, hasSelectedData]);

  // 📌 Fonction pour calculer l'évolution en pourcentage
  const calculateEvolution = (oldValue?: number, newValue?: number): number => {
    if (!oldValue || oldValue === 0) return newValue ? 100 : 0;
    if (!newValue) return -100;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!salesData || salesData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      {/* 🏆 Affichage des meilleures pharmacies */}
      <TopPharmaciesCard salesData={salesData} loading={loading} error={error} />

      {/* 📊 Tableau détaillé des ventes par pharmacie */}
      <SalesDataByPharmacy salesData={salesData} loading={loading} error={error} />
    </div>
  );
};

export default SalesDataTest;