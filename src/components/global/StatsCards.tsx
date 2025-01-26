import React from "react";
import {
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
  FaPercentage,
  FaBoxes,
  FaWarehouse,
  FaClipboardList,
  FaChartBar,
  FaInfoCircle,
} from "react-icons/fa";

const formatNumber = (value: number | null | undefined): number =>
  value !== null && value !== undefined ? Number(value.toFixed(2)) : 0;

const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(".", ",")} M€`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2).replace(".", ",")} K€`;
  }
  return `${value.toFixed(2).replace(".", ",")} €`;
};

const StatsCards = ({
  totalCA,
  totalPurchase,
  totalMargin,
  totalQuantity,
  averageSellingPrice,
  averagePurchasePrice,
  marginPercentage,
  stockValue,
  soldReferencesCount,
  loading,
}: {
  totalCA: number | null;
  totalPurchase: number | null;
  totalMargin: number | null;
  totalQuantity: number | null;
  averageSellingPrice: number | null;
  averagePurchasePrice: number | null;
  marginPercentage: number | null;
  stockValue: number | null;
  soldReferencesCount: number | null;
  loading: boolean; // Nouveau prop pour indiquer l'état de chargement
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-lg p-8">
      {/* Conteneur des cartes */}
      <div className="flex flex-col gap-8">
        {/* Première rangée */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* CA Total */}
          <div className="flex-1 bg-indigo-100 hover:bg-indigo-200 shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition-shadow duration-300">
            <FaDollarSign className="h-12 w-12 text-indigo-500 mr-4" />
            <div>
              <p className="text-lg font-medium text-indigo-500">Chiffre d'Affaires Total</p>
              <p className="mt-2 text-3xl font-bold text-indigo-600">
                {loading ? "Chargement..." : totalCA !== null ? formatLargeNumber(totalCA) : "N/A"}
              </p>
            </div>
          </div>

          {/* Montant d'Achat Total */}
          <div className="flex-1 bg-green-100 hover:bg-green-200 shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition-shadow duration-300">
            <FaShoppingCart className="h-12 w-12 text-green-500 mr-4" />
            <div>
              <p className="text-lg font-medium text-green-500">Montant d'Achat Total</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {loading ? "Chargement..." : totalPurchase !== null ? formatLargeNumber(totalPurchase) : "N/A"}
              </p>
            </div>
          </div>

          {/* Marge Totale */}
          <div className="flex-1 bg-amber-100 hover:bg-amber-200 shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition-shadow duration-300">
            <FaChartLine className="h-12 w-12 text-amber-500 mr-4" />
            <div>
              <p className="text-lg font-medium text-amber-500">Marge Totale</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {loading ? "Chargement..." : totalMargin !== null ? formatLargeNumber(totalMargin) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Deuxième rangée */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Prix de Vente Moyen */}
          <div className="flex-1 bg-purple-100 hover:bg-purple-200 shadow-lg rounded-xl p-6 flex items-center transition-all duration-300">
            <FaClipboardList className="h-14 w-14 text-purple-500 mr-4" />
            <div>
              <p className="text-lg font-medium text-purple-500">Prix de Vente Moyen</p>
              <p className="mt-2 text-3xl font-extrabold text-purple-600">
                {loading ? "Chargement..." : averageSellingPrice !== null ? formatLargeNumber(averageSellingPrice) : "N/A"}
              </p>
            </div>
          </div>

          {/* Prix d'Achat Moyen */}
          <div className="flex-1 bg-teal-100 hover:bg-teal-200 shadow-lg rounded-xl p-6 flex items-center transition-all duration-300">
            <FaBoxes className="h-14 w-14 text-teal-500 mr-4" />
            <div>
              <p className="text-lg font-medium text-teal-500">Prix d'Achat Moyen</p>
              <p className="mt-2 text-3xl font-extrabold text-teal-600">
                {loading ? "Chargement..." : averagePurchasePrice !== null ? formatLargeNumber(averagePurchasePrice) : "N/A"}
              </p>
            </div>
          </div>

          {/* Pourcentage de Marge */}
          <div className="flex-1 bg-rose-100 hover:bg-rose-200 shadow-lg rounded-xl p-6 flex items-center transition-all duration-300">
            <FaPercentage className="h-14 w-14 text-rose-500 mr-4" />
            <div>
              <p className="text-lg font-medium text-rose-500">Pourcentage de Marge</p>
              <p className="mt-2 text-3xl font-extrabold text-rose-600">
                {loading ? "Chargement..." : marginPercentage !== null ? `${marginPercentage.toFixed(2)}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Troisième rangée */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Quantité Totale */}
          <div className="flex-1 bg-orange-100 hover:bg-orange-200 shadow-lg rounded-xl p-6 flex items-center transition-all duration-300">
            <FaWarehouse className="h-14 w-14 text-orange-500 mr-4" />
            <div>
              <p className="text-lg font-medium text-orange-500">Quantité Totale</p>
              <p className="mt-2 text-3xl font-extrabold text-orange-600">
                {loading ? "Chargement..." : totalQuantity !== null ? formatNumber(totalQuantity) : "N/A"}
              </p>
            </div>
          </div>

          {/* Valeur de Stock */}
          <div className="flex-1 bg-sky-100 hover:bg-sky-200 shadow-lg rounded-xl p-6 flex items-center transition-all duration-300">
            <FaChartBar className="h-14 w-14 text-sky-500 mr-4" />
            <div>
              <p className="text-lg font-medium text-sky-500">Valeur de Stock</p>
              <p className="mt-2 text-3xl font-extrabold text-sky-600">
                {loading ? "Chargement..." : stockValue !== null ? formatLargeNumber(stockValue) : "N/A"}
              </p>
            </div>
          </div>

          {/* Références Vendues */}
          <div className="flex-1 bg-red-100 hover:bg-red-200 shadow-lg rounded-xl p-6 flex items-center transition-all duration-300">
            <FaInfoCircle className="h-14 w-14 text-red-500 mr-4" />
            <div>
              <p className="text-lg font-medium text-red-500">Références Vendues</p>
              <p className="mt-2 text-3xl font-extrabold text-red-600">
                {loading ? "Chargement..." : soldReferencesCount !== null ? formatNumber(soldReferencesCount) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
