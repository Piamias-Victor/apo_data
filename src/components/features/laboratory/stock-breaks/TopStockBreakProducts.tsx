import React from "react";
import { motion } from "framer-motion";
import { HiExclamationTriangle, HiSparkles, HiShoppingCart, HiCurrencyDollar } from "react-icons/hi2";
import ProductDataBlock from "@/components/common/cards/ProductDataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import PeriodSelector from "@/components/common/sections/PeriodSelector";
import { useFilterContext } from "@/contexts/FilterContext";

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
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // Normalisation des données de produits
  const normalizedProducts = React.useMemo(() => {
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
  const topBreakQuantity = React.useMemo(() => {
    return [...normalizedProducts]
      .sort((a, b) => b.stock_break_products - a.stock_break_products)
      .slice(0, 3);
  }, [normalizedProducts]);

  // Top produits par montant de rupture
  const topBreakAmount = React.useMemo(() => {
    return [...normalizedProducts]
      .sort((a, b) => b.stock_break_amount - a.stock_break_amount)
      .slice(0, 3);
  }, [normalizedProducts]);

  // Top produits par évolution de la quantité de rupture
  const topBreakEvolution = React.useMemo(() => {
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

  // Variantes d'animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        delay: 0.2, 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const headerIconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: 0.1,
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
    >
      {/* En-tête avec titre et sélecteur de période */}
      <div className="p-6 md:p-8 relative bg-gradient-to-br from-red-50 to-orange-50 border-b border-red-100/50">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-500 shadow-sm"></div>
        
        {/* Éléments de design de fond */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <div className="relative mr-4">
              <motion.div 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100/80 text-red-600 shadow-sm border border-red-200/50"
                variants={headerIconVariants}
              >
                <HiExclamationTriangle className="w-6 h-6" />
              </motion.div>
              <motion.div 
                variants={fadeInVariants}
                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center"
              >
                <HiSparkles className="text-yellow-400" />
              </motion.div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Produits en Rupture
              </h2>
              <motion.p variants={fadeInVariants} className="text-gray-500 text-sm mt-1">
                Analyse des produits les plus impactés par les ruptures de stock
              </motion.p>
            </div>
          </div>

          {/* Sélecteur de période */}
          <PeriodSelector 
            currentDateRange={dateRange} 
            comparisonDateRange={comparisonDateRange} 
            bgColor="bg-gradient-to-r from-red-500 to-orange-500"
            hoverColor="hover:shadow-lg"
          />
        </div>
      </div>

      {/* Contenu des cartes de produits */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* TOP 3 Quantité en Rupture */}
          <SummaryCard 
            title="Top 3 Quantité en Rupture" 
            icon={<HiShoppingCart className="w-5 h-5" />}
            iconColor="text-red-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.1}
            accentColor="orange"
          >
            <div className="space-y-4">
              {topBreakQuantity.map((product, index) => (
                <ProductDataBlock 
                  key={product.code_13_ref}
                  title={product.product_name}
                  code={product.code_13_ref}
                  value={product.stock_break_products}
                  previousValue={product.previous?.stock_break_products}
                  accentColor="orange"
                  animationDelay={0.2 + (index * 0.1)}
                  variant="minimal"
                />
              ))}
            </div>
          </SummaryCard>

          {/* TOP 3 Montant Rupture */}
          <SummaryCard 
            title="Top 3 Montant Rupture (€)" 
            icon={<HiCurrencyDollar className="w-5 h-5" />}
            iconColor="text-orange-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.2}
            accentColor="orange"
          >
            <div className="space-y-4">
              {topBreakAmount.map((product, index) => (
                <ProductDataBlock 
                  key={product.code_13_ref}
                  title={product.product_name}
                  code={product.code_13_ref}
                  value={product.stock_break_amount}
                  previousValue={product.previous?.stock_break_amount}
                  isCurrency
                  accentColor="orange"
                  animationDelay={0.3 + (index * 0.1)}
                  variant="minimal"
                />
              ))}
            </div>
          </SummaryCard>

          {/* TOP 3 Évolution de Rupture */}
          <SummaryCard 
            title="Top 3 Évolution Rupture" 
            icon={<HiExclamationTriangle className="w-5 h-5" />}
            iconColor="text-amber-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.3}
            accentColor="amber"
          >
            <div className="space-y-4">
              {topBreakEvolution.map((product, index) => (
                <ProductDataBlock 
                  key={product.code_13_ref}
                  title={product.product_name}
                  code={product.code_13_ref}
                  value={product.evolution}
                  isPercentage
                  extraValue={product.stock_break_products}
                  accentColor="amber"
                  animationDelay={0.4 + (index * 0.1)}
                  variant="minimal"
                />
              ))}
            </div>
          </SummaryCard>
        </div>
      </div>
    </motion.div>
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