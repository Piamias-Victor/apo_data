import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTable, FaSearch, FaSyncAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { HiSparkles, HiExclamationTriangle } from "react-icons/hi2";
import ProductBreakChart from "@/components/common/charts/BreakChart";
import ActionButton from "@/components/common/buttons/ActionButton";
import SearchInput from "@/components/common/inputs/SearchInput";
import SortableTableHeader from "@/components/common/tables/SortableTableHeader";
import { useFilterContext } from "@/contexts/FilterContext";
import ProductBreakTableRow from "./ProductBreakTableRow";

export interface ProductStockBreakData {
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

interface ProductBreakTableProps {
  products: ProductStockBreakData[];
  title?: string;
  icon?: React.ReactNode;
  defaultCollapsed?: boolean;
}

/**
 * Tableau détaillé des produits en rupture
 * Affiche la liste des produits en rupture avec possibilité de voir les détails
 * pour chaque produit, incluant un graphique de rupture.
 */
const ProductBreakTable: React.FC<ProductBreakTableProps> = ({
  products,
  title = "Produits en Rupture de Stock",
  icon = <HiExclamationTriangle className="w-5 h-5" />,
  defaultCollapsed = false
}) => {
  // États locaux
  const { filters } = useFilterContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<keyof ProductStockBreakData>("stock_break_amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [isTableCollapsed, setIsTableCollapsed] = useState<boolean>(defaultCollapsed);
  const [salesStockData, setSalesStockData] = useState<Record<string, any>>({});
  const [loadingStockData, setLoadingStockData] = useState<Record<string, boolean>>({});

  // Colonnes du tableau
  const columns = [
    { key: "code_13_ref" as const, label: "Code EAN" },
    { key: "product_name" as const, label: "Produit" },
    { key: "total_products_ordered" as const, label: "Qté Commandée" },
    { key: "stock_break_products" as const, label: "Qté Rupture" },
    { key: "stock_break_rate" as const, label: "Taux Rupture (%)" },
    { key: "stock_break_amount" as const, label: "Montant Rupture (€)" },
    { key: "details" as const, label: "Détails" },
  ];

  // Normalisation des données
  const normalizedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      total_products_ordered: Number(product.total_products_ordered) || 0,
      stock_break_products: Number(product.stock_break_products) || 0,
      stock_break_rate: Number(product.stock_break_rate) || 0,
      stock_break_amount: Number(product.stock_break_amount) || 0,
      previous: product.previous ? {
        total_products_ordered: Number(product.previous.total_products_ordered) || 0,
        stock_break_products: Number(product.previous.stock_break_products) || 0,
        stock_break_rate: Number(product.previous.stock_break_rate) || 0,
        stock_break_amount: Number(product.previous.stock_break_amount) || 0
      } : undefined
    }));
  }, [products]);

  // Gestion du tri
  const handleSort = (column: keyof ProductStockBreakData) => {
    setSortOrder(prev => (sortColumn === column ? (prev === "asc" ? "desc" : "asc") : "desc"));
    setSortColumn(column);
  };

  // Filtrage et tri des produits
  const filteredProducts = useMemo(() => {
    return normalizedProducts
      .filter(product => 
        product.code_13_ref.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortOrder === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        }
        
        // Pour les valeurs numériques
        valueA = valueA as number;
        valueB = valueB as number;
        
        return sortOrder === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      });
  }, [normalizedProducts, searchQuery, sortColumn, sortOrder]);

  // Fonction pour charger les détails d'un produit
  const fetchProductDetails = async (code_13_ref: string) => {
    if (salesStockData[code_13_ref] || loadingStockData[code_13_ref]) return;
    
    setLoadingStockData(prev => ({ ...prev, [code_13_ref]: true }));
    
    try {
      const response = await fetch("/api/sale/getProductSalesAndStock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_13_ref, pharmacies: filters.pharmacies }),
      });
    
      if (!response.ok) throw new Error("Erreur lors de la récupération des données de ventes/stocks.");
    
      const data = await response.json();
      setSalesStockData(prev => ({ ...prev, [code_13_ref]: data.salesStockData }));
    } catch (error) {
      console.error("❌ Erreur API :", error);
    } finally {
      setLoadingStockData(prev => ({ ...prev, [code_13_ref]: false }));
    }
  };

  // Fonction pour basculer l'affichage des détails
  const toggleDetails = (code_13_ref: string) => {
    const newExpandedProduct = expandedProduct === code_13_ref ? null : code_13_ref;
    setExpandedProduct(newExpandedProduct);
    
    if (newExpandedProduct) {
      fetchProductDetails(code_13_ref);
    }
  };

  // Fonction pour basculer la visibilité du tableau
  const toggleTableVisibility = () => {
    setIsTableCollapsed(prev => !prev);
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

  const tableVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      overflow: "hidden" 
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { 
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
      <div className="p-6 md:p-8 relative bg-gradient-to-br from-red-50 to-amber-50 border-b border-red-100/50">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-amber-500 shadow-sm"></div>
        
        {/* Éléments de design de fond */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100/80 text-red-600 shadow-sm border border-red-200/50">
                {icon}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center">
                <HiSparkles className="text-yellow-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                {title}
              </h2>
              <motion.p 
                variants={contentVariants}
                className="text-gray-500 text-sm mt-1"
              >
                Analyse détaillée des produits en rupture de stock
              </motion.p>
            </div>
          </div>

          {/* Boutons de contrôle */}
          <ActionButton
            onClick={toggleTableVisibility}
            icon={isTableCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            variant="secondary"
            size="md"
            rounded="full"
            withRing
          >
            {isTableCollapsed ? "Afficher tableau" : "Masquer tableau"}
          </ActionButton>
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
            placeholder="Rechercher par Code EAN ou Nom de produit..."
            accentColor="red"
            size="md"
            variant="glassmorphic"
            withHistory={false}
          />
        </motion.div>

        {/* Animation du tableau */}
        <AnimatePresence initial={false}>
          {!isTableCollapsed && filteredProducts.length > 0 && (
            <motion.div 
              variants={tableVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="overflow-hidden"
            >
              <div className="border border-gray-200 shadow-lg rounded-xl">
                <table className="w-full border-collapse rounded-xl table-auto">
                  <SortableTableHeader
                    columns={columns.map(col => ({
                      key: col.key,
                      label: col.label
                    }))}
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    headerBgColor="bg-gradient-to-r from-red-500 to-amber-500"
                    headerHoverColor="hover:from-red-600 hover:to-amber-600"
                  />
                  
                  <tbody className="text-sm">
                    {filteredProducts.map((product) => (
                      <React.Fragment key={product.code_13_ref}>
                        {/* Ligne du produit */}
                        <ProductBreakTableRow
                          product={product}
                          isExpanded={expandedProduct === product.code_13_ref}
                          onToggleExpand={() => toggleDetails(product.code_13_ref)}
                        />

                        {/* Détails du produit */}
                        {expandedProduct === product.code_13_ref && (
                          <tr>
                            <td colSpan={columns.length} className="p-0">
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="bg-gradient-to-br from-red-50 to-amber-50 p-6 border-t border-b border-red-100"
                              >
                                {loadingStockData[product.code_13_ref] && (
                                  <div className="flex justify-center items-center p-8">
                                    <motion.div 
                                      animate={{ rotate: 360 }}
                                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                      className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full mr-3"
                                    />
                                    <p className="text-red-600">Chargement des données détaillées...</p>
                                  </div>
                                )}

                                {salesStockData[product.code_13_ref] && (
                                  <div className="mt-2">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100/80 text-red-600 shadow-sm border border-red-200/50">
                                        <FaSyncAlt className="w-4 h-4" />
                                      </div>
                                      <h3 className="text-lg font-semibold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                                        Évolution des Ventes et Ruptures
                                      </h3>
                                    </div>
                                    <ProductBreakChart breakData={salesStockData[product.code_13_ref]} />
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message si aucune donnée - visible seulement quand le tableau est visible */}
        {!isTableCollapsed && filteredProducts.length === 0 && (
          <motion.div 
            variants={contentVariants}
            className="p-8 bg-amber-50/90 backdrop-blur-md rounded-xl border border-amber-200 text-center shadow-sm"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
              <FaSearch className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-amber-700">Aucun produit en rupture ne correspond à votre recherche.</p>
          </motion.div>
        )}

        {/* Message de tableau masqué - visible uniquement quand le tableau est masqué */}
        {isTableCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-red-50/50 rounded-xl border border-red-100 text-center shadow-sm"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <FaTable className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-red-700 font-medium">Le tableau des produits en rupture est actuellement masqué</p>
              <p className="text-red-500 text-sm mt-1">Utilisez le bouton "Afficher tableau" pour visualiser les données</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductBreakTable;