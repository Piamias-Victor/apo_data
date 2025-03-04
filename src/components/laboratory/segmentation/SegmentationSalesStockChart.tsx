import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// 📌 Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 🎯 Définition de l'interface des données
interface SegmentationSalesStockChartProps {
  salesStockData: { 
    month: string; 
    total_quantity_sold: number; 
    avg_stock_quantity: number; 
    stock_break_quantity: number;
  }[];
}

// 📊 **Composant du graphique des ventes, stocks et ruptures**
const SegmentationSalesStockChart: React.FC<SegmentationSalesStockChartProps> = ({ salesStockData }) => {
  if (salesStockData.length === 0) return <p className="text-gray-500 text-center mt-2">Aucune donnée disponible.</p>;

  console.log('salesStockData', salesStockData);

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
        data: salesStockData.map((data) => data.avg_stock_quantity),
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
      {/* 📊 Titre du graphique */}
      <h3 className="text-lg font-semibold text-teal-900 mb-2">📊 Ventes, Stocks & Ruptures Mensuelles</h3>
      
      {/* 📊 Affichage du graphique */}
      <Bar data={data} />
    </div>
  );
};

export default SegmentationSalesStockChart;