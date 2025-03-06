import React from "react";
import { FaCrown } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface ProductSalesData {
  code_13_ref: string;
  product_name: string;
  revenue: number;
  margin: number;
  previous?: {
    revenue: number;
    margin: number;
  };
}

const TopProductsCard: React.FC<{ products: ProductSalesData[] }> = ({ products }) => {
  // Trier les produits
  const topRevenueProducts = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
  const topMarginProducts = [...products].sort((a, b) => b.margin - a.margin).slice(0, 3);

  const topEvolutionProducts = products
    .filter((product) => product.previous?.revenue !== undefined && product.previous?.revenue !== 0)
    .map((product) => ({
      ...product,
      evolution: calculateEvolution(product.previous!.revenue, product.revenue),
    }))
    .filter((product) => Number.isFinite(product.evolution))
    .sort((a, b) => b.evolution - a.evolution)
    .slice(0, 3);

  return (
    <div className="p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* 📊 Titre */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-4 mb-5">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FaCrown className="text-teal-500" /> Produits Leaders
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        {/* 🏆 TOP 3 CA */}
        <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-3 border-b border-gray-300 pb-2 text-teal-600">🏆 Top 3 CA</h3>
          {topRevenueProducts.map((product) => (
            <DataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.revenue} 
              isCurrency 
              previousValue={product.previous?.revenue} 
            />
          ))}
        </div>

        {/* 💰 TOP 3 Marge */}
        <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-3 border-b border-gray-300 pb-2 text-teal-600">💰 Top 3 Marge</h3>
          {topMarginProducts.map((product) => (
            <DataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.margin} 
              isCurrency 
              previousValue={product.previous?.margin} 
            />
          ))}
        </div>

        {/* 🔥 TOP 3 Progressions en CA */}
        <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md border border-gray-300">
          <h3 className="text-md font-semibold mb-3 border-b border-gray-300 pb-2 text-teal-600">🔥 Top 3 Progressions (CA)</h3>
          {topEvolutionProducts.map((product) => (
            <DataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.evolution} 
              isPercentage 
              extraValue={product.revenue} // ✅ On passe aussi le CA pour affichage sous le nom
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 📌 Fonction de calcul d'évolution en %
const calculateEvolution = (oldValue: number, newValue: number): number => {
  if (oldValue === undefined || oldValue === null) return 0;
  if (oldValue === 0) {
    return newValue > 0 ? 100 : 0;
  }
  const change = ((newValue - oldValue) / oldValue) * 100;
  return Number.isFinite(change) ? change : 0;
};

export default TopProductsCard;

interface DataBlockProps {
  title: string;
  code: string;
  value: number;
  previousValue?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  extraValue?: number; // ✅ Ajout d'une valeur supplémentaire pour afficher le CA dans la section progression
}

const DataBlock: React.FC<DataBlockProps> = ({ title, code, value, previousValue, isCurrency = false, isPercentage = false, extraValue }) => {
  let percentageChange: number | string = "N/A";

  // Fonction pour tronquer les noms trop longs
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (previousValue !== undefined && previousValue !== null) {
    if (previousValue === 0) {
      percentageChange = value > 0 ? "+100%" : "0%";
    } else {
      const change = ((value - previousValue) / previousValue) * 100;
      percentageChange = Number.isFinite(change) ? `${change.toFixed(1)}%` : "N/A";
    }
  }

  return (
    <div className="text-center mt-2">
      {/* ✅ Valeur actuelle */}
      <p className="text-xl font-bold">
        {formatLargeNumber(value, isCurrency)} {isPercentage ? "%" : ""}
      </p>
      {/* ✅ Code 13 Ref */}
      <p className="text-xs font-medium text-gray-600">{code}</p>
      {/* ✅ Nom du produit tronqué avec tooltip */}
      <p className="text-sm opacity-80 truncate w-full mx-auto" title={title}>
        {truncateText(title, 25)}
      </p>
      {/* ✅ Affichage du CA sous le nom pour les produits en progression */}
      {extraValue !== undefined && (
        <p className="text-sm font-medium text-gray-700">{formatLargeNumber(extraValue, true)}</p>
      )}
      {/* ✅ Évolution en % */}
      {previousValue !== undefined && previousValue !== null && (
        <div className="flex items-center justify-center mt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
            percentageChange.includes("-") ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}>
            {percentageChange}
          </span>
        </div>
      )}
    </div>
  );
};