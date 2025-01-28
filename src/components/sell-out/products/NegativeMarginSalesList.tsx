// src/components/sell-out/anomalies/NegativeMarginSalesList.tsx

import React from "react";
import { FaExclamationTriangle, FaDollarSign, FaClipboardList } from "react-icons/fa";
import { useNegativeMarginSalesContext } from "@/contexts/sell-out/NegativeMarginSalesContext";

// Fonction pour tronquer le nom si trop long
const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

// Fonction pour formater les nombres en Euro
const formatCurrency = (value: number) =>
  value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

// Composant pour les cartes personnalisées
const AnomalyStatCard: React.FC<{
  icon: React.ReactElement;
  title: string;
  value: string;
  bgGradient: string;
  iconColor: string;
  titleColor: string;
  valueColor: string;
}> = ({ icon, title, value, bgGradient, iconColor, titleColor, valueColor }) => (
  <div
    className={`flex items-center p-6 rounded-2xl shadow-lg ${bgGradient} transition-transform transform hover:scale-105 duration-300`}
  >
    <div className={`text-4xl ${iconColor} mr-6`}>{icon}</div>
    <div>
      <p className={`text-lg font-semibold ${titleColor}`}>{title}</p>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  </div>
);

const NegativeMarginSalesList: React.FC = () => {
  const { products, loading, error } = useNegativeMarginSalesContext();
  const MAX_NAME_LENGTH = 25; // Ajustez selon vos besoins

  // Calcul du total des marges négatives et du nombre de références
  const totalNegativeMargin = products.reduce((acc, product) => acc + product.margin, 0);
  const negativeMarginCount = products.length;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-2xl p-8 flex items-center justify-center h-80">
        <p className="text-gray-500 text-lg">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-2xl p-8 flex items-center justify-center h-96">
        <p className="text-red-500 text-lg">Erreur : {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-2xl p-8 flex items-center justify-center h-96">
        <p className="text-gray-500 text-lg">Aucun produit avec marge négative trouvé.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-2xl p-6 h-[700px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <FaExclamationTriangle className="h-10 w-10 text-red-600" />
        <h2 className="text-3xl font-bold text-gray-800">Produits avec Marges Négatives</h2>
      </div>

      {/* Cartes des Anomalies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Total des Marges Négatives */}
        <AnomalyStatCard
          icon={<FaDollarSign />}
          title="Perte de Marge Totale"
          value={formatCurrency(totalNegativeMargin)}
          bgGradient="bg-gradient-to-r from-red-100 via-red-200 to-red-300"
          iconColor="text-red-600"
          titleColor="text-red-700"
          valueColor="text-red-800"
        />

        {/* Nombre de Références avec Marge Négative */}
        <AnomalyStatCard
          icon={<FaClipboardList />}
          title="Références avec Marge Négative"
          value={negativeMarginCount.toLocaleString("fr-FR")}
          bgGradient="bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300"
          iconColor="text-yellow-600"
          titleColor="text-yellow-700"
          valueColor="text-yellow-800"
        />
      </div>

      {/* Liste des Produits avec Défilement */}
      <div className="overflow-y-auto flex-1">
        <ul className="space-y-4">
          {products.map((product, index) => (
            <li
              key={product.productId}
              className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Index avec couleur */}
              <span
                className={`text-lg font-bold ${
                  index === 0
                    ? "text-red-500"
                    : index === 1
                    ? "text-gray-400"
                    : index === 2
                    ? "text-orange-400"
                    : "text-gray-600"
                }`}
              >
                #{index + 1}
              </span>
              {/* Détails produit */}
              <div className="flex flex-col flex-grow ml-6">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {truncateName(product.productName, MAX_NAME_LENGTH)}
                </span>
                <span className="text-xs text-gray-500">ID: {product.productId}</span>
              </div>
              {/* Metrics */}
              <div className="flex flex-col items-end text-sm">
                <span className="font-semibold text-gray-800">
                  Quantité: {product.quantity.toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm">
                  Revenu: {formatCurrency(product.revenue)}
                </span>
                <span className="text-gray-500 text-sm">
                  Marge: {formatCurrency(product.margin)}
                </span>
                <span className="text-gray-500 text-sm">
                  PV Moyen: {formatCurrency(product.averageSellingPrice)}
                </span>
                <span className="text-gray-500 text-sm">
                  PA Moyen: {formatCurrency(product.averagePurchasePrice)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NegativeMarginSalesList;