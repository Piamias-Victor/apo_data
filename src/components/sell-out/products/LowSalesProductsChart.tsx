import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { FaChartBar } from "react-icons/fa";
import { useLowSalesProductsContext } from "@/contexts/sell-out/LowSalesProductsContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const LowSalesProductsChart = () => {
  const { lowSalesProducts, loading, maxSalesThreshold, setMaxSalesThreshold } =
    useLowSalesProductsContext();

  const handleThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxSalesThreshold(Number(event.target.value));
  };

  const filteredProducts = lowSalesProducts.slice(0, 10); // Limite à 10 produits pour le graphe

  const chartData = {
    labels: filteredProducts.map((product) => product.name),
    datasets: [
      {
        label: "Stock",
        data: filteredProducts.map((product) => product.stock),
        backgroundColor: "#4CAF50",
        borderWidth: 1,
      },
      {
        label: "Quantité Vendue",
        data: filteredProducts.map((product) => product.quantitySold),
        backgroundColor: "#FF5722",
        borderWidth: 1,
      },
      {
        label: "Revenu (€)",
        data: filteredProducts.map((product) => product.revenue),
        backgroundColor: "#2196F3",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            return context.dataset.label === "Revenu (€)"
              ? `${value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`
              : value.toLocaleString();
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Produits",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Valeurs",
        },
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl rounded-lg p-8 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <FaChartBar className="h-12 w-12 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-800">
            Produits à Faibles Ventes (Seuil : {maxSalesThreshold} unités)
          </h2>
        </div>
        <div className="flex items-center gap-4">
            <label htmlFor="threshold" className="text-sm font-medium text-gray-600">
                Seuil de ventes max :
            </label>
            <input
                id="threshold"
                type="number"
                value={maxSalesThreshold}
                onChange={handleThresholdChange}
                min={0}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 
                        placeholder-gray-400 bg-white shadow-sm focus:outline-none 
                        focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all 
                        hover:shadow-md"
                placeholder="Quantité"
            />
        </div>
      </div>
      {loading ? (
        <p className="text-center text-gray-500 text-lg">Chargement...</p>
      ) : (
        <div className="h-[400px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default LowSalesProductsChart;