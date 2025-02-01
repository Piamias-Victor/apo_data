// src/components/sell-out/univers/GrowingUniversesList.tsx
import React from "react";
import { FaChartLine } from "react-icons/fa";

interface GrowingUniverse {
  universe: string;
  growthRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number;
}

interface GrowingUniversesListProps {
  universes: GrowingUniverse[];
  loading: boolean;
}

const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

const GrowingUniversesList: React.FC<GrowingUniversesListProps> = ({ universes, loading }) => {
  const MAX_NAME_LENGTH = 20;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-4 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaChartLine className="h-8 w-8 text-green-500" />
        <h2 className="text-lg font-bold text-gray-800">Univers en Croissance</h2>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-sm">Chargement...</p>
      ) : (
        <div className="overflow-y-auto h-[85%]">
          <ul className="space-y-2">
            {universes.map((uniItem, index) => (
              <li
                key={uniItem.universe}
                className="flex items-center justify-between p-2 bg-white shadow-md rounded-lg hover:shadow-lg transition"
              >
                {/* Classement (#1, #2, #3, etc.) */}
                <span
                  className={`text-xl font-bold ${
                    index === 0
                      ? "text-green-500"
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
                    {truncateName(uniItem.universe, MAX_NAME_LENGTH)}
                  </span>
                </div>

                {/* Stats de croissance */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-semibold text-gray-800">
                    Avant: {uniItem.previousQuantity.toLocaleString()} unités
                  </span>
                  <span className="font-semibold text-gray-800">
                    Maintenant: {uniItem.currentQuantity.toLocaleString()} unités
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      uniItem.growthRate > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    Croissance: {uniItem.growthRate > 0 ? "+" : ""}
                    {uniItem.growthRate.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-600">
                    CA: {uniItem.totalRevenue.toLocaleString()} €
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

export default GrowingUniversesList;