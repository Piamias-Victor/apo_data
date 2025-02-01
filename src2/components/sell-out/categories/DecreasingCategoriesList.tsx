// src/components/sell-out/categories/DecreasingCategoriesList.tsx
import React from "react";
import { FaArrowDown } from "react-icons/fa";

interface DecreasingCategory {
  category: string;
  regressionRate: number; // Taux potentiellement négatif
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number; // optionnel
}

interface DecreasingCategoriesListProps {
  categories: DecreasingCategory[];
  loading: boolean;
}

// Tronquer le nom si trop long
const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

const DecreasingCategoriesList: React.FC<DecreasingCategoriesListProps> = ({ categories, loading }) => {
  const MAX_NAME_LENGTH = 20;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-4 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaArrowDown className="h-8 w-8 text-red-500" />
        <h2 className="text-lg font-bold text-gray-800">Catégories en Régression</h2>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-sm">Chargement...</p>
      ) : (
        <div className="overflow-y-auto h-[85%]">
          <ul className="space-y-2">
            {categories.map((catItem, index) => (
              <li
                key={catItem.category}
                className="flex items-center justify-between p-2 bg-white shadow-md rounded-lg hover:shadow-lg transition"
              >
                {/* Classement */}
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

                {/* Nom de la catégorie */}
                <div className="flex flex-col flex-grow ml-2">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {truncateName(catItem.category, MAX_NAME_LENGTH)}
                  </span>
                </div>

                {/* Stats de régression */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-semibold text-gray-800">
                    Avant: {catItem.previousQuantity.toLocaleString()} unités
                  </span>
                  <span className="font-semibold text-gray-800">
                    Maintenant: {catItem.currentQuantity.toLocaleString()} unités
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      catItem.regressionRate < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    Régression: {catItem.regressionRate > 0 ? "+" : ""}
                    {catItem.regressionRate.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-600">
                    CA : {catItem.totalRevenue.toLocaleString()} €
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

export default DecreasingCategoriesList;