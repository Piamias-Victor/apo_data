import { ProductSalesData } from '@/types/types';
import { motion } from 'framer-motion';
import React from 'react';
import ValueWithEvolution from './ValueWithEvolution';

interface ProductTableRowProps {
  product: ProductSalesData;
  showUnitValues: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * Composant de ligne pour le tableau des produits
 */
const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  showUnitValues,
  isExpanded,
  onToggleExpand,
}) => {
  // Pour s'assurer que l'indice de rentabilité est toujours calculé
  const rentabilityIndex = product.indice_rentabilite || 0;
  
  return (
    <motion.tr 
      className="border-b border-gray-100 bg-white hover:bg-gray-50/80 transition-all duration-300 text-center"
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      whileHover={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Code 13 */}
      <td className="py-4 px-5 text-gray-600 text-sm font-medium border-r border-gray-50">
        <div className="flex justify-center">
          <div className="px-3 py-1 bg-gray-50 rounded-md text-gray-500">
            {product.code_13_ref}
          </div>
        </div>
      </td>

      {/* Nom du produit */}
      <td className="py-4 px-5">
        <div 
          className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-800 font-medium" 
          title={product.product_name}
        >
          {product.product_name}
        </div>
      </td>

      {/* Quantité */}
      <td className="py-4 px-5">
        <ValueWithEvolution 
          currentValue={product.total_quantity} 
          previousValue={product.previous?.total_quantity}
          formatAsPrice={false}
          className="items-center"
        />
      </td>

      {/* Valeurs dynamiques en fonction du mode d'affichage */}
      {showUnitValues ? (
        <>
          <td className="py-4 px-5 bg-gray-50/30">
            <ValueWithEvolution 
              currentValue={product.avg_selling_price} 
              previousValue={product.previous?.avg_selling_price}
              className="items-center"
            />
          </td>
          <td className="py-4 px-5">
            <ValueWithEvolution 
              currentValue={product.avg_margin} 
              previousValue={product.previous?.avg_margin}
              className="items-center"
            />
          </td>
          <td className="py-4 px-5 bg-gray-50/30">
            <ValueWithEvolution 
              currentValue={product.purchase_quantity} 
              previousValue={product.previous?.purchase_quantity}
              formatAsPrice={false}
              className="items-center"
            />
          </td>
          <td className="py-4 px-5">
            <ValueWithEvolution 
              currentValue={product.avg_purchase_price} 
              previousValue={product.previous?.avg_purchase_price}
              className="items-center"
            />
          </td>
        </>
      ) : (
        <>
          <td className="py-4 px-5 bg-gray-50/30">
            <ValueWithEvolution 
              currentValue={product.revenue} 
              previousValue={product.previous?.revenue}
              className="items-center"
            />
          </td>
          <td className="py-4 px-5">
            <ValueWithEvolution 
              currentValue={product.margin} 
              previousValue={product.previous?.margin}
              className="items-center"
            />
          </td>
          <td className="py-4 px-5 bg-gray-50/30">
            <ValueWithEvolution 
              currentValue={product.purchase_quantity} 
              previousValue={product.previous?.purchase_quantity}
              formatAsPrice={false}
              className="items-center"
            />
          </td>
          <td className="py-4 px-5">
            <ValueWithEvolution 
              currentValue={product.purchase_amount} 
              previousValue={product.previous?.purchase_amount}
              className="items-center"
            />
          </td>
        </>
      )}

      {/* Indice de rentabilité */}
      <td className="py-4 px-5 bg-gray-50/30">
        <ValueWithEvolution 
          currentValue={rentabilityIndex}
          previousValue={product.previous?.indice_rentabilite}
          formatAsPrice={false}
          className="items-center"
        />
      </td>

      {/* Bouton d'expansion */}
      <td className="py-4 px-5 text-center">
        <motion.button
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            duration: 0.3 
          }}
          whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleExpand}
          className="p-2.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-center shadow-md shadow-blue-200 border border-blue-400/30"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-white w-4 h-4" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </motion.button>
      </td>
    </motion.tr>
  );
};

export default ProductTableRow;