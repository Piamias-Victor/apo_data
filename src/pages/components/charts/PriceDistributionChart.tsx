// /components/PriceDistributionChart.tsx

import React, { useState, useMemo } from 'react';
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
import { FaDollarSign, FaBalanceScale, FaChartLine, FaChartBar } from 'react-icons/fa';
import { useSalesContext } from '@/contexts/salesContext';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

type ViewMode = 'ca' | 'qty' | 'margin';

const PriceDistributionChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('ca');
  const [binSize, setBinSize] = useState<number>(5); // Taille des tranches ajustable

  const { groupedSales, loading, error } = useSalesContext();

  if (loading) return <p className="text-center text-gray-500">Chargement des données...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (groupedSales.length === 0) return <p className="text-center text-gray-500">Aucune donnée disponible</p>;

  // Calcul des prix par produit
  const productSalesMap: Record<string, { price_with_tax: number; total_qty: number; total_ca: number; total_margin: number }> = {};

  for (const sale of groupedSales) {
    const price = sale.avg_price_with_tax || 0;
    const qty = sale.total_quantity || 0;
    const weightedAveragePrice = sale.avg_weighted_average_price || 0;
    const tva = sale.tva / 100;
    const prixVenteHT = tva > 0 ? price / (1 + tva) : price;
    const marginUnit = prixVenteHT - weightedAveragePrice;
    const marginTotal = marginUnit * qty;

    if (!productSalesMap[sale.code_13_ref]) {
      productSalesMap[sale.code_13_ref] = { 
        price_with_tax: price, 
        total_qty: qty,
        total_ca: price * qty,
        total_margin: marginTotal
      };
    } else {
      productSalesMap[sale.code_13_ref].total_qty += qty;
      productSalesMap[sale.code_13_ref].total_ca += price * qty;
      productSalesMap[sale.code_13_ref].total_margin += marginTotal;
    }
  }

  // Calcul des statistiques
  const prices = Object.values(productSalesMap).map(p => p.price_with_tax);
  const avgPrice = prices.length > 0 ? prices.reduce((sum, val) => sum + val, 0) / prices.length : 0;

  const margins = Object.values(productSalesMap)
    .filter(p => p.total_qty > 0)
    .map(p => p.total_margin / p.total_qty);

  const avgMargin = margins.length > 0 ? margins.reduce((sum, val) => sum + val, 0) / margins.length : 0;

  // Définir les tranches de prix
  const bins: number[] = [];
  const binLimit = 100;
  let current = Math.floor(Math.min(...prices) / binSize) * binSize;
  while (current <= binLimit) {
    bins.push(current);
    current += binSize;
  }
  bins.push(binLimit + 1);

  // Calcul de la répartition des ventes
  const binValues: number[] = new Array(bins.length).fill(0);
  for (const p of Object.values(productSalesMap)) {
    const price = p.price_with_tax;
    let val: number = viewMode === 'ca' ? p.total_ca : viewMode === 'qty' ? p.total_qty : p.total_margin;

    let binFound = false;
    for (let i = 0; i < bins.length - 1; i++) {
      if (price >= bins[i] && price < bins[i + 1]) {
        binValues[i] += val;
        binFound = true;
        break;
      }
    }
    if (!binFound && price >= binLimit) {
      binValues[bins.length - 1] += val;
    }
  }

  // Déterminer la tranche la plus rentable
  const maxMarginIndex = binValues.indexOf(Math.max(...binValues));
  const mostProfitableRange = maxMarginIndex >= 0 ? `${bins[maxMarginIndex]}€ - ${bins[maxMarginIndex + 1] - 1}€` : "N/A";

  const labels = binValues.map((_, i) => {
    return i < bins.length - 1 ? `${bins[i]}€ - ${bins[i + 1] - 1}€` : `> ${binLimit}€`;
  });

  const dataChart = {
    labels,
    datasets: [
      {
        label: viewMode === 'ca' ? 'CA TTC par tranche de prix' : viewMode === 'qty' ? 'Quantité par tranche de prix' : 'Marge Totale par tranche de prix',
        data: binValues,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
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
            <FaChartBar className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-primary">Répartition des Prix de Vente</h2>
          </div>
        </div>

        {/* Cartes d'Informations */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 bg-blue-100 shadow rounded-lg p-4 flex items-center">
            <FaDollarSign className="h-10 w-10 text-blue-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-blue-500">Prix de Vente Moyen</p>
              <p className="mt-1 text-lg font-semibold text-blue-700">{avgPrice.toFixed(2)} €</p>
            </div>
          </div>

          <div className="flex-1 bg-green-100 shadow rounded-lg p-4 flex items-center">
            <FaBalanceScale className="h-10 w-10 text-green-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-green-500">Marge Moyenne</p>
              <p className="mt-1 text-lg font-semibold text-green-700">{avgMargin.toFixed(2)} €</p>
            </div>
          </div>

          <div className="flex-1 bg-yellow-100 shadow rounded-lg p-4 flex items-center">
            <FaChartLine className="h-10 w-10 text-yellow-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-yellow-500">Tranche la Plus Rentable</p>
              <p className="mt-1 text-lg font-semibold text-yellow-700">{mostProfitableRange}</p>
            </div>
          </div>
        </div>

        {/* Slider pour ajuster la taille des tranches */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-gray-700 font-medium">Taille des tranches (€) :</label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            step="1" 
            value={binSize} 
            onChange={(e) => setBinSize(Number(e.target.value))} 
            className="w-48"
          />
          <span className="text-gray-700 font-semibold">{binSize}€</span>
        </div>

        {/* Graphique Bar - Pleine largeur */}
        <div className="w-full h-[450px]">
          <Bar data={dataChart} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default PriceDistributionChart;
