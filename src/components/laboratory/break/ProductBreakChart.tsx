import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// 📌 Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 🎯 Définition de l'interface des données
interface ProductBreakChartProps {
  breakData: { 
    month: string; 
    total_quantity_sold: number;
    total_quantity_ordered: number; 
    total_stock_break_quantity: number; 
    total_stock_break_amount: number;
  }[];
}

// 📊 **Composant du graphique des ruptures mensuelles**
const ProductBreakChart: React.FC<ProductBreakChartProps> = ({ breakData }) => {
  if (breakData.length === 0) return <p className="text-gray-500 text-center mt-2">Aucune donnée disponible.</p>;

  // 📅 Labels des mois

  const sortedSalesStockData = [...breakData].sort((a, b) => a.month.localeCompare(b.month));

  // 📅 Labels des mois
  const labels = sortedSalesStockData.map((data) => data.month);  

  // 📊 Données du graphique
  const data = {
    labels,
    datasets: [
      {
        label: "Quantité Vendue",
        data: breakData.map((data) => data.total_quantity_sold),
        backgroundColor: "rgba(75, 192, 192, 0.7)", // Vert
      },
      {
        label: "Quantité Commandée",
        data: breakData.map((data) => data.total_quantity_ordered),
        backgroundColor: "rgba(54, 162, 235, 0.7)", // Bleu
      },
      {
        label: "Rupture (Qté)",
        data: breakData.map((data) => data.total_stock_break_quantity),
        backgroundColor: "rgba(255, 99, 132, 0.7)", // Rouge
      },
      {
        label: "Rupture (€)",
        data: breakData.map((data) => data.total_stock_break_amount),
        backgroundColor: "rgba(255, 159, 64, 0.7)", // Orange
      },
    ],
  };

  return (
    <div className="mt-4 w-full">
      <Bar data={data} />
    </div>
  );
};

export default ProductBreakChart;