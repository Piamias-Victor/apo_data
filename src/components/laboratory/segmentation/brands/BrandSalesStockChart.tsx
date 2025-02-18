import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import Loader from "@/components/ui/Loader";
import { useFilterContext } from "@/contexts/FilterContext";

// 📌 Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 🎯 Définition de l'interface des données
interface BrandSalesStockChartProps {
  brandLab: string;
  pharmacies?: string[]; // 📌 Optionnel : Liste des pharmacies à filtrer
}

interface SalesStockData {
  month: string;
  total_quantity_sold: number;
  total_stock_quantity: number;
  stock_break_quantity: number;
}

// 📊 **Composant du graphique des ventes, stocks et ruptures pour une marque**
const BrandSalesStockChart: React.FC<BrandSalesStockChartProps> = ({ brandLab, pharmacies }) => {
  const [salesStockData, setSalesStockData] = useState<SalesStockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
    const { filters } = useFilterContext();
   

  // 🚀 **Effectue le fetch des données**
  useEffect(() => {
    const fetchSalesStockData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/sell-out/getBrandSalesStock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand_lab: brandLab, filters }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des données.");

        const data = await response.json();
        setSalesStockData(data.salesStockData);
      } catch (err) {
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesStockData();
  }, [brandLab, filters]);

  // 🔍 **Affichage du Loader ou de l'erreur**
  if (loading) return <Loader message="Chargement des données..." />;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (salesStockData.length === 0) return <p className="text-gray-500 text-center mt-2">Aucune donnée enregistrée.</p>;

  // 📅 Labels des mois
  const labels = salesStockData.map((data) => data.month);
  

  // 📊 Données du graphique
  const data = {
    labels,
    datasets: [
      {
        label: "Quantité Vendue",
        data: salesStockData.map((data) => data.total_quantity_sold),
        backgroundColor: "rgba(54, 162, 235, 0.7)", // Bleu
      },
      {
        label: "Stock Moyen",
        data: salesStockData.map((data) => data.total_stock_quantity),
        backgroundColor: "rgba(75, 192, 192, 0.7)", // Vert
      },
      {
        label: "Ruptures de Stock",
        data: salesStockData.map((data) => data.stock_break_quantity),
        backgroundColor: "rgba(255, 99, 132, 0.7)", // Rouge
      },
    ],
  };

  return (
    <div className="mt-4 bg-white shadow p-4 rounded-lg w-full">
      <h3 className="text-lg font-semibold text-teal-900 mb-2">
        📊 Ventes, Stocks & Ruptures Mensuelles pour <span className="text-teal-600">{brandLab}</span>
      </h3>
      <Bar data={data} />
    </div>
  );
};

export default BrandSalesStockChart;