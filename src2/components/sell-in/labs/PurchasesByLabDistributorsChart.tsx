import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaChartPie } from "react-icons/fa";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { usePurchasesByLabDistributorsContext } from "@/contexts/sell-in/PurchasesByLabDistributorsContext";

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

// Fonction pour associer des couleurs uniques à chaque lab distributeur
const generateColorsForLabDistributors = (labDistributors: string[]) => {
  const colors: { [key: string]: string } = {};
  labDistributors.forEach((labDistributor) => {
    if (!colors[labDistributor]) {
      colors[labDistributor] = getRandomColor();
    }
  });
  return colors;
};

const PurchasesByLabDistributorsChart: React.FC = () => {
  const { labDistributors, loading } = usePurchasesByLabDistributorsContext();
  const { setFilters } = useFilterContext();

  // Filtrer les lab distributeurs pour exclure ceux ayant le nom "Inconnu"
  const filteredLabDistributors = labDistributors.filter(
    (ld) => ld.labDistributor.toLowerCase() !== "inconnu"
  );

  // Générer des couleurs aléatoires pour chaque lab distributeur filtré
  const colors = generateColorsForLabDistributors(
    filteredLabDistributors.map((ld) => ld.labDistributor)
  );

  const chartData = {
    labels: filteredLabDistributors.map((ld) => ld.labDistributor), // Labels des lab distributeurs filtrés
    datasets: [
      {
        label: "Coût des achats par Lab Distributor (en €)",
        data: filteredLabDistributors.map((ld) => ld.cost), // Données des coûts
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
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const selectedLabDistributor = chartData.labels[index];

        // Appliquer le filtre
        setFilters((prevFilters) => ({
          ...prevFilters,
          labDistributor: selectedLabDistributor,
        }));
      }
    },
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-8 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaChartPie className="h-12 w-12 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-800">Graphique des Achats par Lab Distributor</h2>
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

export default PurchasesByLabDistributorsChart;