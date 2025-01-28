// src/components/sell-out/pharmacy/SalesByPharmacyChart.tsx

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaChartPie } from "react-icons/fa";
import { usePharmaciesContext } from "@/contexts/segmentation/pharmaciesContext"; // <--- import contexte pharmacies

ChartJS.register(ArcElement, Tooltip, Legend);

interface PharmacyItem {
  pharmacyId: string; // L'ID (uuid) de la pharmacie
  quantity: number;
  revenue: number;
  margin: number;
}

interface SalesByPharmacyChartProps {
  pharmacies: PharmacyItem[]; // Données calculées (ventes par pharmacyId)
  loading: boolean;
}

const SalesByPharmacyChart: React.FC<SalesByPharmacyChartProps> = ({ pharmacies, loading }) => {
  // 1) Consommer le contexte des pharmacies
  const { pharmacies: allPharmacies, loading: pharmLoading } = usePharmaciesContext();

  // 2) Fonction pour obtenir le nom de la pharmacie (ou son ID)
  const getPharmacyName = (pharmacyId: string) => {
    // Cherche la pharmacie par ID
    const found = allPharmacies.find((p) => p.id === pharmacyId);
    // Si trouvé => affiche p.name, sinon => affiche l'ID ou "Inconnu"
    if (found?.name) {
      return found.name;
    }
    return pharmacyId || "Inconnu";
  };

  // Filtrer ou customiser (si vous avez des pharmacies "unknown")
  const filtered = pharmacies.filter((p) => p.pharmacyId !== "unknown");

  // 3) Construire les données du graphique
  const chartData = {
    labels: filtered.map((p) => getPharmacyName(p.pharmacyId)), // remplace p.pharmacyId par getPharmacyName
    datasets: [
      {
        label: "Revenus par Pharmacie (en €)",
        data: filtered.map((p) => p.revenue),
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336", "#2196F3", "#9C27B0", "#009688"], // etc
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw as number;
            return val.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
          },
        },
      },
    },
  };

  // 4) Rendre le composant
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-8 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaChartPie className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">Ventes par Pharmacie</h2>
      </div>

      {/* On peut afficher un loader si le contexte Pharmacies ou ce hook est en cours de chargement */}
      {loading || pharmLoading ? (
        <p className="text-center text-gray-500 text-lg">Chargement...</p>
      ) : (
        <div className="h-[400px]">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default SalesByPharmacyChart;