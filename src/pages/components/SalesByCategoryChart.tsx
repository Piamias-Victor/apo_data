import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaChartPie } from "react-icons/fa";
import { Universe } from "@/types/Universe";
import { useUniversesContext } from "@/contexts/universesContext";

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

// Fonction pour obtenir la couleur d'une catégorie via son univers parent
const getColorForCategory = (category: string, universes: Universe[]) => {
  for (const universe of universes) {
    for (const cat of universe.categories) {
      if (cat.category === category) {
        return UNIVERS_COLORS[universe.universe.toUpperCase()] || "#A9A9A9"; // Gris par défaut
      }
    }
  }
  return "#A9A9A9"; // Gris par défaut si aucun univers n'est trouvé
};

interface SalesByCategoryChartProps {
  categories: { category: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
}

const SalesByCategoryChart = ({ categories, loading }: SalesByCategoryChartProps) => {
  const { universes } = useUniversesContext(); // Accéder aux univers via le contexte

  // Filtrer les catégories qui appartiennent à l'univers "Inconnu"
  const filteredCategories = categories.filter((category) => {
    const parentUniverse = universes.find((universe) =>
      universe.categories.some((cat) => cat.category === category.category)
    );
    return parentUniverse && parentUniverse.universe !== "Inconnu";
  });

  const chartData = {
    labels: filteredCategories.map((c) => c.category), // Labels des catégories filtrées
    datasets: [
      {
        label: "Revenus par Catégorie (en €)",
        data: filteredCategories.map((c) => c.revenue), // Données des revenus
        backgroundColor: filteredCategories.map((c) =>
          getColorForCategory(c.category, universes)
        ), // Couleurs des catégories
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
        <h2 className="text-xl font-bold text-gray-800">Graphique des Ventes par Catégorie</h2>
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

export default SalesByCategoryChart;
