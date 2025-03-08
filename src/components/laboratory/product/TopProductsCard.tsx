// components/products/TopProductsCard.tsx
import React from "react";
import { FaCrown } from "react-icons/fa";
import SummaryCard from "@/components/ui/SummaryCard";
import { ProductWithComparison } from "@/hooks/useProductsData";
import ProductDataBlock from "@/components/ui/ProductDataBlock";

interface TopProductsCardProps {
  topRevenue: ProductWithComparison[];
  topMargin: ProductWithComparison[];
  topGrowth: ProductWithComparison[];
}

const TopProductsCard: React.FC<TopProductsCardProps> = ({
  topRevenue,
  topMargin,
  topGrowth
}) => {
  return (
    <div className="p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* Titre */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-4 mb-5">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FaCrown className="text-teal-500" /> Produits Leaders
        </h2>
      </div>

      {/* Contenu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        {/* TOP 3 CA */}
        <SummaryCard title="🏆 Top 3 CA" icon={null} iconColor="text-teal-600">
          {topRevenue.map(product => (
            <ProductDataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.revenue} 
              previousValue={product.previous?.revenue}
              isCurrency 
            />
          ))}
        </SummaryCard>

        {/* TOP 3 Marge */}
        <SummaryCard title="💰 Top 3 Marge" icon={null} iconColor="text-teal-600">
          {topMargin.map(product => (
            <ProductDataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.margin} 
              previousValue={product.previous?.margin}
              isCurrency 
            />
          ))}
        </SummaryCard>

        {/* TOP 3 Progressions */}
        <SummaryCard title="🔥 Top 3 Progressions (CA)" icon={null} iconColor="text-teal-600">
          {topGrowth.map(product => (
            <ProductDataBlock 
              key={product.code_13_ref} 
              title={product.product_name} 
              code={product.code_13_ref}
              value={product.evolution || 0} 
              isPercentage 
              extraValue={product.revenue}
            />
          ))}
        </SummaryCard>
      </div>
    </div>
  );
};

export default TopProductsCard;