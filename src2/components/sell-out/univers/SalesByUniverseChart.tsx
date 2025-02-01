import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaChartPie } from "react-icons/fa";
import { useFilterContext } from "@/contexts/global/filtersContext";

ChartJS.register(ArcElement, Tooltip, Legend);

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

const getColorForUniverse = (universe: string) => {
  return UNIVERS_COLORS[universe.toUpperCase()] || "#A9A9A9";
};

interface SalesByUniverseChartProps {
  universes: { universe: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
}

const SalesByUniverseChart = ({ universes, loading }: SalesByUniverseChartProps) => {
  const { handleClearAllFilters, setFilters } = useFilterContext();

  const filteredUniverses = universes.filter((u) => u.universe.toLowerCase() !== "inconnu");

  const chartData = {
    labels: filteredUniverses.map((u) => u.universe),
    datasets: [
      {
        label: "Revenus par Univers (en €)",
        data: filteredUniverses.map((u) => u.revenue),
        backgroundColor: filteredUniverses.map((u) => getColorForUniverse(u.universe)),
        borderColor: "#ffffff",
        borderWidth: 2,
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
            return `${value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`;
          },
        },
      },
    },
    onClick: (event: any, elements: any) => {
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
