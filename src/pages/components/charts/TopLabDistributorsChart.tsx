// /components/TopLabDistributorsChart.tsx

import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  ChartOptions
} from 'chart.js';
import { FaChartPie, FaExclamationTriangle } from 'react-icons/fa'; // Import d'icônes pertinentes
import { GroupedSale } from '@/types/Sale';
import { truncate } from '@/libs/utils/truncate'; // Import de la fonction de troncature

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

type TopLabDistributorsChartProps = {
  groupedSales: GroupedSale[];
};

type ChartMetric = 'quantity' | 'cattc' | 'margin';

const TopLabDistributorsChart: React.FC<TopLabDistributorsChartProps> = ({ groupedSales }) => {
  const [chartMetric, setChartMetric] = useState<ChartMetric>('quantity'); // Métrique par défaut

  // Calcul des valeurs pour chaque distributeur de laboratoire en fonction de la métrique choisie
  const labDistributorMap: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};

    (groupedSales ?? []).forEach(sale => {
      const labDistributor = sale.lab_distributor || 'Inconnu';
      let value = 0;

      switch (chartMetric) {
        case 'quantity':
          value = sale.total_quantity;
          break;
        case 'cattc':
          value = sale.avg_price_with_tax * sale.total_quantity;
          break;
        case 'margin':
          // Calcul de la marge totale : (prix HT - coût HT) * quantité
          const priceHT = sale.avg_price_with_tax / (1 + sale.tva / 100);
          const marginPerUnit = priceHT - sale.avg_weighted_average_price;
          value = marginPerUnit * sale.total_quantity;
          break;
        default:
          value = 0;
      }

      // Validation supplémentaire
      if (!isFinite(value)) {
        console.warn(`Valeur non finie pour le distributeur "${labDistributor}" avec la métrique "${chartMetric}":`, value);
        value = 0; // Optionnel : Réinitialiser à 0 ou une autre valeur par défaut
      }

      map[labDistributor] = (map[labDistributor] || 0) + value;
    });

    console.log('Lab Distributor Map:', map); // Ajouter un log pour vérifier les valeurs

    return map;
  }, [groupedSales, chartMetric]);

  // Convertir le map en array et trier pour obtenir les Top 10
  const topLabDistributors = useMemo(() => {
    const distributorsArray = Object.entries(labDistributorMap).map(([distributorName, val]) => ({ distributorName, val }));
    distributorsArray.sort((a, b) => b.val - a.val);
    return distributorsArray.slice(0, 10); // Top 10 distributeurs
  }, [labDistributorMap]);

  // Calculer les trois pires distributeurs globalement
  const worstLabDistributors = useMemo(() => {
    const distributorsArray = Object.entries(labDistributorMap).map(([distributorName, val]) => ({ distributorName, val }));
    distributorsArray.sort((a, b) => a.val - b.val); // Trier par ordre croissant
    return distributorsArray.slice(0, 3); // Trois pires distributeurs
  }, [labDistributorMap]);

  const chartLabels = topLabDistributors.map(c => truncate(c.distributorName, 20)); // Limiter à 20 caractères
  const chartData = topLabDistributors.map(c => c.val);

  const metricLabel = useMemo(() => {
    switch (chartMetric) {
      case 'quantity':
        return 'Quantités vendues';
      case 'cattc':
        return 'CA TTC';
      case 'margin':
        return 'Marge Totale';
      default:
        return '';
    }
  }, [chartMetric]);

  const dataChart = {
    labels: chartLabels,
    datasets: [
      {
        label: metricLabel,
        data: chartData,
        backgroundColor: chartData.map((_, i) => 
          i === 0 ? 'rgba(255, 159, 64, 0.6)' : 'rgba(54, 162, 235, 0.6)' // Exemple : couleur différente pour le premier élément
        ),
        borderColor: chartData.map((_, i) => 
          i === 0 ? 'rgba(255, 159, 64, 1)' : 'rgba(54,162,235,1)' // Couleur correspondante
        ),
        borderWidth: 1,
      }
    ]
  };

  const optionsChart = {
    responsive: true,
    plugins: {
      title: {
        display: false, // Déjà inclus dans l'en-tête
        text: 'Top 10 Distributeurs de Laboratoire'
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            if (chartMetric === 'cattc' || chartMetric === 'margin') {
              return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
            }
            return value.toLocaleString('fr-FR');
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Distributeur de Laboratoire'
        },
        ticks: {
          maxRotation: 90,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: chartMetric === 'cattc' || chartMetric === 'margin' ? '€' : 'Quantité'
        },
        ticks: {
          callback: function(value: number) {
            if (chartMetric === 'cattc' || chartMetric === 'margin') {
              return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
            }
            return value.toLocaleString('fr-FR');
          }
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Carte principale */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* En-tête avec titre et icône */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaChartPie className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-primary">Top 10 Distributeurs de Laboratoire</h2>
          </div>
          {/* Boutons de sélection de métrique */}
          <div className="flex space-x-2">
            <button
              onClick={() => setChartMetric('quantity')}
              className={`px-4 py-2 rounded ${chartMetric === 'quantity' ? 'bg-secondary text-white' : 'bg-gray-200 text-black'} hover:bg-secondary hover:text-white transition`}
            >
              Quantité
            </button>
            <button
              onClick={() => setChartMetric('cattc')}
              className={`px-4 py-2 rounded ${chartMetric === 'cattc' ? 'bg-secondary text-white' : 'bg-gray-200 text-black'} hover:bg-secondary hover:text-white transition`}
            >
              CA TTC
            </button>
            <button
              onClick={() => setChartMetric('margin')}
              className={`px-4 py-2 rounded ${chartMetric === 'margin' ? 'bg-secondary text-white' : 'bg-gray-200 text-black'} hover:bg-secondary hover:text-white transition`}
            >
              Marge Totale
            </button>
          </div>
        </div>

        {/* Cartes des Trois Pires Distributeurs */}
        {worstLabDistributors.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {worstLabDistributors.map((distributor, index) => (
              <div key={index} className="flex-1 bg-red-100 shadow rounded-lg p-4 flex items-center">
                <FaExclamationTriangle className="h-8 w-8 text-red-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-red-500">Pire Distributeur</p>
                  <p className="mt-1 text-lg font-semibold text-red-700 break-words" title={distributor.distributorName}>
                    {distributor.distributorName} {/* Afficher le nom complet sans troncature */}
                  </p>
                  <p className="mt-1 text-md text-red-600">
                    {chartMetric === 'cattc' || chartMetric === 'margin' 
                      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(distributor.val)
                      : distributor.val.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Graphique Bar */}
        <Bar data={dataChart} options={optionsChart as unknown as ChartOptions<'bar'>}/>
        
      </div>
    </div>
  );
};

export default TopLabDistributorsChart;
