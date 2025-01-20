import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaChartPie } from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend);

// Fonction pour générer une couleur aléatoire
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Fonction pour associer des couleurs uniques à chaque lab distributor
const generateColorsForLabDistributors = (labDistributors: string[]) => {
  const colors: { [key: string]: string } = {};
  labDistributors.forEach((labDistributor) => {
    if (!colors[labDistributor]) {
      colors[labDistributor] = getRandomColor();
    }
  });
  return colors;
};

interface SalesByLabDistributorsChartProps {
  labDistributors: { labDistributor: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
}

const SalesByLabDistributorsChart = ({
  labDistributors,
  loading,
}: SalesByLabDistributorsChartProps) => {
  // Filtrer les lab distributors pour exclure ceux ayant le nom "Inconnu"
  const filteredLabDistributors = labDistributors.filter(
    (ld) => ld.labDistributor.toLowerCase() !== "inconnu"
  );

  // Générer des couleurs aléatoires pour chaque lab distributor filtré
  const colors = generateColorsForLabDistributors(
    filteredLabDistributors.map((ld) => ld.labDistributor)
  );

  const chartData = {
    labels: filteredLabDistributors.map((ld) => ld.labDistributor), // Labels des lab distributors filtrés
    datasets: [
      {
        label: "Revenus par Lab Distributor (en €)",
        data: filteredLabDistributors.map((ld) => ld.revenue), // Données des revenus
        backgroundColor: filteredLabDistributors.map((ld) => colors[ld.labDistributor]), // Couleurs générées
        borderColor: "#ffffff", // Bordures blanches
        borderWidth: 2, // Largeur des bordures
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Important pour ajuster à la hauteur
    plugins: {
      legend: {
        display: false, // Masquer la légende
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            return `${value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-8 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaChartPie className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">Graphique des Ventes par Lab Distributor</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-500 text-lg">Chargement...</p>
      ) : (
        <div className="h-[400px]">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default SalesByLabDistributorsChart;
