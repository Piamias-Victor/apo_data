import React from "react";
import { FaArrowDown } from "react-icons/fa";

interface DecreasingProduct {
  name: string;
  code: string;
  previousQuantity: number;
  currentQuantity: number;
  growthRate: number; // pourcentage de décroissance (typiquement négatif)
}

interface DecreasingProductsListProps {
  products: DecreasingProduct[];
  loading: boolean;
}

// Fonction pour tronquer un nom de produit s'il est trop long
const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

const DecreasingProductsList: React.FC<DecreasingProductsListProps> = ({
  products,
  loading,
}) => {
  const MAX_NAME_LENGTH = 20; // Limite pour tronquer le nom

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-4 h-full">
      {/* En-tête : Icône + Titre */}
      <div className="flex items-center gap-4 mb-4">
        <FaArrowDown className="h-8 w-8 text-red-500" />
        <h2 className="text-lg font-bold text-gray-800">Produits en Décroissance</h2>
      </div>

      {/* Loader ou liste */}
      {loading ? (
        <p className="text-center text-gray-500 text-sm">Chargement...</p>
      ) : (
        <div className="overflow-y-auto h-[85%]">
          <ul className="space-y-2">
            {products.map((product, index) => (
              <li
                key={product.code}
                className="flex items-center justify-between p-2 bg-white shadow-md rounded-lg hover:shadow-lg transition"
              >
                {/* Index avec couleur (1er en rouge, 2e en gris, etc.) */}
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

                {/* Nom + code du produit */}
                <div className="flex flex-col flex-grow ml-2">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {truncateName(product.name, MAX_NAME_LENGTH)}
                  </span>
                  <span className="text-xs text-gray-500">Code: {product.code}</span>
                </div>

                {/* Détails de décroissance */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-semibold text-gray-800">
                    Avant: {product.previousQuantity.toLocaleString()} unités
                  </span>
                  <span className="font-semibold text-gray-800">
                    Maintenant: {product.currentQuantity.toLocaleString()} unités
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      product.growthRate < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {/* Si le growthRate est négatif, on affiche un signe - */}
                    Évolution: {product.growthRate > 0 ? "+" : ""}
                    {product.growthRate.toFixed(2)}%
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

export default DecreasingProductsList;