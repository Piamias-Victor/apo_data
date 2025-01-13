// /components/DailySalesChart.tsx

import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ChartOptions,
} from 'chart.js';
import { FaChartLine, FaThumbsUp, FaThumbsDown } from 'react-icons/fa'; // Import d'icônes pertinentes
import { useDailySalesContext } from '@/contexts/dailySalesContext';
import { formatDateToFrench } from '@/libs/utils/date'; // Importer la fonction de formatage
import { truncate } from '@/libs/utils/truncate'; // Importer la fonction de troncature

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip);

type ViewMode = 'qty' | 'ca' | 'margin';

const DailySalesChart: React.FC = () => {
  const { dailySales, loading, error } = useDailySalesContext();
  const [viewMode, setViewMode] = useState<ViewMode>('qty'); // Métrique par défaut

  // Calculer la répartition des ventes quotidiennement
  const salesDistribution = useMemo(() => {
    const map: Record<string, { totalCA: number; totalQty: number; totalMargin: number }> = {};

    dailySales.forEach((sale) => {
      const date = sale.date;
      const qty = sale.total_quantity || 0;
      const priceWithTax = sale.avg_price_with_tax || 0;
      const avgWeightedPrice = sale.avg_weighted_average_price || 0;
      const tva = sale.tva || 0;

      // Calcul du CA pour la journée
      const totalCA = priceWithTax * qty;

      // Calcul de la marge totale : (prix HT - coût HT) * quantité
      const priceHT = priceWithTax / (1 + tva); // Prix HT = Prix TTC / (1 + TVA)
      const marginPerUnit = priceHT - avgWeightedPrice;
      const totalMargin = marginPerUnit * qty;

      if (!map[date]) {
        map[date] = { totalCA: 0, totalQty: 0, totalMargin: 0 };
      }

      map[date].totalCA += totalCA;
      map[date].totalQty += qty;
      map[date].totalMargin += totalMargin;
    });

    console.log('Daily Sales Distribution:', map); // Pour le débogage

    return map;
  }, [dailySales]);

  // Préparer les données pour le graphique avec Labels et Data
  const chartData = useMemo(() => {
    const labels = dailySales.map(sale => formatDateToFrench(sale.date));
    const dataSales = dailySales.map(sale => sale.total_sales);
    const dataMargins = dailySales.map(sale => sale.total_sales - sale.total_cost);
    const dataQuantities = dailySales.map(sale => sale.total_quantity);

    return {
      labels,
      datasets: [
        {
          label: 'CA TTC (€)',
          data: dataSales,
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Marge Totale (€)',
          data: dataMargins,
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Quantité',
          data: dataQuantities,
          fill: false,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1,
          yAxisID: 'yQuantity', // Utiliser un axe Y secondaire
        },
      ],
    };
  }, [dailySales, viewMode]);

  // Calculer les trois meilleures et les trois pires journées
  const extremeDays = useMemo(() => {
    const dayArray = dailySales.map((sale) => ({
      date: sale.date,
      formattedDate: formatDateToFrench(sale.date),
      val:
        viewMode === 'ca'
          ? sale.total_sales
          : viewMode === 'qty'
          ? sale.total_quantity
          : sale.total_sales - sale.total_cost,
    }));

    // Trier les journées par valeur décroissante pour les meilleures
    const sortedDesc = [...dayArray].sort((a, b) => b.val - a.val);
    const top3 = sortedDesc.slice(0, 3);

    // Trier les journées par valeur croissante pour les pires
    const sortedAsc = [...dayArray].sort((a, b) => a.val - b.val);
    const bottom3 = sortedAsc.slice(0, 3);

    return { top3, bottom3 };
  }, [dailySales, viewMode]);

  // Configuration du graphique
  const chartOptions: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false, // Permet de contrôler la taille du graphique
    plugins: {
      title: {
        display: true,
        text: `Répartition du ${
          viewMode === 'ca' ? 'CA TTC' : viewMode === 'qty' ? 'Quantité' : 'Marge Totale'
        } par Jour`,
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          // Supprimer le titre du tooltip (la date)
          title: () => [],
          // Personnaliser les labels du tooltip
          label: (tooltipItem) => {
            const datasetLabel = tooltipItem.dataset.label || '';
            const value = tooltipItem.parsed.y as number;
            if (datasetLabel === 'CA TTC (€)' || datasetLabel === 'Marge Totale (€)') {
              return `${datasetLabel}: €${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else if (datasetLabel === 'Quantité') {
              return `${datasetLabel}: ${value}`;
            }
            return `${datasetLabel}: ${value}`;
          },
        },
      },
      legend: {
        display: false, // Suppression de la légende
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: 'CA TTC (€) & Marge Totale (€)',
        },
        beginAtZero: true,
      },
      yQuantity: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Quantité',
        },
        grid: {
          drawOnChartArea: false, // Ne pas afficher la grille pour l'axe Y secondaire
        },
        beginAtZero: true,
      },
    },
  }), [viewMode]);

  if (loading) return <p className="text-center text-gray-500">Chargement des données...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (dailySales.length === 0) return <p className="text-center text-gray-500">Aucune donnée disponible</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Carte principale */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* En-tête avec titre et icône */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaChartLine className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-primary">Ventes Quotidiennes Globales</h2>
          </div>
          {/* Boutons de sélection de métrique */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('ca')}
              className={`px-4 py-2 rounded ${
                viewMode === 'ca' ? 'bg-secondary text-white' : 'bg-gray-200 text-black'
              } hover:bg-secondary hover:text-white transition`}
            >
              CA TTC
            </button>
            <button
              onClick={() => setViewMode('margin')}
              className={`px-4 py-2 rounded ${
                viewMode === 'margin' ? 'bg-secondary text-white' : 'bg-gray-200 text-black'
              } hover:bg-secondary hover:text-white transition`}
            >
              Marge Totale
            </button>
            <button
              onClick={() => setViewMode('qty')}
              className={`px-4 py-2 rounded ${
                viewMode === 'qty' ? 'bg-secondary text-white' : 'bg-gray-200 text-black'
              } hover:bg-secondary hover:text-white transition`}
            >
              Quantité
            </button>
          </div>
        </div>

        {/* Cartes des Trois Meilleures et Trois Pires Journées */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Trois Meilleures Journées */}
          {extremeDays.top3.length > 0 && (
            <div className="flex-1 bg-green-100 shadow rounded-lg p-6 flex flex-col">
              <div className="flex items-center mb-2">
                <FaThumbsUp className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-md font-medium text-green-500">Trois Meilleures Journées</h3>
              </div>
              <ul className="list-none">
                {extremeDays.top3.map((day, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <span className="text-sm font-semibold text-green-700">{truncate(day.formattedDate, 10)}</span>
                    <span className="ml-auto text-sm text-green-600">
                      {viewMode === 'ca' || viewMode === 'margin'
                        ? `€${day.val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : day.val.toLocaleString('fr-FR')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trois Pires Journées */}
          {extremeDays.bottom3.length > 0 && (
            <div className="flex-1 bg-red-100 shadow rounded-lg p-6 flex flex-col">
              <div className="flex items-center mb-2">
                <FaThumbsDown className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-md font-medium text-red-500">Trois Pires Journées</h3>
              </div>
              <ul className="list-none">
                {extremeDays.bottom3.map((day, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <span className="text-sm font-semibold text-red-700">{truncate(day.formattedDate, 10)}</span>
                    <span className="ml-auto text-sm text-red-600">
                      {viewMode === 'ca' || viewMode === 'margin'
                        ? `€${day.val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : day.val.toLocaleString('fr-FR')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Graphique Line */}
        <div className="w-full h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DailySalesChart;
