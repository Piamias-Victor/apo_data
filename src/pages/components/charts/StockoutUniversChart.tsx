import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartOptions,
} from "chart.js";
import { FaCheckCircle } from "react-icons/fa";
import { useStockoutUniversContext } from "@/contexts/stockoutContext";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const StockoutUniversChart: React.FC = () => {
  const { stockoutUnivers, loading, error } = useStockoutUniversContext();

  // ✅ Trier les univers en fonction du taux de rupture
  const sortedUniverses = useMemo(() => {
    return [...stockoutUnivers]
      .map(u => ({
        universe: u.universe || "Inconnu",
        stockoutRate: parseFloat(String(u.stockoutRate)), // ✅ Convertir en nombre
      }))
      .sort((a, b) => b.stockoutRate - a.stockoutRate);
  }, [stockoutUnivers]);

  // ✅ Sélectionner les **Top 10 univers les plus en rupture**
  const topStockoutUniverses = sortedUniverses.slice(0, 10);

  // ✅ Récupérer les **3 MEILLEURS univers** (ceux avec le taux de rupture le plus bas)
  const bestStockoutUniverses = sortedUniverses.slice(-3);

  // 📊 Labels et valeurs pour le graphique
  const chartLabels = topStockoutUniverses.map((u) => u.universe);
  const chartData = topStockoutUniverses.map((u) => u.stockoutRate);

  const dataChart = {
    labels: chartLabels,
    datasets: [
      {
        label: "Taux de rupture (%)",
        data: chartData,
        backgroundColor: chartData.map((_, i) =>
          i === 0 ? "rgba(255, 99, 132, 0.6)" : "rgba(54, 162, 235, 0.6)"
        ),
        borderColor: chartData.map((_, i) =>
          i === 0 ? "rgba(255, 99, 132, 1)" : "rgba(54,162,235,1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  const optionsChart: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: { display: false },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Univers" },
        ticks: { maxRotation: 90, minRotation: 45 },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Taux de rupture (%)" },
        ticks: {
          callback: function (value: number) {
            return `${value}%`;
          },
        },
      },
    },
  };

  // 🚀 **Gestion du chargement et des erreurs**
  if (loading) return <p className="text-center text-gray-600">Chargement du graphique...</p>;
  if (error) return <p className="text-center text-red-500">Erreur: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* 🏆 Carte principale */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* 🏷️ En-tête avec titre */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">
            Taux de rupture par univers
          </h2>
        </div>

        {/* ✅ Cartes des **3 MEILLEURS univers** */}
        {bestStockoutUniverses.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {bestStockoutUniverses.map((universe, index) => (
              <div
                key={index}
                className="flex-1 bg-green-100 shadow rounded-lg p-4 flex items-center"
              >
                <FaCheckCircle className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-green-600">Meilleur Univers</p>
                  <p className="mt-1 text-lg font-semibold text-green-800 break-words">
                    {universe.universe}
                  </p>
                  <p className="mt-1 text-md text-green-700">{universe.stockoutRate}%</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 📊 Graphique Bar */}
        <Bar data={dataChart} options={optionsChart} />
      </div>
    </div>
  );
};

export default StockoutUniversChart;
