import React from "react";
import { FaDollarSign, FaShoppingCart, FaChartLine } from "react-icons/fa";

const StatsCards = ({ totalCA, totalPurchase, totalMargin }: { totalCA: number; totalPurchase: number; totalMargin: number }) => {
  // Fonction pour formater les montants en devise
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8">
      {/* CA Total */}
      <div className="flex-1 bg-blue-100 shadow rounded-lg p-6 flex items-center">
        <FaDollarSign className="h-12 w-12 text-blue-500 mr-4" />
        <div>
          <p className="text-sm font-medium text-blue-500">Chiffre d Affaires Total</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{formatCurrency(totalCA)}</p>
        </div>
      </div>

      {/* Montant d'Achat Total */}
      <div className="flex-1 bg-green-100 shadow rounded-lg p-6 flex items-center">
        <FaShoppingCart className="h-12 w-12 text-green-500 mr-4" />
        <div>
          <p className="text-sm font-medium text-green-500">Montant d Achat Total</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(totalPurchase)}</p>
        </div>
      </div>

      {/* Marge Totale */}
      <div className="flex-1 bg-yellow-100 shadow rounded-lg p-6 flex items-center">
        <FaChartLine className="h-12 w-12 text-yellow-500 mr-4" />
        <div>
          <p className="text-sm font-medium text-yellow-500">Marge Totale</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{formatCurrency(totalMargin)}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
