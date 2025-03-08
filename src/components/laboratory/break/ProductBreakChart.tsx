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
  total_quantity_ordered: number;
  total_stock_break_quantity: number;
  total_stock_break_amount: number;
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

  // Configuration des données du graphique
  const chartData = {
    labels,
    datasets: [
      {
        label: "Quantité Vendue",
        data: sortedData.map(data => data.total_quantity_sold || 0),
        backgroundColor: "rgba(75, 192, 192, 0.7)", // Vert
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      },
      {
        label: "Quantité Commandée",
        data: sortedData.map(data => data.total_quantity_ordered || 0),
        backgroundColor: "rgba(54, 162, 235, 0.7)", // Bleu
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      },
      {
        label: "Rupture (Qté)",
        data: sortedData.map(data => data.total_stock_break_quantity || 0),
        backgroundColor: "rgba(255, 99, 132, 0.7)", // Rouge
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1
      },
      {
        label: "Rupture (€)",
        data: sortedData.map(data => data.total_stock_break_amount || 0),
        backgroundColor: "rgba(255, 159, 64, 0.7)", // Orange
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
        // Utiliser un axe Y secondaire pour les montants
        yAxisID: 'y1'
      },
    ],
  };

  // Options du graphique
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === "Rupture (€)") {
                label += new Intl.NumberFormat('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y.toFixed(0);
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantités'
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Montant (€)'
        },
        grid: {
          display: false,
        }
      }
    }
  };

  return (
    <div className="w-full h-80 p-4 bg-white rounded-lg shadow-inner">
      <h3 className="text-lg font-medium text-gray-700 mb-3">Évolution des ruptures sur les derniers mois</h3>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ProductBreakChart;