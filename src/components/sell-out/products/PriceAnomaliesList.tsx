// src/components/sell-out/PriceAnomaliesList.tsx

import React from "react";
import { FaExclamationTriangle, FaDollarSign, FaClipboardList } from "react-icons/fa";
import { usePriceAnomaliesContext } from "@/contexts/sell-out/PriceAnomaliesContext";

// Fonction pour tronquer le nom si trop long
const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

// Fonction pour formater les nombres en Euro
const formatCurrency = (value: number) =>
  value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

// Composant pour les cartes statistiques
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

const PriceAnomaliesList: React.FC = () => {
  const { anomalies, loading, error } = usePriceAnomaliesContext();
  const MAX_NAME_LENGTH = 25; // Ajustez selon vos besoins

  // Trier les anomalies par la plus grande évolution absolue
  const sortedAnomalies = [...anomalies].sort(
    (a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange)
  );

  // Calcul de statistiques
  const totalAnomalies = anomalies.length;
  const averageChange =
    anomalies.reduce((acc, anomaly) => acc + Math.abs(anomaly.percentageChange), 0) /
    (anomalies.length || 1);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-2xl p-8 flex items-center justify-center h-80">
        <p className="text-gray-500 text-lg">Chargement des anomalies de prix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-2xl p-8 flex flex-col items-center justify-center h-96">
        <FaExclamationTriangle className="h-10 w-10 text-red-600 mb-4" />
        <p className="text-red-500 text-lg">Erreur : {error}</p>
        {/* Vous pouvez ajouter un bouton de réessai ici si nécessaire */}
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-2xl p-8 flex items-center justify-center h-96">
        <p className="text-gray-500 text-lg">Aucune anomalie de prix trouvée.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-100 shadow-2xl rounded-2xl p-6 h-[700px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <FaExclamationTriangle className="h-10 w-10 text-red-600" />
        <h2 className="text-3xl font-bold text-gray-800">Anomalies de Prix</h2>
      </div>

      {/* Cartes des Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Total des Anomalies */}
        <AnomalyStatCard
          icon={<FaExclamationTriangle />}
          title="Total des Anomalies"
          value={totalAnomalies.toLocaleString("fr-FR")}
          bgGradient="bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300"
          iconColor="text-blue-600"
          titleColor="text-blue-700"
          valueColor="text-blue-800"
        />

        {/* Changement Moyen */}
        <AnomalyStatCard
          icon={<FaDollarSign />}
          title="Changement Moyen (%)"
          value={`${averageChange.toFixed(2)}%`}
          bgGradient="bg-gradient-to-r from-green-100 via-green-200 to-green-300"
          iconColor="text-green-600"
          titleColor="text-green-700"
          valueColor="text-green-800"
        />
      </div>

      {/* Liste des Anomalies avec Défilement */}
      <div className="overflow-y-auto flex-1">
        <ul className="space-y-4">
          {sortedAnomalies.map((anomaly, index) => (
            <li
              key={anomaly.code} // Utilisation de `code` comme clé unique
              className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Index avec couleur basée sur l'importance de l'évolution */}
              <span
                className={`text-lg font-bold ${
                  Math.abs(anomaly.percentageChange) >= 20
                    ? "text-red-600"
                    : Math.abs(anomaly.percentageChange) >= 10
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}
              >
                #{index + 1}
              </span>
              {/* Détails produit */}
              <div className="flex flex-col flex-grow ml-6">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {truncateName(anomaly.productName, MAX_NAME_LENGTH)}
                </span>
                <span className="text-xs text-gray-500">Code: {anomaly.code}</span>
              </div>
              {/* Metrics */}
              <div className="flex flex-col items-end text-sm">
                <span className="font-semibold text-gray-800">
                  Prix Précédent: {formatCurrency(anomaly.previousPrice)}
                </span>
                <span className="text-gray-500">Prix Actuel: {formatCurrency(anomaly.currentPrice)}</span>
                <span
                  className={`${
                    anomaly.percentageChange > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Changement: {anomaly.percentageChange.toFixed(2)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PriceAnomaliesList;