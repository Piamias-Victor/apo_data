import React from "react";
import { FaTrophy } from "react-icons/fa";

interface TopLabDistributorsListProps {
  distributors: { labDistributor: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
}

// Longueur maximale pour les noms des laboratoires
const MAX_NAME_LENGTH = 20;

// Fonction pour tronquer les noms trop longs
const truncateName = (name: string, maxLength: number) =>
  name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;

// Fonction pour formater les grandes valeurs en millions
const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(".", ",")} M€`;
  }
  return `${value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`;
};

const TopLabDistributorsList: React.FC<TopLabDistributorsListProps> = ({ distributors, loading }) => {
  // Filtrage pour exclure les laboratoires inconnus et "DIVERS LABOS"
  const filteredDistributors = distributors.filter(
    (distributor) =>
      distributor.labDistributor.toLowerCase() !== "inconnu" &&
      distributor.labDistributor.toLowerCase() !== "divers labos"
  );

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-4 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaTrophy className="h-8 w-8 text-yellow-500" />
        <h2 className="text-lg font-bold text-gray-800">Top 10 Lab Distributors</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-500 text-sm">Chargement...</p>
      ) : (
        <div className="overflow-y-auto h-[85%]">
          <ul className="space-y-2">
            {filteredDistributors.slice(0, 10).map((distributor, index) => (
              <li
                key={distributor.labDistributor}
                className="flex items-center justify-between p-2 bg-white shadow-md rounded-lg hover:shadow-lg transition"
              >
                {/* Index avec couleur */}
                <span
                  className={`text-xl font-bold ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                      ? "text-gray-400"
                      : index === 2
                      ? "text-orange-400"
                      : "text-gray-600"
                  }`}
                >
                  #{index + 1}
                </span>

                {/* Nom du laboratoire */}
                <div className="flex flex-col flex-grow ml-2">
                  <span className="text-sm font-medium text-gray-800">
                    {truncateName(distributor.labDistributor, MAX_NAME_LENGTH)}
                  </span>
                </div>

                {/* Détails du laboratoire */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-semibold text-gray-800">{distributor.quantity} unités</span>
                  <span className="text-gray-500">
                    CA: {formatLargeNumber(distributor.revenue)}
                  </span>
                  <span className="text-gray-500">
                    Marge: {formatLargeNumber(distributor.margin)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TopLabDistributorsList;