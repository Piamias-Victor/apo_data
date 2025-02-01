// src/components/sell-out/anomalies/StatsCards.tsx

import React from "react";
import {
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
  FaPercentage,
  FaBoxes,
  FaWarehouse,
  FaClipboardList,
  FaChartBar,
  FaInfoCircle,
} from "react-icons/fa";

// Fonction pour formater les nombres en Euro
const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(".", ",")} M€`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2).replace(".", ",")} K€`;
  }
  return `${value.toFixed(2).replace(".", ",")} €`;
};

// Fonction pour formater les nombres (sans décimales)
const formatNumber = (value: number | null | undefined): string => {
  return value !== null && value !== undefined
    ? value.toLocaleString("fr-FR")
    : "0";
};

// Composant pour les cartes statistiques
const StatCard: React.FC<{
  icon: React.ReactElement;
  title: string;
  value: string;
  bgGradient: string;
  iconColor: string;
  titleColor: string;
  valueColor: string;
}> = ({ icon, title, value, bgGradient, iconColor, titleColor, valueColor }) => (
  <div
    className={`flex items-center p-6 rounded-2xl shadow-lg ${bgGradient} transition-transform transform hover:scale-105 hover:shadow-xl duration-300`}
  >
    <div className={`text-4xl ${iconColor} mr-6`}>{icon}</div>
    <div>
      <p className={`text-lg font-semibold ${titleColor}`}>{title}</p>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  </div>
);

const StatsCards = ({
  totalCA,
  totalPurchase,
  totalMargin,
  totalQuantity,
  averageSellingPrice,
  averagePurchasePrice,
  marginPercentage,
  stockValue,
  soldReferencesCount,
  financialLoading,
  stockLoading,
}: {
  totalCA: number | null;
  totalPurchase: number | null;
  totalMargin: number | null;
  totalQuantity: number | null;
  averageSellingPrice: number | null;
  averagePurchasePrice: number | null;
  marginPercentage: number | null;
  stockValue: number | null;
  soldReferencesCount: number | null;
  financialLoading: boolean;
  stockLoading: boolean;
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-2xl p-8">
      {/* Conteneur des cartes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Première rangée */}
        <StatCard
          icon={<FaDollarSign />}
          title="Chiffre d'Affaires Total"
          value={
            financialLoading
              ? "Chargement..."
              : totalCA !== null
              ? formatLargeNumber(totalCA)
              : "N/A"
          }
          bgGradient="bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-300"
          iconColor="text-indigo-600"
          titleColor="text-indigo-700"
          valueColor="text-indigo-800"
        />

        <StatCard
          icon={<FaShoppingCart />}
          title="Montant d'Achat Total"
          value={
            financialLoading
              ? "Chargement..."
              : totalPurchase !== null
              ? formatLargeNumber(totalPurchase)
              : "N/A"
          }
          bgGradient="bg-gradient-to-r from-green-100 via-green-200 to-green-300"
          iconColor="text-green-600"
          titleColor="text-green-700"
          valueColor="text-green-800"
        />

        <StatCard
          icon={<FaChartLine />}
          title="Marge Totale"
          value={
            financialLoading
              ? "Chargement..."
              : totalMargin !== null
              ? formatLargeNumber(totalMargin)
              : "N/A"
          }
          bgGradient="bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300"
          iconColor="text-amber-600"
          titleColor="text-amber-700"
          valueColor="text-amber-800"
        />

        {/* Deuxième rangée */}
        <StatCard
          icon={<FaClipboardList />}
          title="Prix de Vente Moyen"
          value={
            financialLoading
              ? "Chargement..."
              : averageSellingPrice !== null
              ? formatLargeNumber(averageSellingPrice)
              : "N/A"
          }
          bgGradient="bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300"
          iconColor="text-purple-600"
          titleColor="text-purple-700"
          valueColor="text-purple-800"
        />

        <StatCard
          icon={<FaBoxes />}
          title="Prix d'Achat Moyen"
          value={
            financialLoading
              ? "Chargement..."
              : averagePurchasePrice !== null
              ? formatLargeNumber(averagePurchasePrice)
              : "N/A"
          }
          bgGradient="bg-gradient-to-r from-teal-100 via-teal-200 to-teal-300"
          iconColor="text-teal-600"
          titleColor="text-teal-700"
          valueColor="text-teal-800"
        />

        <StatCard
          icon={<FaPercentage />}
          title="Pourcentage de Marge"
          value={
            financialLoading
              ? "Chargement..."
              : marginPercentage !== null
              ? `${marginPercentage.toFixed(2)}%`
              : "N/A"
          }
          bgGradient="bg-gradient-to-r from-rose-100 via-rose-200 to-rose-300"
          iconColor="text-rose-600"
          titleColor="text-rose-700"
          valueColor="text-rose-800"
        />

        {/* Troisième rangée */}
        <StatCard
          icon={<FaWarehouse />}
          title="Quantité Totale"
          value={
            financialLoading
              ? "Chargement..."
              : totalQuantity !== null
              ? formatNumber(totalQuantity)
              : "N/A"
          }
          bgGradient="bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300"
          iconColor="text-orange-600"
          titleColor="text-orange-700"
          valueColor="text-orange-800"
        />

        <StatCard
          icon={<FaChartBar />}
          title="Valeur de Stock"
          value={
            stockLoading
              ? "Chargement..."
              : stockValue !== null
              ? formatLargeNumber(stockValue)
              : "N/A"
          }
          bgGradient="bg-gradient-to-r from-sky-100 via-sky-200 to-sky-300"
          iconColor="text-sky-600"
          titleColor="text-sky-700"
          valueColor="text-sky-800"
        />

        <StatCard
          icon={<FaInfoCircle />}
          title="Références Vendues"
          value={
            stockLoading
              ? "Chargement..."
              : soldReferencesCount !== null
              ? formatNumber(soldReferencesCount)
              : "N/A"
          }
          bgGradient="bg-gradient-to-r from-red-100 via-red-200 to-red-300"
          iconColor="text-red-600"
          titleColor="text-red-700"
          valueColor="text-red-800"
        />
      </div>
    </div>
  );
};

export default StatsCards;