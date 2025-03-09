import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTable, FaChartBar, FaSearch, FaSyncAlt } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import ProductSalesStockChart from "./ProductSalesStockChart";
import ActionButton from "@/components/common/buttons/ActionButton";
import SearchInput from "@/components/common/inputs/SearchInput";
import CollapsibleSection from "@/components/common/sections/CollapsibleSection";
import ProductTableRow from "@/components/common/tables/ProductTableRow";
import SortableTableHeader from "@/components/common/tables/SortableTableHeader";
import { useFilterContext } from "@/contexts/FilterContext";
import { useProductData } from "@/hooks/api/useProductData";
import { ProductTableProps } from "@/types/types";

/**
 * Tableau de produits avec tri, recherche et détails extensibles
 */
const ProductTable: React.FC<ProductTableProps> = ({
  title = "Performances Produits",
  icon = <FaTable className="text-blue-500" />,
  colorTheme = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600",
    secondary: "bg-blue-600",
    hover: "hover:from-blue-600 hover:to-blue-700"
  },
  defaultCollapsed = false,
}) => {
  // États locaux
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showUnitValues, setShowUnitValues] = useState<boolean>(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  
  // Contexte et hook personnalisé
  const { filters } = useFilterContext();
  const { 
    loading, 
    error, 
    sortedProducts, 
    sortColumn,
    sortOrder,
    handleSort,
    searchProducts,
    salesStockData,
    loadingStockData,
    fetchProductSalesAndStock
  } = useProductData({ filters });
  
  // Recherche et filtrage
  const filteredData = searchProducts(searchQuery);

  // Colonnes du tableau
  const getColumns = () => {
    const baseColumns = [
      { key: "code_13_ref" as const, label: "Code 13" },
      { key: "product_name" as const, label: "Produit" },
      { key: "total_quantity" as const, label: "Qte" },
    ];

    const valueColumns = showUnitValues 
      ? [
          { key: "avg_selling_price" as const, label: "Prix (€)" },
          { key: "avg_margin" as const, label: "Marge (€)" },
          { key: "purchase_quantity" as const, label: "Qte Achetée" },
          { key: "avg_purchase_price" as const, label: "Achat (€)" },
        ]
      : [
          { key: "revenue" as const, label: "CA (€)" },
          { key: "margin" as const, label: "Marge (€)" },
          { key: "purchase_quantity" as const, label: "Qte Achetée" },
          { key: "purchase_amount" as const, label: "Achat (€)" },
        ];
    
    const additionalColumns = [
      { key: "indice_rentabilite" as const, label: "Rentabilité" },
      // Ajout de la colonne "Détails" (non liée à une propriété des données, juste pour l'affichage)
      { key: "details" as const, label: "Détails" },
    ];

    return [...baseColumns, ...valueColumns, ...additionalColumns];
  };

  // Gestionnaire pour l'expansion d'une ligne
  const toggleDetails = (code_13_ref: string) => {
    const newExpandedProduct = expandedProduct === code_13_ref ? null : code_13_ref;
    setExpandedProduct(newExpandedProduct);
    
    if (newExpandedProduct) {
      fetchProductSalesAndStock(code_13_ref);
    }
  };

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
  
  const contentVariants = {
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
    >
      {/* En-tête avec titre et contrôles */}
      <div className="p-6 md:p-8 relative bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100/50">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-sm"></div>
        
        {/* Éléments de design de fond */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100/80 text-blue-600 shadow-sm border border-blue-200/50">
                {icon}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center">
                <HiSparkles className="text-yellow-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {title}
              </h2>
              <motion.p 
                variants={contentVariants}
                className="text-gray-500 text-sm mt-1"
              >
                Analyse détaillée des produits avec des métriques de performance
              </motion.p>
            </div>
          </div>

          {/* Boutons de contrôle */}
          <div className="flex gap-3">
            <ActionButton
              onClick={() => setShowUnitValues(prev => !prev)}
              icon={<FaChartBar />}
              variant="primary"
              accentColor="blue"
              size="md"
              rounded="full"
              withRing
            >
              {showUnitValues ? "Afficher Totaux" : "Afficher Unitaires"}
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6 md:p-8 bg-white">
        <motion.div
          variants={contentVariants}
          className="mb-6"
        >
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher par Code 13 ou Nom de produit..."
            accentColor="blue"
            size="md"
            variant="glassmorphic"
            withHistory={false}
          />
        </motion.div>

        {/* États de chargement et d'erreur */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center p-12 bg-white/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
              />
              <p className="text-gray-500">Chargement des données produits...</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-red-50/90 backdrop-blur-md rounded-xl shadow-sm border border-red-200 text-center"
          >
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Tableau */}
        {!loading && !error && filteredData.length > 0 && (
          <motion.div 
            variants={contentVariants}
            className="overflow-hidden border border-gray-200 shadow-lg rounded-xl"
          >
            <table className="w-full border-collapse rounded-xl table-auto">
              <SortableTableHeader
                columns={getColumns()}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
                headerBgColor="bg-gradient-to-r from-blue-500 to-indigo-500"
                headerHoverColor="hover:from-blue-600 hover:to-indigo-600"
              />
              
              <tbody className="text-sm">
                {filteredData.map((product, index) => (
                  <React.Fragment key={`${product.code_13_ref}-${index}`}>
                    {/* Ligne de produit */}
                    <ProductTableRow
                      product={product}
                      showUnitValues={showUnitValues}
                      isExpanded={expandedProduct === product.code_13_ref}
                      onToggleExpand={() => toggleDetails(product.code_13_ref)}
                    />

                    {/* Détails du produit */}
                    {expandedProduct === product.code_13_ref && (
                      <tr>
                        <td colSpan={getColumns().length} className="p-0">
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-t border-b border-blue-100"
                          >
                            {loadingStockData[product.code_13_ref] && (
                              <div className="flex justify-center items-center p-8">
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                  className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3"
                                />
                                <p className="text-blue-600">Chargement des données détaillées...</p>
                              </div>
                            )}

                            {salesStockData[product.code_13_ref] && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100/80 text-blue-600 shadow-sm border border-blue-200/50">
                                    <FaSyncAlt className="w-4 h-4" />
                                  </div>
                                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Évolution des Ventes et Stocks
                                  </h3>
                                </div>
                                <ProductSalesStockChart salesStockData={salesStockData[product.code_13_ref]} />
                              </div>
                            )}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Message si aucune donnée */}
        {!loading && !error && filteredData.length === 0 && (
          <motion.div 
            variants={contentVariants}
            className="p-8 bg-amber-50/90 backdrop-blur-md rounded-xl border border-amber-200 text-center shadow-sm"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
              <FaSearch className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-amber-700">Aucun produit ne correspond à votre recherche.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductTable;