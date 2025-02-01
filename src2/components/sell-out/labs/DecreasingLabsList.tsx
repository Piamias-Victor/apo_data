// src/components/sell-out/labs/DecreasingLabsList.tsx
import React from "react";
import { FaArrowDown } from "react-icons/fa";

interface DecreasingLab {
  lab: string;
  regressionRate: number; // Taux négatif (ou tri asc)
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number; // optionnel
}

interface DecreasingLabsListProps {
  labs: DecreasingLab[];
  loading: boolean;
}

// Pour tronquer si le nom du labo est trop long
const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

const DecreasingLabsList: React.FC<DecreasingLabsListProps> = ({ labs, loading }) => {
  const MAX_NAME_LENGTH = 20;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-4 h-full">
      {/* Titre */}
      <div className="flex items-center gap-4 mb-4">
        <FaArrowDown className="h-8 w-8 text-red-500" />
        <h2 className="text-lg font-bold text-gray-800">Laboratoires en Régression</h2>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-sm">Chargement...</p>
      ) : (
        <div className="overflow-y-auto h-[85%]">
          <ul className="space-y-2">
            {labs.map((labItem, index) => (
              <li
                key={labItem.lab}
                className="flex items-center justify-between p-2 bg-white shadow-md rounded-lg hover:shadow-lg transition"
              >
                {/* Classement (#1, #2, etc.) */}
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

                {/* Nom du labo */}
                <div className="flex flex-col flex-grow ml-2">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {truncateName(labItem.lab, MAX_NAME_LENGTH)}
                  </span>
                </div>

                {/* Infos */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-semibold text-gray-800">
                    Avant: {labItem.previousQuantity.toLocaleString()} unités
                  </span>
                  <span className="font-semibold text-gray-800">
                    Maintenant: {labItem.currentQuantity.toLocaleString()} unités
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      labItem.regressionRate < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {/* On affiche + si c'est positif */}
                    Régression: {labItem.regressionRate > 0 ? "+" : ""}
                    {labItem.regressionRate.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    CA: {labItem.totalRevenue.toLocaleString()} €
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

export default DecreasingLabsList;