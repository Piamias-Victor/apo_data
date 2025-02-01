import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { FaChartBar } from "react-icons/fa";
import { useGrowthPurchasesByProductContext } from "@/contexts/sell-in/GrowthPurchasesByProductContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const GrowthPurchasesByProductChart = () => {
  const { products, loading } = useGrowthPurchasesByProductContext();

  // Limite la longueur des noms des produits pour la lisibilité
  const MAX_LABEL_LENGTH = 15;
  const truncateLabel = (label: string) =>
    label.length > MAX_LABEL_LENGTH ? `${label.slice(0, MAX_LABEL_LENGTH)}...` : label;

  // Préparer les données pour Chart.js
  const chartData = {
    labels: products.map((p) => truncateLabel(p.productName)),
    datasets: [
      {
        label: "Prix d'Achat Moyen Actuel (€)",
        data: products.map((p) => p.currentAvgPrice),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Prix d'Achat Moyen Précédent (€)",
        data: products.map((p) => p.previousAvgPrice),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            return `${value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Produits" },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
      },
      y: {
        title: { display: true, text: "Prix Moyen (€)" },
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-8 w-full">
      <div className="flex items-center gap-4 mb-4">
        <FaChartBar className="h-12 w-12 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">Évolution du Prix d'Achat Moyen par Produit</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-500 text-lg">Chargement...</p>
      ) : (
        <div className="h-[500px] w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default GrowthPurchasesByProductChart;