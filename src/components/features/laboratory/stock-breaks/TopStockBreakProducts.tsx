// components/laboratory/break/TopStockBreakProducts.tsx

import ProductDataBlock from "@/components/common/cards/ProductDataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import { useMemo } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface ProductStockBreakData {
  code_13_ref: string;
  product_name: string;
  stock_break_products: number; // ❌ Quantité en Rupture
  stock_break_amount: number;   // 💰 Montant des Ruptures (€)
  previous?: {
    stock_break_products: number;
    stock_break_amount: number;
  };
}

interface TopStockBreakProductsProps {
  products: ProductStockBreakData[];
}

/**
 * Composant affichant les produits les plus en rupture
 */
const TopStockBreakProducts: React.FC<TopStockBreakProductsProps> = ({ products }) => {
  // Normalisation des données de produits
  const normalizedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      stock_break_products: Number(product.stock_break_products) || 0,
      stock_break_amount: Number(product.stock_break_amount) || 0,
      previous: product.previous ? {
        stock_break_products: Number(product.previous.stock_break_products) || 0,
        stock_break_amount: Number(product.previous.stock_break_amount) || 0
      } : undefined
    }));
  }, [products]);

  // Top produits par quantité de rupture
  const topBreakQuantity = useMemo(() => {
    return [...normalizedProducts]
      .sort((a, b) => b.stock_break_products - a.stock_break_products)
      .slice(0, 3);
  }, [normalizedProducts]);

  // Top produits par montant de rupture
  const topBreakAmount = useMemo(() => {
    return [...normalizedProducts]
      .sort((a, b) => b.stock_break_amount - a.stock_break_amount)
      .slice(0, 3);
  }, [normalizedProducts]);

  // Top produits par évolution de la quantité de rupture
  const topBreakEvolution = useMemo(() => {
    return normalizedProducts
      .filter(product => 
        product.previous?.stock_break_products !== undefined && 
        product.previous.stock_break_products > 0
      )
      .map(product => {
        const evolution = calculateEvolution(
          product.previous!.stock_break_products, 
          product.stock_break_products
        );
        return { ...product, evolution };
      })
      .filter(product => Number.isFinite(product.evolution))
      .sort((a, b) => b.evolution - a.evolution)
      .slice(0, 3);
  }, [normalizedProducts]);

  return (
    <div className="p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-red-400 relative">
      {/* Titre */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-red-400 pb-4 mb-5">
        <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" /> Produits les plus en Rupture
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        {/* TOP 3 Quantité en Rupture */}
        <SummaryCard 
          title="Top 3 Quantité en Rupture" 
          icon={null} 
          iconColor="text-red-600"
        >
          {topBreakQuantity.map((product) => (
            <ProductDataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.stock_break_products} 
              previousValue={product.previous?.stock_break_products}
              formatAsPrice={false} 
            />
          ))}
        </SummaryCard>

        {/* TOP 3 Montant Rupture */}
        <SummaryCard 
          title="Top 3 Montant Rupture (€)" 
          icon={null} 
          iconColor="text-red-600"
        >
          {topBreakAmount.map((product) => (
            <ProductDataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.stock_break_amount} 
              previousValue={product.previous?.stock_break_amount}
              formatAsPrice={true} 
            />
          ))}
        </SummaryCard>

        {/* TOP 3 Évolution de Rupture */}
        <SummaryCard 
          title="Top 3 Évolution Rupture" 
          icon={null} 
          iconColor="text-red-600"
        >
          {topBreakEvolution.map((product) => (
            <ProductDataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.evolution} 
              isPercentage={true}
              extraValue={product.stock_break_products}
            />
          ))}
        </SummaryCard>
      </div>
    </div>
  );
};

/**
 * Calcule l'évolution en pourcentage entre deux valeurs
 */
const calculateEvolution = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) {
    return newValue > 0 ? 100 : 0;
  }
  
  const change = ((newValue - oldValue) / oldValue) * 100;
  return Number.isFinite(change) ? change : 0;
};

export default TopStockBreakProducts;