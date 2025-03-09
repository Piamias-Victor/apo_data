import React from "react";
import { motion } from "framer-motion";
import { HiCurrencyDollar, HiSparkles, HiShoppingCart } from "react-icons/hi2";
import { FaCrown } from "react-icons/fa";
import ProductDataBlock from "@/components/common/cards/ProductDataBlock";
import SummaryCard from "@/components/common/cards/SummaryCard";
import PeriodSelector from "@/components/common/sections/PeriodSelector";
import { useFilterContext } from "@/contexts/FilterContext";
import { ProductWithComparison } from "@/hooks/api/useProductsData";

interface TopProductsCardProps {
  topRevenue: ProductWithComparison[];
  topMargin: ProductWithComparison[];
  topGrowth: ProductWithComparison[];
}

/**
 * Composant présentant les produits leaders en termes de CA, marge et progression
 */
const TopProductsCard: React.FC<TopProductsCardProps> = ({
  topRevenue,
  topMargin,
  topGrowth
}) => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

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
      <div className="p-6 md:p-8 relative bg-gradient-to-br from-teal-50 to-emerald-50 border-b border-teal-100/50">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500 shadow-sm"></div>
        
        {/* Éléments de design de fond */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <div className="relative mr-4">
              <motion.div 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-100/80 text-teal-600 shadow-sm border border-teal-200/50"
                variants={headerIconVariants}
              >
                <FaCrown className="w-6 h-6" />
              </motion.div>
              <motion.div 
                variants={fadeInVariants}
                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center"
              >
                <HiSparkles className="text-yellow-400" />
              </motion.div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Produits Leaders
              </h2>
              <motion.p variants={fadeInVariants} className="text-gray-500 text-sm mt-1">
                Analyse des meilleurs produits par CA, marge et progression
              </motion.p>
            </div>
          </div>

          {/* Sélecteur de période */}
          <PeriodSelector 
            currentDateRange={dateRange} 
            comparisonDateRange={comparisonDateRange} 
            bgColor="bg-gradient-to-r from-teal-500 to-emerald-500"
            hoverColor="hover:shadow-lg"
          />
        </div>
      </div>

      {/* Contenu des cartes de produits */}
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* TOP 3 CA */}
          <SummaryCard 
            title="Top 3 Chiffre d'Affaires" 
            icon={<HiCurrencyDollar className="w-5 h-5" />}
            iconColor="text-teal-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.1}
            accentColor="teal"
          >
            <div className="space-y-4">
              {topRevenue.map((product, index) => (
                <ProductDataBlock 
                  key={product.code_13_ref}
                  title={product.product_name}
                  code={product.code_13_ref}
                  value={product.revenue}
                  previousValue={product.previous?.revenue}
                  isCurrency
                  accentColor="teal"
                  animationDelay={0.2 + (index * 0.1)}
                  variant="minimal"
                />
              ))}
            </div>
          </SummaryCard>

          {/* TOP 3 MARGE */}
          <SummaryCard 
            title="Top 3 Marge" 
            icon={<HiShoppingCart className="w-5 h-5" />}
            iconColor="text-emerald-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.2}
            accentColor="emerald"
          >
            <div className="space-y-4">
              {topMargin.map((product, index) => (
                <ProductDataBlock 
                  key={product.code_13_ref}
                  title={product.product_name}
                  code={product.code_13_ref}
                  value={product.margin}
                  previousValue={product.previous?.margin}
                  isCurrency
                  accentColor="emerald"
                  animationDelay={0.3 + (index * 0.1)}
                  variant="minimal"
                />
              ))}
            </div>
          </SummaryCard>

          {/* TOP 3 PROGRESSION */}
          <SummaryCard 
            title="Top 3 Progression" 
            icon={<HiCurrencyDollar className="w-5 h-5" />}
            iconColor="text-blue-500"
            variant="glassmorphic"
            noPadding={false}
            animationDelay={0.3}
            accentColor="blue"
          >
            <div className="space-y-4">
              {topGrowth.map((product, index) => (
                <ProductDataBlock 
                  key={product.code_13_ref}
                  title={product.product_name}
                  code={product.code_13_ref}
                  value={product.evolution || 0}
                  isPercentage
                  extraValue={product.revenue}
                  accentColor="blue"
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

export default TopProductsCard;