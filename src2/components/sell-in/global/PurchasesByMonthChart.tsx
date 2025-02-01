import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaChartLine } from "react-icons/fa";
import { usePurchasesByMonthContext } from "@/contexts/sell-in/PurchasesByMonthContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(".", ",")} M€`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2).replace(".", ",")} K€`;
  }
  return `${value.toFixed(2).replace(".", ",")} €`;
};

const PurchasesByMonthChart: React.FC = () => {
  const { months, quantities, costs, loading } = usePurchasesByMonthContext();

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Quantités achetées",
        data: quantities,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.3,
      },
      {
        label: "Coût total des achats",
        data: costs,
        borderColor: "#ff9800",
        backgroundColor: "rgba(255, 152, 0, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            return `${formatLargeNumber(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Valeurs (en euros)",
        },
        ticks: {
          callback: (value: number) => formatLargeNumber(value),
        },
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-8 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaChartLine className="h-12 w-12 text-orange-500" />
        <h2 className="text-xl font-bold text-gray-800">Évolution des Achats par Mois</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-500 text-lg">Chargement...</p>
      ) : (
        <div className="h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default PurchasesByMonthChart;