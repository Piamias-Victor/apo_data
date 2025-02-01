import React from "react";
import { FaArrowDown } from "react-icons/fa";

interface FlopProductsListProps {
  products: { name: string; code: string; quantity: number; revenue: number; margin: number }[];
  loading: boolean;
}

// Fonction pour tronquer le nom si trop long
const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

const FlopProductsList = ({ products, loading }: FlopProductsListProps) => {
  const MAX_NAME_LENGTH = 20; // Longueur maximale pour le nom du produit

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-4 h-full">
      <div className="flex items-center gap-4 mb-4">
        <FaArrowDown className="h-8 w-8 text-red-500" />
        <h2 className="text-lg font-bold text-gray-800">Flop 10 Produits</h2>
      </div>
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
                {/* Détails produit */}
                <div className="flex flex-col flex-grow ml-2">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {truncateName(product.name, MAX_NAME_LENGTH)}
                  </span>
                  <span className="text-xs text-gray-500">Code: {product.code}</span>
                </div>
                {/* Metrics */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-semibold text-gray-800">
                    {product.quantity.toLocaleString()} unités
                  </span>
                  <span className="text-gray-500">
                    CA: {product.revenue.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                  <span className="text-gray-500">
                    Marge: {product.margin.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
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

export default FlopProductsList;