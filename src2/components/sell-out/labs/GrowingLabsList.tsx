import React from "react";
import { FaChartLine } from "react-icons/fa";

interface GrowingLab {
  lab: string;
  growthRate: number;
  currentQuantity: number;
  previousQuantity: number;
  totalRevenue: number; // si besoin d'afficher
}

interface GrowingLabsListProps {
  labs: GrowingLab[];
  loading: boolean;
}

// Fonction utilitaire pour tronquer un nom trop long
const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

const GrowingLabsList: React.FC<GrowingLabsListProps> = ({ labs, loading }) => {
  const MAX_NAME_LENGTH = 20; // Limite pour tronquer les noms

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-4 h-full">
      {/* En-tête avec icône + titre */}
      <div className="flex items-center gap-4 mb-4">
        <FaChartLine className="h-8 w-8 text-green-500" />
        <h2 className="text-lg font-bold text-gray-800">Laboratoires en Croissance</h2>
      </div>

      {/* Loader ou liste */}
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
                {/* Index avec couleur dépendant du rang (1er, 2e, 3e, etc.) */}
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

                {/* Détails du laboratoire (nom) */}
                <div className="flex flex-col flex-grow ml-2">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {truncateName(labItem.lab, MAX_NAME_LENGTH)}
                  </span>
                  {/* Si vous avez un code spécifique au labo, vous pouvez l'afficher ici */}
                  {/* <span className="text-xs text-gray-500">Code: {labItem.someCode}</span> */}
                </div>

                {/* Statistiques de croissance */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-semibold text-gray-800">
                    Avant: {labItem.previousQuantity.toLocaleString()} unités
                  </span>
                  <span className="font-semibold text-gray-800">
                    Maintenant: {labItem.currentQuantity.toLocaleString()} unités
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      labItem.growthRate > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {/* Si le growthRate est positif, on affiche un + */}
                    Croissance: {labItem.growthRate > 0 ? "+" : ""}
                    {labItem.growthRate.toFixed(2)}%
                  </span>
                  <span className="text-gray-600">
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

export default GrowingLabsList;