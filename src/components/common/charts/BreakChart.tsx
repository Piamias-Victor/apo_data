// components/laboratory/break/ProductBreakChart.tsx
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

interface BreakData {
  month: string;
  total_quantity_sold: number;
  avg_stock_quantity?: number;
  stock_break_quantity?: number;
  total_quantity_ordered?: number;
  total_stock_break_quantity?: number;
  total_stock_break_amount?: number;
  max_selling_price?: number;
  min_selling_price?: number;
}

interface ProductBreakChartProps {
  breakData: BreakData[];
}

/**
 * Graphique des ruptures mensuelles pour un produit
 */
const ProductBreakChart: React.FC<ProductBreakChartProps> = ({ breakData }) => {
  // Vérification des données
  if (!breakData || breakData.length === 0) {
    return <p className="text-gray-500 text-center mt-2">Aucune donnée disponible.</p>;
  }

  // Tri des données par mois
  const sortedData = useMemo(() => {
    return [...breakData].sort((a, b) => a.month.localeCompare(b.month));
  }, [breakData]);

  // Extraction des labels (mois) pour l'axe X
  const labels = sortedData.map(data => data.month);

  // Détermine si nous avons des données de prix
  const hasPriceData = sortedData.some(data => 
    data.max_selling_price !== undefined || 
    data.min_selling_price !== undefined
  );

  // Calcul des prix max et min si disponibles
  const maxPrice = hasPriceData 
    ? Math.max(...sortedData.map(data => data.max_selling_price || 0)) 
    : 0;
  const minPrice = hasPriceData 
    ? Math.min(...sortedData.filter(data => (data.min_selling_price || 0) > 0).map(data => data.min_selling_price || 0)) 
    : 0;

  // Configuration des données du graphique
  const chartData = {
    labels,
    datasets: [
      {
        label: "Quantité Vendue",
        data: sortedData.map(data => data.total_quantity_sold || 0),
        backgroundColor: "rgba(54, 162, 235, 0.7)", // Bleu
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      },
      {
        label: sortedData[0]?.avg_stock_quantity !== undefined ? "Stock Moyen" : "Quantité Commandée",
        data: sortedData.map(data => data.avg_stock_quantity !== undefined 
          ? data.avg_stock_quantity 
          : data.total_quantity_ordered || 0
        ),
        backgroundColor: "rgba(75, 192, 192, 0.7)", // Vert
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      },
      {
        label: "Ruptures de Stock",
        data: sortedData.map(data => 
          data.stock_break_quantity !== undefined 
            ? data.stock_break_quantity 
            : data.total_stock_break_quantity || 0
        ),
        backgroundColor: "rgba(255, 99, 132, 0.7)", // Rouge
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1
      }
    ]
  };

  // Options du graphique
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="mt-4 bg-white shadow p-4 rounded-lg w-full">
      {/* Affichage des prix min/max si disponibles */}
      {hasPriceData && (
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md shadow-sm mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">💰 Prix Minimum</p>
            <p className="text-lg font-bold text-green-600">{minPrice.toFixed(2)} €</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">💰 Prix Maximum</p>
            <p className="text-lg font-bold text-red-600">{maxPrice.toFixed(2)} €</p>
          </div>
        </div>
      )}

      {/* Titre du graphique */}
      <h3 className="text-lg font-semibold text-teal-900 mb-2">📊 Ventes, Stocks & Ruptures Mensuelles</h3>
      
      {/* Graphique */}
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ProductBreakChart;