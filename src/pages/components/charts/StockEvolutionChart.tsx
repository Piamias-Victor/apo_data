import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
} from 'chart.js';
import { FaChartLine } from 'react-icons/fa';
import { useStockEvolutionContext } from '@/contexts/stockEvolutionContext';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const StockEvolutionChart: React.FC = () => {
  const { stockEvolution, loading, error } = useStockEvolutionContext();

  if (loading) return <p className="text-center text-gray-500">Chargement des données...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (stockEvolution.length === 0) return <p className="text-center text-gray-500">Aucune donnée disponible</p>;

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    return {
      labels: stockEvolution.map(entry => entry.date),
      datasets: [
        {
          label: 'Valeur du Stock (€)',
          data: stockEvolution.map(entry => entry.total_value),
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
      ],
    };
  }, [stockEvolution]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* En-tête avec icône et titre */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaChartLine className="h-8 w-8 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-blue-500">Évolution du Stock Global</h2>
          </div>
        </div>

        {/* Graphique Line - Pleine largeur */}
        <div className="w-full h-[450px]">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default StockEvolutionChart;
