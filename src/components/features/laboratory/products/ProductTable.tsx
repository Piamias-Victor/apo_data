
import React, { useState } from "react";
import { FaTable, FaChartBar } from "react-icons/fa";
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
    primary: "bg-blue-500",
    secondary: "bg-blue-600",
    hover: "hover:bg-blue-600"
  },
  defaultCollapsed = true,
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

  return (
    <CollapsibleSection 
      title={title} 
      icon={icon}
      defaultCollapsed={defaultCollapsed}
      buttonColorClass={`${colorTheme.primary} ${colorTheme.hover}`}
    >
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* Barre de recherche */}
        <div className="w-full md:w-2/3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher par Code 13 ou Nom..."
            accentColor="blue"
          />
        </div>

        {/* Bouton pour basculer entre totaux et unitaires */}
        <ActionButton
          onClick={() => setShowUnitValues(prev => !prev)}
          icon={<FaChartBar />}
          variant="primary"
        >
          {showUnitValues ? "Afficher Totaux" : "Afficher Valeurs Unitaires"}
        </ActionButton>
      </div>

      {/* États de chargement et d'erreur */}
      {loading && <p className="text-gray-500 text-center">⏳ Chargement des données...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {/* Tableau */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="overflow-hidden border border-gray-200 shadow-lg rounded-lg">
          <table className="w-full border-collapse rounded-lg table-auto">
            <SortableTableHeader
              columns={getColumns()}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSort={handleSort}
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
                      <td colSpan={getColumns().length} className="p-4 bg-blue-100 text-center text-blue-900">
                        {loadingStockData[product.code_13_ref] && (
                          <p className="text-gray-500">Chargement des données...</p>
                        )}

                        {salesStockData[product.code_13_ref] && (
                          <div className="mt-4">
                            <ProductSalesStockChart salesStockData={salesStockData[product.code_13_ref]} />
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message si aucune donnée */}
      {!loading && !error && filteredData.length === 0 && (
        <p className="text-center text-gray-500 my-8">Aucun produit ne correspond à votre recherche.</p>
      )}
    </CollapsibleSection>
  );
};

export default ProductTable;