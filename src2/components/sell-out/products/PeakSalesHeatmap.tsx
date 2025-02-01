import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Bubble } from "react-chartjs-2";
import { FaChartLine } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, PointElement, TimeScale, Tooltip, Legend);

interface PeakSaleItem {
  date: string;       // Exemple : "2025-01-01"
  product: string;
  code: string;
  totalQuantity: number;
  totalRevenue: number;
}
interface PeakSalesBubbleChartProps {
  data: PeakSaleItem[];
}

// Palette pastel (vous pouvez en ajouter/retirer)
const PASTEL_COLORS = [
  "rgba(255, 159, 64, 0.6)",
  "rgba(255, 205, 86, 0.6)",
  "rgba(75, 192, 192, 0.6)",
  "rgba(54, 162, 235, 0.6)",
  "rgba(153, 102, 255, 0.6)",
  "rgba(201, 203, 207, 0.6)",
  "rgba(255, 99, 132, 0.6)",
];

/**
 * Génère une couleur pastel depuis notre tableau en fonction de l’index.
 */
const getPastelColor = (index: number) => {
  return PASTEL_COLORS[index % PASTEL_COLORS.length];
};

const PeakSalesBubbleChart: React.FC<PeakSalesBubbleChartProps> = ({ data }) => {
  // Transformez les données pour qu'elles soient compatibles avec le Bubble Chart
  const chartData = {
    datasets: data.map((item, index) => ({
      label: item.product,
      data: [
        {
          // Convertit la date en timestamp (axe X = date)
          x: new Date(item.date).getTime(),
          // Axe Y = quantités vendues
          y: item.totalQuantity,
          // Rayon de la bulle basé sur la racine du chiffre d’affaires
          r: Math.sqrt(item.totalRevenue) / 10,
        },
      ],
      backgroundColor: getPastelColor(index),
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderWidth: 1,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const { x, y } = context.raw;
            // On recalcule le CA pour l’afficher dans le tooltip
            const revenue = Math.pow(context.raw.r * 10, 2);
            return `Produit: ${context.dataset.label}
Date: ${new Date(x).toLocaleDateString()}
Ventes: ${y}
CA: ${revenue.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "dd/MM/yyyy",
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantité Totale Vendue",
        },
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-6 h-full">
      {/* Titre + icône */}
      <div className="flex items-center gap-3 mb-4">
        <FaChartLine className="h-8 w-8 text-pink-500" />
        <h2 className="text-xl font-bold text-gray-800">Pics de Ventes (Bubble)</h2>
      </div>

      <div className="h-[400px]">
        <Bubble data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PeakSalesBubbleChart;