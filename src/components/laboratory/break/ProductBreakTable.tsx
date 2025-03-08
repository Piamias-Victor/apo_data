// components/laboratory/break/ProductBreakTable.tsx
import React, { useState, useMemo } from "react";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { motion } from "framer-motion";
import SearchInput from "@/components/ui/inputs/SearchInput";
import ProductBreakTableRow from "./ProductBreakTableRow";
import SortableTableHeader from "@/components/ui/SortableTableHeader";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import ProductBreakChart from "./ProductBreakChart";
import { useFilterContext } from "@/contexts/FilterContext";

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

interface ProductBreakTableProps {
  products: ProductStockBreakData[];
}

/**
 * Tableau détaillé des produits en rupture
 */
const ProductBreakTable: React.FC<ProductBreakTableProps> = ({ products }) => {
  // États locaux
  const { filters } = useFilterContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<keyof ProductStockBreakData>("stock_break_amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
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
        return sortOrder === 'asc' 
          ? (valueA as number) - (valueB as number) 
          : (valueB as number) - (valueA as number);
      });
  }, [normalizedProducts, searchQuery, sortColumn, sortOrder]);

  // Fonction pour charger les détails d'un produit - utilisant la même API que pour les ventes/stocks
  const fetchProductDetails = async (code_13_ref: string) => {
    if (salesStockData[code_13_ref] || loadingStockData[code_13_ref]) return;
    
    setLoadingStockData(prev => ({ ...prev, [code_13_ref]: true }));
    
    try {
      const response = await fetch("/api/sell-out/getProductSalesAndStock", {
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
    if (expandedProduct === code_13_ref) {
      setExpandedProduct(null);
      return;
    }
    
    setExpandedProduct(code_13_ref);
    // Charger les données si nécessaire
    fetchProductDetails(code_13_ref);
  };

  return (
    <CollapsibleSection 
      title="Produits en Rupture de Stock" 
      icon="🚨"
      buttonColorClass="bg-red-500 hover:bg-red-600"
      defaultCollapsed={false}
    >
      {/* Barre de recherche */}
      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher par Code EAN ou Nom du produit..."
          accentColor="red"
        />
      </div>

      {/* Tableau principal */}
      {filteredProducts.length > 0 ? (
        <div className="overflow-hidden border border-gray-200 shadow-lg rounded-lg">
          <table className="w-full border-collapse rounded-lg table-auto">
            {/* En-tête du tableau avec la colonne Détails */}
            <thead>
              <tr className="bg-red-500 text-white text-md">
                {columns.slice(0, -1).map(column => (
                  <th
                    key={column.key}
                    className="p-4 cursor-pointer transition hover:bg-red-600"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex justify-center items-center gap-2">
                      {column.label}
                      {sortColumn === column.key ? (
                        sortOrder === "asc" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        )
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 8-6 6-6-6"/><path d="m18 16-6-6-6 6"/></svg>
                      )}
                    </div>
                  </th>
                ))}
                {/* Ajout explicite de la colonne Détails */}
                <th className="p-4 text-center">
                  Détails
                </th>
              </tr>
            </thead>
            
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
                      <td colSpan={columns.length} className="p-4 bg-red-50 text-center">
                        {loadingStockData[product.code_13_ref] ? (
                          <p className="text-gray-500">Chargement des détails...</p>
                        ) : salesStockData[product.code_13_ref] ? (
                          <div className="mt-4">
                            <ProductBreakChart breakData={salesStockData[product.code_13_ref]} />
                          </div>
                        ) : (
                          <p className="text-gray-500">Aucune donnée détaillée disponible</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 my-8">Aucun produit en rupture ne correspond à votre recherche.</p>
      )}
    </CollapsibleSection>
  );
};

export default ProductBreakTable;