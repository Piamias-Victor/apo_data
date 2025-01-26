import React from "react";
import { FaArrowDown } from "react-icons/fa";

interface FlopCategoriesListProps {
  categories: { category: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
}

// Longueur maximale pour les noms des catégories
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

const FlopCategoriesList: React.FC<FlopCategoriesListProps> = ({ categories, loading }) => {
  // Filtrage pour exclure les catégories inconnues ou non pertinentes
  const filteredCategories = categories.filter(
    (category) =>
      category.category.toLowerCase() !== "inconnu" &&
      category.category.toLowerCase() !== "divers catégories"
  );

  // Tri des catégories par CA croissant pour les flops
  const sortedCategories = [...filteredCategories].sort((a, b) => a.revenue - b.revenue);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-4 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaArrowDown className="h-8 w-8 text-red-500" />
        <h2 className="text-lg font-bold text-gray-800">Flop 10 Catégories</h2>
      </div>
      {loading ? (
        <p className="text-center text-gray-500 text-sm">Chargement...</p>
      ) : (
        <div className="overflow-y-auto h-[85%]">
          <ul className="space-y-2">
            {sortedCategories.slice(0, 10).map((category, index) => (
              <li
                key={category.category}
                className="flex items-center justify-between p-2 bg-white shadow-md rounded-lg hover:shadow-lg transition"
              >
                {/* Index avec couleur */}
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
                  <span className="text-sm font-medium text-gray-800">
                    {truncateName(category.category, MAX_NAME_LENGTH)}
                  </span>
                </div>

                {/* Détails de la catégorie */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-semibold text-gray-800">{category.quantity} unités</span>
                  <span className="text-gray-500">
                    CA: {formatLargeNumber(category.revenue)}
                  </span>
                  <span className="text-gray-500">
                    Marge: {formatLargeNumber(category.margin)}
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

export default FlopCategoriesList;