// components/laboratory/break/ProductBreakTableRow.tsx
import { motion } from 'framer-motion';
import React from 'react';
import ValueWithEvolution from '@/components/common/tables/ValueWithEvolution';


interface ProductStockBreakData {
  code_13_ref: string;
  product_name: string;
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
  previous?: {
    total_products_ordered: number;
    stock_break_products: number;
    stock_break_rate: number;
    stock_break_amount: number;
  };
}

interface ProductBreakTableRowProps {
  product: ProductStockBreakData;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * Composant de ligne pour le tableau des produits en rupture
 */
const ProductBreakTableRow: React.FC<ProductBreakTableRowProps> = ({
  product,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <tr className="border-b bg-gray-50 hover:bg-gray-200 transition text-center">
      {/* Code EAN */}
      <td className="p-3">{product.code_13_ref}</td>

      {/* Nom du produit */}
      <td className="p-3">
        <div 
          className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" 
          title={product.product_name}
        >
          {product.product_name}
        </div>
      </td>

      {/* Quantité Commandée */}
      <td className="p-3">
        <ValueWithEvolution 
          currentValue={product.total_products_ordered} 
          previousValue={product.previous?.total_products_ordered}
          formatAsPrice={false}
        />
      </td>

      {/* Quantité en Rupture */}
      <td className="p-3">
        <ValueWithEvolution 
          currentValue={product.stock_break_products} 
          previousValue={product.previous?.stock_break_products}
          formatAsPrice={false}
        />
      </td>

      {/* Taux de Rupture */}
      <td className="p-3">
        <ValueWithEvolution 
          currentValue={product.stock_break_rate} 
          previousValue={product.previous?.stock_break_rate}
          formatAsPrice={false}
        />
      </td>

      {/* Montant Rupture */}
      <td className="p-3 text-red-600 font-bold">
        <ValueWithEvolution 
          currentValue={product.stock_break_amount} 
          previousValue={product.previous?.stock_break_amount}
          formatAsPrice={true}
          className="text-red-600"
        />
      </td>

      {/* Bouton d'expansion */}
      <td className="p-3 text-center">
        <motion.button
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          onClick={onToggleExpand}
          className="p-2 rounded-full bg-red-600 flex items-center justify-center text-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-white text-lg w-full" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </motion.button>
      </td>
    </tr>
  );
};

export default ProductBreakTableRow;