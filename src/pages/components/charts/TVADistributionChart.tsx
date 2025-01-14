// /components/TVADistributionChart.tsx

import React, { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
} from 'chart.js';
import { FaChartPie, FaDollarSign } from 'react-icons/fa'; // Import d'icônes pertinentes
import { GroupedSale } from '@/types/Sale';
import { truncate } from '@/libs/utils/truncate'; // Import de la fonction de troncature

// Enregistrement des composants nécessaires de Chart.js
ChartJS.register(ArcElement, Title, Tooltip, Legend);

// Props du composant
type TVADistributionChartProps = {
  groupedSales: GroupedSale[];
};

type ChartMetric = 'qty' | 'ca' | 'margin';

const TVADistributionChart: React.FC<TVADistributionChartProps> = ({
  groupedSales,
}) => {
  const [viewMode, setViewMode] = useState<ChartMetric>('qty'); // Métrique par défaut

  // Calculer la répartition par taux de TVA dynamiquement
  const tvaDistribution = useMemo(() => {
    const tvaMap: Record<string, { totalCA: number; totalQty: number; totalMargin: number }> = {};

    // Pour chaque vente, déterminer le taux de TVA associé et cumuler les valeurs
    (groupedSales ?? []).forEach(sale => {
      const tvaRate = ((sale.tva) * 100).toString(); // Convertir TVA en pourcentage entier
      const qty = sale.total_quantity || 0;
      const priceWithTax = sale.avg_price_with_tax || 0;
      const avgWeightedPrice = sale.avg_weighted_average_price || 0;

      // Calcul du CA pour l'article
      const totalCA = priceWithTax * qty;

      // Calcul de la marge totale : (prix HT - coût HT) * quantité
      const priceHT = priceWithTax / (1 + sale.tva); // Prix HT = Prix TTC / (1 + TVA)
      const marginPerUnit = priceHT - avgWeightedPrice;
      const totalMargin = marginPerUnit * qty;

      // Si ce taux de TVA n'a pas encore été ajouté, l'initialiser
      if (!tvaMap[tvaRate]) {
        tvaMap[tvaRate] = { totalCA: 0, totalQty: 0, totalMargin: 0 };
      }

      // On cumule les valeurs dans le bon segment de TVA
      tvaMap[tvaRate].totalCA += totalCA;
      tvaMap[tvaRate].totalQty += qty;
      tvaMap[tvaRate].totalMargin += totalMargin;
    });

    console.log('TVA Distribution Map:', tvaMap); // Ajouter un log pour vérifier les valeurs

    return tvaMap;
  }, [groupedSales]);

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    const labels = Object.keys(tvaDistribution).sort((a, b) => parseFloat(a) - parseFloat(b)); // Trier les taux de TVA
    const data = labels.map((rate) => {
      switch (viewMode) {
        case 'ca':
          return tvaDistribution[rate].totalCA;
        case 'qty':
          return tvaDistribution[rate].totalQty;
        case 'margin':
          return tvaDistribution[rate].totalMargin;
        default:
          return 0;
      }
    });

    // Générer des couleurs dynamiques si nécessaire
    const backgroundColors = labels.map((_, index) => {
      const colors = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)',
        'rgba(83, 102, 255, 0.6)',
        'rgba(255, 99, 71, 0.6)',
        'rgba(60, 179, 113, 0.6)',
      ];
      return colors[index % colors.length];
    });

    const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

    return {
      labels: labels.map((tvaRate) => `${tvaRate}%`), // Taux de TVA
      datasets: [
        {
          label:
            viewMode === 'ca'
              ? 'CA Total par Taux de TVA'
              : viewMode === 'qty'
              ? 'Quantités par Taux de TVA'
              : 'Marge Totale par Taux de TVA',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [tvaDistribution, viewMode]);

  // Calculer les deux taux de TVA les plus rentables et les moins rentables
  const extremeTVAs = useMemo(() => {
    const tvaArray = Object.entries(tvaDistribution).map(([tvaRate, values]) => ({
      tvaRate,
      val: viewMode === 'ca' ? values.totalCA : viewMode === 'qty' ? values.totalQty : values.totalMargin,
    }));
    tvaArray.sort((a, b) => a.val - b.val); // Trier par ordre croissant
    const leastRentable = tvaArray[0];
    const mostRentable = tvaArray[tvaArray.length - 1];
    return { leastRentable, mostRentable };
  }, [tvaDistribution, viewMode]);

  // Configuration du graphique avec typage explicite
  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false, // Permet de contrôler la taille du graphique
    plugins: {
      title: {
        display: false, // Déjà inclus dans l'en-tête
        text: `Répartition du ${
          viewMode === 'ca' ? 'CA TTC' : viewMode === 'qty' ? 'Quantité' : 'Marge Totale'
        } par Taux de TVA`,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw as number;
            return `${viewMode === 'ca' ? 'CA TTC: €' : viewMode === 'qty' ? 'Quantité: ' : 'Marge Totale: €'}${value.toLocaleString(
              'fr-FR',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`;
          },
        },
      },
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Carte principale */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* En-tête avec titre et icône */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaChartPie className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-primary">Répartition TVA</h2>
          </div>
          {/* Boutons de sélection de métrique */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('qty')}
              className={`px-4 py-2 rounded ${
                viewMode === 'qty' ? 'bg-secondary text-white' : 'bg-gray-200 text-black'
              } hover:bg-secondary hover:text-white transition`}
            >
              Quantité
            </button>
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
          </div>
        </div>

        {/* Cartes d'Informations */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Taux de TVA le plus rentable */}
          {extremeTVAs.mostRentable && (
            <div className="flex-1 bg-green-100 shadow rounded-lg p-6 flex items-center">
              <FaDollarSign className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-green-500">Taux de TVA le plus rentable</p>
                <p className="mt-1 text-lg font-semibold text-green-700 break-words" title={`${extremeTVAs.mostRentable.tvaRate}%`}>
                  {truncate(`${extremeTVAs.mostRentable.tvaRate}%`, 20)} {/* Taux avec troncature */}
                </p>
                <p className="mt-1 text-md text-green-600">
                  {viewMode === 'ca' || viewMode === 'margin'
                    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(extremeTVAs.mostRentable.val)
                    : extremeTVAs.mostRentable.val.toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          )}

          {/* Taux de TVA le moins rentable */}
          {extremeTVAs.leastRentable && (
            <div className="flex-1 bg-red-100 shadow rounded-lg p-6 flex items-center">
              <FaDollarSign className="h-8 w-8 text-red-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-red-500">Taux de TVA le moins rentable</p>
                <p className="mt-1 text-lg font-semibold text-red-700 break-words" title={`${extremeTVAs.leastRentable.tvaRate}%`}>
                  {truncate(`${extremeTVAs.leastRentable.tvaRate}%`, 20)} {/* Taux avec troncature */}
                </p>
                <p className="mt-1 text-md text-red-600">
                  {viewMode === 'ca' || viewMode === 'margin'
                    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(extremeTVAs.leastRentable.val)
                    : extremeTVAs.leastRentable.val.toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Graphique Doughnut */}
        <div className="w-full h-96">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default TVADistributionChart;
