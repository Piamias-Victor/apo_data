// /components/NegativeMarginChart.tsx

import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { FaExclamationTriangle, FaBalanceScale, FaChartLine, FaListUl, FaTag } from 'react-icons/fa';
import { useSalesContext } from '@/contexts/salesContext';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const NegativeMarginChart: React.FC = () => {
  const { groupedSales, loading, error } = useSalesContext();

  if (loading) return <p className="text-center text-gray-500">Chargement des données...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (groupedSales.length === 0) return <p className="text-center text-gray-500">Aucune donnée disponible</p>;

  // Filtrer les produits avec une marge négative
  const negativeMargins = useMemo(() => {
    return groupedSales
      .map(sale => {
        const price = sale.avg_price_with_tax || 0;
        const weightedAveragePrice = sale.avg_weighted_average_price || 0;
        const tva = sale.tva || 0;
        const priceHT = price / (1 + tva); // Convertir en HT
        const marginPerUnit = priceHT - weightedAveragePrice;
        const totalMargin = marginPerUnit * sale.total_quantity;

        return {
          name: sale.name || 'Produit inconnu',
          totalMargin,
          marginPerUnit,
          totalQuantity: sale.total_quantity,
          priceWithTax: price,
          weightedAveragePrice,
        };
      })
      .filter(sale => sale.totalMargin < 0) // Ne garder que les pertes
      .sort((a, b) => a.totalMargin - b.totalMargin); // Trier par pertes les plus élevées
  }, [groupedSales]);

  // Trouver la somme des pertes et le nombre de produits concernés
  const totalLoss = negativeMargins.reduce((sum, sale) => sum + sale.totalMargin, 0);
  const totalProducts = negativeMargins.length;
  const worstLoss = negativeMargins.length > 0 ? negativeMargins[0] : null;

  // Préparer les données pour le graphique
  const dataChart = {
    labels: negativeMargins.slice(0, 10).map(sale => sale.name), // Afficher les 10 pires produits
    datasets: [
      {
        label: 'Perte Totale (€)',
        data: negativeMargins.slice(0, 10).map(sale => sale.totalMargin),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Carte principale */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* En-tête avec icône et titre */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-8 w-8 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-red-500">Produits à Perte</h2>
          </div>
        </div>

        {/* Cartes d'Informations */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Somme totale des pertes */}
          <div className="flex-1 bg-red-100 shadow rounded-lg p-4 flex items-center">
            <FaBalanceScale className="h-10 w-10 text-red-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-red-500">Somme des Marges Négatives</p>
              <p className="mt-1 text-lg font-semibold text-red-700">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalLoss)}
              </p>
            </div>
          </div>

          {/* Nombre de produits concernés */}
          <div className="flex-1 bg-orange-100 shadow rounded-lg p-4 flex items-center">
            <FaListUl className="h-10 w-10 text-orange-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-orange-500">Nombre de Produits à Perte</p>
              <p className="mt-1 text-lg font-semibold text-orange-700">{totalProducts}</p>
            </div>
          </div>

          {/* Produit avec la plus grande perte */}
          {worstLoss && (
            <div className="flex-1 bg-yellow-100 shadow rounded-lg p-4 flex items-center">
              <FaChartLine className="h-10 w-10 text-yellow-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-yellow-500">Produit avec la Plus Grande Perte</p>
                <p className="mt-1 text-lg font-semibold text-yellow-700">{worstLoss.name}</p>
                <p className="mt-1 text-md text-yellow-600">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(worstLoss.totalMargin)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Graphique Bar - Pleine largeur */}
        <div className="w-full h-[450px] mb-6">
          <Bar data={dataChart} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        {/* Liste détaillée des produits à perte */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Liste des Produits à Perte</h3>
          
          {/* Conteneur scrollable avec hauteur fixe */}
          <div className="overflow-y-auto max-h-[400px] border border-gray-300 rounded-lg">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Produit</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Perte Totale (€)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Marge Unitaire (€)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Quantité Vendue</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Prix de Vente (€)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Prix Moyen Pondéré (€)</th>
                </tr>
              </thead>
              <tbody>
                {negativeMargins.map((sale, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="border border-gray-300 px-4 py-2">{sale.name}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(sale.totalMargin)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {sale.marginPerUnit.toFixed(2)} €
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{sale.totalQuantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{sale.priceWithTax.toFixed(2)} €</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{sale.weightedAveragePrice.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NegativeMarginChart;
