import { useFilterContext } from "@/contexts/FilterContext";
import { useEffect, useState } from "react";

interface SalesData {
  code_13_ref: string;
  name: string;
  tva_percentage: number;
  total_revenue: number;
  total_purchase_amount: number;
  total_margin: number;
  total_quantity_sold: number;
  range_name: string;
}

interface RangeSummary {
  range_name: string;
  total_revenue: number;
  total_purchase_amount: number;
  total_margin: number;
  total_quantity_sold: number;
  products: SalesData[] | null;
}

const SalesDataDisplay = () => {
  const [data, setData] = useState<RangeSummary[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilterContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/sell-out/getSalesData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const result = await response.json();
        
        // Définir le nom du laboratoire si range_name est null
        const updatedData = result.ranges.map((range: RangeSummary) => ({
          ...range,
          range_name: range.range_name || filters.distributors[0] || filters.brands[0] || "Inconnu"
        }));

        setData(updatedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default SalesDataDisplay;
