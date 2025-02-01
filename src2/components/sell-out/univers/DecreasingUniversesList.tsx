// src/components/sell-out/univers/DecreasingUniversesList.tsx
import React from "react";
import { FaArrowDown } from "react-icons/fa";

interface DecreasingUniverse {
  universe: string;
  regressionRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number;
}

interface DecreasingUniversesListProps {
  universes: DecreasingUniverse[];
  loading: boolean;
}

// Tronquer le nom d'univers si trop long
const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

const DecreasingUniversesList: React.FC<DecreasingUniversesListProps> = ({ universes, loading }) => {
  const MAX_NAME_LENGTH = 20;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-4 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaArrowDown className="h-8 w-8 text-red-500" />
        <h2 className="text-lg font-bold text-gray-800">Univers en Régression</h2>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-sm">Chargement...</p>
      ) : (
        <div className="overflow-y-auto h-[85%]">
          <ul className="space-y-2">
            {universes.map((uni, index) => (
              <li
                key={uni.universe}
                className="flex items-center justify-between p-2 bg-white shadow-md rounded-lg hover:shadow-lg transition"
              >
                {/* Index / Rang */}
                <span
                  className={`text-xl font-bold ${
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

                {/* Nom de l'univers */}
                <div className="flex flex-col flex-grow ml-2">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {truncateName(uni.universe, MAX_NAME_LENGTH)}
                  </span>
                </div>

                {/* Détails de régression */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-semibold text-gray-800">
                    Avant: {uni.previousQuantity.toLocaleString()} unités
                  </span>
                  <span className="font-semibold text-gray-800">
                    Maintenant: {uni.currentQuantity.toLocaleString()} unités
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      uni.regressionRate < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {/* si c’est positif, on affiche + */}
                    Régression: {uni.regressionRate > 0 ? "+" : ""}
                    {uni.regressionRate.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    CA: {uni.totalRevenue.toLocaleString()} €
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

export default DecreasingUniversesList;