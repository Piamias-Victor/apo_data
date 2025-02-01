import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaShoppingCart } from "react-icons/fa";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { usePharmaciesContext } from "@/contexts/segmentation/pharmaciesContext";
import { usePurchasesByPharmacyContext } from "@/contexts/sell-in/PurchasesByPharmacyContext";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PharmacyItem {
  pharmacyId: string;
  quantity: number;
  cost: number;
}

const PurchasesByPharmacyChart: React.FC = () => {
  const { pharmacies, loading } = usePurchasesByPharmacyContext();
  const { pharmacies: allPharmacies, loading: pharmLoading } = usePharmaciesContext();
  const { setFilters } = useFilterContext();

  // Fonction pour récupérer le nom de la pharmacie
  const getPharmacyName = (pharmacyId: string) => {
    const found = allPharmacies.find((p) => p.id === pharmacyId);
    return found?.name || pharmacyId || "Inconnu";
  };

  // Filtrer les pharmacies inconnues
  const filteredPharmacies = pharmacies.filter((p) => p.pharmacyId !== "unknown");

  // Générer les données pour le graphique
  const chartData = {
    labels: filteredPharmacies.map((p) => getPharmacyName(p.pharmacyId)),
    datasets: [
      {
        label: "Coût des achats par Pharmacie (en €)",
        data: filteredPharmacies.map((p) => p.cost),
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336", "#2196F3", "#9C27B0", "#009688"],
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
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const selectedPharmacy = chartData.labels[index];

        // Appliquer le filtre par pharmacie
        setFilters((prevFilters) => ({
          ...prevFilters,
          pharmacy: selectedPharmacy,
        }));
      }
    },
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-8 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaShoppingCart className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">Achats par Pharmacie</h2>
      </div>

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

export default PurchasesByPharmacyChart;