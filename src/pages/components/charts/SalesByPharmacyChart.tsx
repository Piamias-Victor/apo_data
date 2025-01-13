// /components/SalesByPharmacyChart.tsx

import React, { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  ArcElement,
  ChartOptions,
} from 'chart.js';
import { FaChartPie, FaExclamationTriangle } from 'react-icons/fa'; // Import d'icônes pertinentes
import { useSalesByPharmacyContext } from '@/contexts/salesByPharmacyContext';
import { truncate } from '@/libs/utils/truncate'; // Import de la fonction de troncature

ChartJS.register(ArcElement, Title, Tooltip);

type ViewMode = 'qty' | 'ca' | 'margin';

const SalesByPharmacyChart: React.FC = () => {
  const { groupedSales, loading, error } = useSalesByPharmacyContext();
  const [viewMode, setViewMode] = useState<ViewMode>('qty');

  // Calculer la répartition des ventes par pharmacie
  const salesDistribution = useMemo(() => {
    const map: Record<string, { totalCA: number; totalQty: number; totalMargin: number }> = {};

    groupedSales.forEach((sale) => {
      const pharmacyId = sale.pharmacy_id;
      const pharmacyName = sale.pharmacy_name || `Pharmacy ${sale.pharmacy_id}`;
      const qty = sale.total_quantity || 0;
      const priceWithTax = sale.avg_price_with_tax || 0;
      const avgWeightedPrice = sale.avg_weighted_average_price || 0;
      const tva = sale.tva || 0;

      // Calcul du CA pour la pharmacie
      const totalCA = priceWithTax * qty;

      // Calcul de la marge totale : (prix HT - coût HT) * quantité
      const priceHT = priceWithTax / (1 + tva); // Prix HT = Prix TTC / (1 + TVA)
      const marginPerUnit = priceHT - avgWeightedPrice;
      const totalMargin = marginPerUnit * qty;

      if (!map[pharmacyId]) {
        map[pharmacyId] = { totalCA: 0, totalQty: 0, totalMargin: 0 };
      }

      map[pharmacyId].totalCA += totalCA;
      map[pharmacyId].totalQty += qty;
      map[pharmacyId].totalMargin += totalMargin;
    });

    console.log('Sales Distribution by Pharmacy:', map); // Pour le débogage

    return map;
  }, [groupedSales]);

  // Préparer les données pour le graphique avec Top 10 + Autres
  const chartData = useMemo(() => {
    const entries = Object.entries(salesDistribution).map(([pharmacyId, data]) => ({
      pharmacyId,
      pharmacyName: groupedSales.find(sale => sale.pharmacy_id === pharmacyId)?.pharmacy_name || `Pharmacy ${pharmacyId}`,
      value:
        viewMode === 'ca'
          ? data.totalCA
          : viewMode === 'qty'
          ? data.totalQty
          : data.totalMargin,
    }));

    // Trier les pharmacies selon la valeur sélectionnée
    entries.sort((a, b) => b.value - a.value);

    // Séparer le Top 10 et les Autres
    const topEntries = entries.slice(0, 10);
    const otherEntries = entries.slice(10);

    // Calculer le total des Autres
    const otherTotal = otherEntries.reduce((sum, entry) => sum + entry.value, 0);

    // Préparer les labels et les données
    const labels = topEntries.map(entry => entry.pharmacyName);
    const data = topEntries.map(entry => entry.value);

    if (otherEntries.length > 0) {
      labels.push('Autres');
      data.push(otherTotal);
    }

    // Générer des couleurs dynamiques
    const backgroundColors = labels.map((_, index) => {
      const hue = (index * 137.508) % 360; // Distribution uniforme des couleurs
      return `hsla(${hue}, 70%, 50%, 0.6)`; // Utilisation de HSLA pour la transparence
    });

    const borderColors = backgroundColors.map(color => color.replace(/,\s*0\.6\)/, ', 1)'));

    return {
      labels,
      datasets: [
        {
          label:
            viewMode === 'ca'
              ? 'CA Total par Pharmacie'
              : viewMode === 'qty'
              ? 'Quantités par Pharmacie'
              : 'Marge Totale par Pharmacie',
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [salesDistribution, viewMode, groupedSales]);

  // Calculer les trois pharmacies les moins performantes
  const worstPharmacies = useMemo(() => {
    const pharmacyArray = Object.entries(salesDistribution).map(([pharmacyId, values]) => ({
      pharmacyId,
      pharmacyName: groupedSales.find(sale => sale.pharmacy_id === pharmacyId)?.pharmacy_name || `Pharmacy ${pharmacyId}`,
      val: viewMode === 'ca' ? values.totalCA : viewMode === 'qty' ? values.totalQty : values.totalMargin,
    }));
    pharmacyArray.sort((a, b) => a.val - b.val); // Trier par ordre croissant
    return pharmacyArray.slice(0, 3); // Trois pharmacies les moins performantes
  }, [salesDistribution, viewMode, groupedSales]);

  // Configuration du graphique
  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false, // Permet de contrôler la taille du graphique
    plugins: {
      title: {
        display: true,
        text: `Répartition du ${viewMode === 'ca' ? 'CA TTC' : viewMode === 'qty' ? 'Quantité' : 'Marge Totale'} par Pharmacie`,
        font: {
          size: 18,
        },
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
        display: false, // Suppression de la légende
      },
    },
  };

  if (loading) return <p className="text-center text-gray-500">Chargement des données...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Carte principale */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* En-tête avec titre et icône */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaChartPie className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-primary">Répartition des Ventes par Pharmacie</h2>
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

        {/* Cartes des Trois Pharmacies les Moins Performantes */}
        {worstPharmacies.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {worstPharmacies.map((pharmacy, index) => (
              <div key={index} className="flex-1 bg-red-100 shadow rounded-lg p-6 flex items-center">
                <FaExclamationTriangle className="h-8 w-8 text-red-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-red-500">Pharmacie Peu Performante</p>
                  <p className="mt-1 text-lg font-semibold text-red-700 break-words" title={pharmacy.pharmacyName}>
                    {truncate(pharmacy.pharmacyName, 20)} {/* Nom avec troncature si nécessaire */}
                  </p>
                  <p className="mt-1 text-md text-red-600">
                    {viewMode === 'ca' || viewMode === 'margin'
                      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pharmacy.val)
                      : pharmacy.val.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Graphique Doughnut */}
        <div className="w-full h-96">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default SalesByPharmacyChart;
