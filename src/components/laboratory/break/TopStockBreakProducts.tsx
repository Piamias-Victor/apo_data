import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface ProductStockBreakData {
  code_13_ref: string;
  product_name: string;
  stock_break_products: number; // ❌ Quantité en Rupture
  stock_break_amount: number;   // 💰 Montant des Ruptures (€)
  previous?: {
    stock_break_products: number; // ❌ Quantité en Rupture
    stock_break_amount: number;
  };
}

const normalizeNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === "") return 0;
  return Number(value);
};

const TopStockBreakProducts: React.FC<{ products: ProductStockBreakData[] }> = ({ products }) => {

  const normalizedProducts = products.map((product) => {
    const stockBreakQty = normalizeNumber(product.stock_break_products);
    const stockBreakAmount = normalizeNumber(product.stock_break_amount);
    
    return {
      ...product,
      stock_break_products: stockBreakQty,
      stock_break_amount: stockBreakAmount,
      previous: product.previous
        ? {
            ...product.previous,
            stock_break_products: normalizeNumber(product.previous.stock_break_products),
            stock_break_amount: normalizeNumber(product.previous.stock_break_amount),
          }
        : undefined,
    };
  });
    // 📌 Trier les produits par quantité de rupture
  const topBreakQuantity = [...normalizedProducts]
    .sort((a, b) => b.stock_break_products - a.stock_break_products)
    .slice(0, 3);

  // 📌 Trier les produits par montant de rupture
  const topBreakAmount = [...normalizedProducts]
    .sort((a, b) => b.stock_break_amount - a.stock_break_amount)
    .slice(0, 3);

  // 📌 Trier les produits par évolution de la quantité de rupture
  const topBreakEvolution = normalizedProducts
    .filter((product) => product.previous?.stock_break_products !== undefined && product.previous?.stock_break_products !== 0)
    .map((product) => ({
      ...product,
      evolution: calculateEvolution(product.previous!.stock_break_products, product.stock_break_products),
    }))
    .filter((product) => Number.isFinite(product.evolution))
    .sort((a, b) => b.evolution - a.evolution)
    .slice(0, 3);

  return (
    <div className="p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-red-400 relative">
      {/* 🔴 Titre */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-red-400 pb-4 mb-5">
        <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" /> Produits les plus en Rupture
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        {/* 📦 TOP 3 Quantité en Rupture */}
        <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md border border-red-300">
          <h3 className="text-md font-semibold mb-3 border-b border-gray-300 pb-2 text-red-700">📦 Top 3 Quantité en Rupture</h3>
          {topBreakQuantity.map((product) => (
            <DataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.stock_break_products} 
              isCurrency={false} 
              previousValue={product.previous?.stock_break_products} 
            />
          ))}
        </div>

        {/* 💰 TOP 3 Montant Rupture */}
        <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md border border-red-300">
          <h3 className="text-md font-semibold mb-3 border-b border-gray-300 pb-2 text-red-700">💰 Top 3 Montant Rupture (€)</h3>
          {topBreakAmount.map((product) => (
            <DataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.stock_break_amount} 
              isCurrency 
              previousValue={product.previous?.stock_break_amount} 
            />
          ))}
        </div>

        {/* 🔥 TOP 3 Évolution de Rupture */}
        <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md border border-red-300">
          <h3 className="text-md font-semibold mb-3 border-b border-gray-300 pb-2 text-red-700">📊 Top 3 Évolution Rupture</h3>
          {topBreakEvolution.map((product) => (
            <DataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.evolution} 
              isPercentage 
              extraValue={product.stock_break_products} // 📦 Quantité actuelle
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

export default TopStockBreakProducts;

// 📌 **Bloc de données pour afficher chaque produit en rupture**
interface DataBlockProps {
  title: string;
  code: string;
  value: number;
  previousValue?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  extraValue?: number; // ✅ Ajout du montant des ruptures (€)
}

const DataBlock: React.FC<DataBlockProps> = ({ title, code, value, previousValue, isCurrency = false, isPercentage = false, extraValue }) => {
  let percentageChange: number | string = "N/A";

  // 📌 Fonction de calcul de l'évolution
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
      {/* ❌ Valeur actuelle */}
      <p className="text-xl font-bold text-red-700">
        {formatLargeNumber(value, isCurrency)} {isPercentage ? "%" : ""}
      </p>
      {/* 🏷️ Code 13 Ref */}
      <p className="text-xs font-medium text-gray-600">{code}</p>
      {/* 📌 Nom du produit tronqué avec tooltip */}
      <p className="text-sm opacity-80 truncate w-full mx-auto" title={title}>
        {truncateText(title, 25)}
      </p>
      {/* 💰 Montant des ruptures affiché en-dessous */}
      {extraValue !== undefined && (
        <p className="text-sm font-medium text-gray-700">{formatLargeNumber(extraValue, true)}</p>
      )}
      {/* 🔺 Evolution en pourcentage */}
      {previousValue !== undefined && previousValue !== null && (
        <div className="flex items-center justify-center mt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
            percentageChange.includes("-") ? "bg-green-400 text-white" : "bg-red-400 text-white"
          }`}>
            {percentageChange}
          </span>
        </div>
      )}
    </div>
  );
};

// 📌 Fonction utilitaire pour tronquer les textes trop longs
const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};