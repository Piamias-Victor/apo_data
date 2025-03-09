import React from 'react';
import { motion } from 'framer-motion';
import { HiChevronRight } from 'react-icons/hi2';
import { formatLargeNumber } from '@/libs/formatUtils';
import { ProductSalesData } from '@/types/types';

interface ProductTableRowProps {
  product: ProductSalesData;
  showUnitValues: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * Composant de ligne pour le tableau des produits avec animations fluides et espacement réduit
 */
const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  showUnitValues,
  isExpanded,
  onToggleExpand,
}) => {
  // Rentabilité et évolution
  const rentabilityIndex = product.indice_rentabilite || 0;
  
  // Calculer le pourcentage d'évolution
  const calculateEvolution = (currentValue: number, previousValue?: number): { value: number | null, isPositive: boolean } => {
    if (!previousValue) return { value: null, isPositive: false };
    
    if (previousValue === 0) {
      return { value: currentValue > 0 ? 100 : 0, isPositive: currentValue > 0 };
    }
    
    const percentage = ((currentValue - previousValue) / previousValue) * 100;
    return { 
      value: isNaN(percentage) ? null : percentage, 
      isPositive: percentage >= 0 
    };
  };

  // Animations pour la ligne
  const rowVariants = {
    initial: { opacity: 0.6, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3, 
        ease: [0.22, 1, 0.36, 1] 
      }
    },
    hover: { 
      backgroundColor: isExpanded ? "rgba(239, 246, 255, 0.6)" : "rgba(249, 250, 251, 0.6)",
      transition: { duration: 0.2 }
    }
  };

  // Animation pour l'indicateur d'évolution
  const evolutionVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.2, 
        duration: 0.3, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  // Animation pour le bouton d'expansion
  const buttonVariants = {
    initial: { rotate: 0 },
    expanded: { 
      rotate: 90,
      backgroundColor: "#3b82f6", 
      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
      transition: { 
        duration: 0.3, 
        ease: [0.22, 1, 0.36, 1] 
      }
    },
    collapsed: { 
      rotate: 0,
      backgroundColor: "#e0e7ff",
      boxShadow: "0 2px 5px rgba(79, 70, 229, 0.1)",
      transition: { 
        duration: 0.3, 
        ease: [0.22, 1, 0.36, 1] 
      }
    },
    hover: { 
      scale: 1.1, 
      boxShadow: "0 6px 15px rgba(59, 130, 246, 0.4)",
      transition: { 
        duration: 0.2, 
        ease: "easeOut" 
      }
    },
    tap: { 
      scale: 0.95,
      transition: { 
        duration: 0.1, 
        ease: "easeIn" 
      }
    }
  };

  // Rendu des cellules pour les valeurs avec évolution (version avec espacement réduit)
  const renderValueCell = (
    currentValue: number, 
    previousValue?: number, 
    isCurrency: boolean = true,
    alternateRow: boolean = false
  ) => {
    const evolution = calculateEvolution(currentValue, previousValue);
    
    return (
      <td className={`py-2 px-3 ${alternateRow ? 'bg-blue-50/20' : ''}`}>
        <div className="flex flex-col items-center">
          <span className="font-medium text-gray-800 text-xs">
            {formatLargeNumber(currentValue, isCurrency)}
          </span>
          
          {evolution.value !== null && (
            <motion.div
              variants={evolutionVariants}
              initial="initial"
              animate="animate"
              className={`mt-1 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                evolution.isPositive 
                  ? "bg-green-50 text-green-600" 
                  : "bg-red-50 text-red-600"
              }`}
            >
              <span className="text-[10px]">
                {evolution.isPositive ? "+" : ""}
                {evolution.value.toFixed(1)}%
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className={`w-2.5 h-2.5 ${!evolution.isPositive && "transform rotate-180"}`}
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 15a.75.75 0 01-.75-.75V7.612L6.295 10.44a.75.75 0 11-1.09-1.03l3.25-3.5a.75.75 0 011.09 0l3.25 3.5a.75.75 0 11-1.09 1.03l-2.955-2.828v6.638A.75.75 0 0110 15z" 
                  clipRule="evenodd" 
                />
              </svg>
            </motion.div>
          )}
        </div>
      </td>
    );
  };

  return (
    <motion.tr 
      variants={rowVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`${isExpanded ? 'bg-blue-50/30' : 'bg-white'} border-b border-gray-100 transition-colors duration-300`}
    >
      {/* Code 13 */}
      <td className="py-2 px-3 border-r border-gray-50">
        <div className="flex justify-center">
          <motion.div 
            whileHover={{ y: -1, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium border border-indigo-100"
          >
            {product.code_13_ref}
          </motion.div>
        </div>
      </td>

      {/* Nom du produit */}
      <td className="py-2 px-3">
        <div 
          className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-800 font-medium text-xs" 
          title={product.product_name}
        >
          {product.product_name}
        </div>
      </td>

      {/* Quantité */}
      {renderValueCell(
        product.total_quantity, 
        product.previous?.total_quantity, 
        false
      )}

      {/* Valeurs dynamiques en fonction du mode d'affichage */}
      {showUnitValues ? (
        <>
          {renderValueCell(
            product.avg_selling_price, 
            product.previous?.avg_selling_price, 
            true, 
            true
          )}
          {renderValueCell(
            product.avg_margin, 
            product.previous?.avg_margin, 
            true
          )}
          {renderValueCell(
            product.purchase_quantity, 
            product.previous?.purchase_quantity, 
            false, 
            true
          )}
          {renderValueCell(
            product.avg_purchase_price, 
            product.previous?.avg_purchase_price, 
            true
          )}
        </>
      ) : (
        <>
          {renderValueCell(
            product.revenue, 
            product.previous?.revenue, 
            true, 
            true
          )}
          {renderValueCell(
            product.margin, 
            product.previous?.margin, 
            true
          )}
          {renderValueCell(
            product.purchase_quantity, 
            product.previous?.purchase_quantity, 
            false, 
            true
          )}
          {renderValueCell(
            product.purchase_amount, 
            product.previous?.purchase_amount, 
            true
          )}
        </>
      )}

      {/* Indice de rentabilité */}
      {renderValueCell(
        rentabilityIndex, 
        product.previous?.indice_rentabilite, 
        false, 
        true
      )}

      {/* Bouton d'expansion */}
      <td className="py-2 px-3 text-center">
        <motion.button
          variants={buttonVariants}
          initial="initial"
          animate={isExpanded ? "expanded" : "collapsed"}
          whileHover="hover"
          whileTap="tap"
          onClick={onToggleExpand}
          className="p-1.5 rounded-full flex items-center justify-center text-center border transition-all"
        >
          <HiChevronRight 
            className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-indigo-600'}`} 
          />
        </motion.button>
      </td>
    </motion.tr>
  );
};

export default ProductTableRow;