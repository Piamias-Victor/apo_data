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
    <tr className="border-b bg-gray-50 hover:bg-gray-200 transition text-center">
      {/* Code 13 */}
      <td className="p-3">{product.code_13_ref}</td>

      {/* Nom du produit */}
      <td className="p-3">
        <div 
          className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" 
          title={product.product_name}
        >
          {product.product_name}
        </div>
      </td>

      {/* Quantité */}
      <td className="p-3">
        <ValueWithEvolution 
          currentValue={product.total_quantity} 
          previousValue={product.previous?.total_quantity}
          formatAsPrice={false}
        />
      </td>

      {/* Valeurs dynamiques en fonction du mode d'affichage */}
      {showUnitValues ? (
        <>
          <td className="p-3">
            <ValueWithEvolution 
              currentValue={product.avg_selling_price} 
              previousValue={product.previous?.avg_selling_price}
            />
          </td>
          <td className="p-3">
            <ValueWithEvolution 
              currentValue={product.avg_margin} 
              previousValue={product.previous?.avg_margin}
            />
          </td>
          <td className="p-3">
            <ValueWithEvolution 
              currentValue={product.purchase_quantity} 
              previousValue={product.previous?.purchase_quantity}
              formatAsPrice={false}
            />
          </td>
          <td className="p-3">
            <ValueWithEvolution 
              currentValue={product.avg_purchase_price} 
              previousValue={product.previous?.avg_purchase_price}
            />
          </td>
        </>
      ) : (
        <>
          <td className="p-3">
            <ValueWithEvolution 
              currentValue={product.revenue} 
              previousValue={product.previous?.revenue}
            />
          </td>
          <td className="p-3">
            <ValueWithEvolution 
              currentValue={product.margin} 
              previousValue={product.previous?.margin}
            />
          </td>
          <td className="p-3">
            <ValueWithEvolution 
              currentValue={product.purchase_quantity} 
              previousValue={product.previous?.purchase_quantity}
              formatAsPrice={false}
            />
          </td>
          <td className="p-3">
            <ValueWithEvolution 
              currentValue={product.purchase_amount} 
              previousValue={product.previous?.purchase_amount}
            />
          </td>
        </>
      )}

      {/* Indice de rentabilité */}
      <td className="p-3">
        <ValueWithEvolution 
          currentValue={rentabilityIndex}
          previousValue={product.previous?.indice_rentabilite}
          formatAsPrice={false}
        />
      </td>

      {/* Bouton d'expansion */}
      <td className="p-3 text-center">
        <motion.button
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          onClick={onToggleExpand}
          className="p-2 rounded-full bg-blue-600 flex items-center justify-center text-center"
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

export default ProductTableRow;