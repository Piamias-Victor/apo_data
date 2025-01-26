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
import "chartjs-adapter-date-fns"; // Adapter pour la gestion des dates
import { Bubble } from "react-chartjs-2";

// Enregistrement des composants nécessaires
ChartJS.register(CategoryScale, LinearScale, PointElement, TimeScale, Tooltip, Legend);

interface PeakSalesData {
  peakSales: {
    date: string; // Exemple : "2025-01-01"
    product: string;
    code: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

// Fonction pour générer des couleurs aléatoires
const getRandomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.7)`; // Avec une transparence
};

const PeakSalesBubbleChart = ({ data }: { data: PeakSalesData["peakSales"] }) => {
  // Transformez les données pour qu'elles soient compatibles avec le Bubble Chart
  const chartData = {
    datasets: data.map((item) => ({
      label: item.product,
      data: [
        {
          x: new Date(item.date).getTime(), // Convertir la date en timestamp
          y: item.totalQuantity,
          r: Math.sqrt(item.totalRevenue) / 10, // Rayon du bubble basé sur le revenu
        },
      ],
      backgroundColor: getRandomColor(),
      borderColor: "rgba(0, 0, 0, 0.2)", // Couleur de bordure
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
            const revenue = Math.pow(context.raw.r * 10, 2); // Recalculer le revenu à partir du rayon
            return `Produit: ${context.dataset.label}, Date: ${new Date(x).toLocaleDateString()}, Ventes: ${y}, CA: ${revenue.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        type: "time", // Utiliser une échelle temporelle
        title: {
          display: true,
          text: "Date",
        },
        time: {
          unit: "day", // Unité de temps pour l'axe X
          tooltipFormat: "dd/MM/yyyy",
        },
      },
      y: {
        title: {
          display: true,
          text: "Quantité Totale Vendue",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">Graphique des Pics de Ventes (Bubble)</h2>
      <div className="h-[500px]">
        <Bubble data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PeakSalesBubbleChart;