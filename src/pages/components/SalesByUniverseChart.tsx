import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaChartPie } from "react-icons/fa";

// Enregistrer les composants de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Couleurs des univers
const UNIVERS_COLORS: { [key: string]: string } = {
  "BANDES COMPRESSES PANSEMENTS MEDICAUX": "#FFA07A",
  "BEBE": "#87CEFA",
  "BIEN ÊTRE AU QUOTIDIEN": "#FFD700",
  "DERMOCOSMETIQUE": "#FFB6C1",
  "DIVERS ACCESSOIRES MEDICAUX": "#C0C0C0",
  "DIVERS CONSEIL ET PRESCRIPTION SANS AMM DONT LPPR - POD": "#40E0D0",
  "MASQUES DE PROTECTION": "#FF7F7F",
  "MATERIEL MEDICAL": "#B0C4DE",
  "MEDICATION FAMILIALE": "#BA55D3",
  "MEDICATION FAMILIALE ALLOPATHIE CONSEIL": "#4682B4",
  "MEDICATION FAMILIALE HOMEOPATHIE DEREMBOURSEE ET CONSEIL": "#FF69B4",
  "NATURE ET SANTE": "#98FB98",
  "ORTHOPEDIE - INCONTINENCE ET NUTRITION CLINIQUE": "#9370DB",
  "PRESCRIPTION OBLIGATOIRE NON REMBOURSABLE": "#4169E1",
  "SERVICES": "#FFDAB9",
  "SEVRAGE TABAC REMBOURSABLE": "#FF4500",
  "TESTS GLYCÉMIE": "#32CD32",
  "VETERINAIRE": "#00FA9A",
};

// Fonction pour obtenir la couleur d'un univers ou une couleur par défaut
const getColorForUniverse = (universe: string) => {
  return UNIVERS_COLORS[universe.toUpperCase()] || "#A9A9A9"; // Gris par défaut
};

interface SalesByUniverseChartProps {
  universes: { universe: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
}

const SalesByUniverseChart = ({ universes, loading }: SalesByUniverseChartProps) => {
  // Filtrer les univers pour exclure "Inconnu"
  const filteredUniverses = universes.filter((u) => u.universe.toLowerCase() !== "inconnu");

  const chartData = {
    labels: filteredUniverses.map((u) => u.universe), // Labels des univers filtrés
    datasets: [
      {
        label: "Revenus par Univers (en €)",
        data: filteredUniverses.map((u) => u.revenue), // Données des revenus
        backgroundColor: filteredUniverses.map((u) => getColorForUniverse(u.universe)), // Couleurs des univers
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
        <FaChartPie className="h-12 w-12 text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">Graphique des Ventes par Univers</h2>
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

export default SalesByUniverseChart;
