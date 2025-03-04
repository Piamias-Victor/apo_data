import React, { useState, useEffect } from "react";
import { FaSort, FaSortUp, FaSortDown, FaChevronRight } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { motion } from "framer-motion";
import ProductSalesStockChart from "../product/ProductSalesStockChart";

interface ProductStockBreakData {
  code_13_ref: string;
  product_name: string;
  total_products_ordered: number;  // 📦 Produits commandés
  stock_break_products: number;    // ❌ Produits en rupture
  stock_break_rate: number;        // 📊 Taux de rupture (%)
  stock_break_amount: number;      // 💰 Montant des ruptures (€)
  previous?: {
    total_products_ordered: number;
    stock_break_products: number;
    stock_break_rate: number;
    stock_break_amount: number;
  };
}

interface ProductSalesStockData {
  month: string;
  total_quantity_sold: number;
  avg_stock_quantity: number;
  stock_break_quantity: number;
}

const calculateEvolution = (oldValue: number | string | undefined, newValue: number | string): JSX.Element => {
    const oldNum = oldValue !== undefined ? parseFloat(oldValue as string) : undefined;
    const newNum = parseFloat(newValue as string);
  
    if (oldNum === undefined || isNaN(oldNum)) return <span className="text-gray-500">N/A</span>;
    if (oldNum === 0) return newNum > 0 ? <span className="text-green-500">+100%</span> : <span className="text-gray-500">0%</span>;
    if (!Number.isFinite(oldNum) || !Number.isFinite(newNum)) return <span className="text-gray-500">N/A</span>;
  
    const change = ((newNum - oldNum) / Math.abs(oldNum)) * 100;
    const isPositive = change >= 0;
  
    return (
      <span className={isPositive ? "text-green-500" : "text-red-500"}>
        {isPositive ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    );
  };

const ProductBreakTable: React.FC<{ products: ProductStockBreakData[] }> = ({ products }) => {
  const [sortColumn, setSortColumn] = useState<keyof ProductStockBreakData | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>(""); // 🔍 Recherche
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [sortedData, setSortedData] = useState<ProductStockBreakData[]>([]);
  const [salesStockData, setSalesStockData] = useState<Record<string, ProductSalesStockData[]>>({});
  const [loadingStockData, setLoadingStockData] = useState<Record<string, boolean>>({});

  // 📌 Fetch des données de stock et de rupture
  const toggleDetails = async (code_13_ref: string) => {
    setExpandedProduct((prev) => (prev === code_13_ref ? null : code_13_ref));

    // 📌 Si les données sont déjà chargées, ne pas refaire un appel API
    if (salesStockData[code_13_ref] || loadingStockData[code_13_ref]) return;

    setLoadingStockData((prev) => ({ ...prev, [code_13_ref]: true }));

    try {
      const response = await fetch("/api/sell-out/getProductSalesAndStock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_13_ref }),
      });

      if (!response.ok) throw new Error("Erreur lors de la récupération des données.");

      const data = await response.json();
      setSalesStockData((prev) => ({ ...prev, [code_13_ref]: data.salesStockData }));
    } catch (error) {
      console.error("❌ Erreur API :", error);
    } finally {
      setLoadingStockData((prev) => ({ ...prev, [code_13_ref]: false }));
    }
  };

  // 📌 Tri des produits
  useEffect(() => {
    if (!sortColumn) {
      setSortedData(products);
      return;
    }

    setSortedData([...products].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (valA == null) valA = -Infinity;
      if (valB == null) valB = -Infinity;

      return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    }));
  }, [sortColumn, sortOrder, products]);

  // 📌 Filtrage des produits (recherche)
  const filteredData = sortedData.filter((product) =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code_13_ref.includes(searchQuery)
  );

  // 📌 Fonction pour trier les colonnes
  const toggleSort = (column: keyof ProductStockBreakData) => {
    setSortOrder(prev => (sortColumn === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortColumn(column);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-red-300 relative">
      {/* 📌 Titre */}
      <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
        🚨 Suivi des Produits en Rupture
      </h2>

      {/* 🔍 Barre de recherche */}
      <div className="mb-6 w-full md:w-2/3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher par Code 13 ou Nom..."
        />
      </div>

      {/* 📌 Tableau des produits en rupture */}
      {filteredData.length > 0 && (
        <div className="overflow-hidden border border-red-300 shadow-lg rounded-lg">
          <table className="w-full border-collapse rounded-lg table-auto">
            <thead>
              <tr className="bg-red-500 text-white text-md rounded-lg">
                {[
                  { key: "code_13_ref", label: "Code 13", width: "10%" },
                  { key: "product_name", label: "Produit", width: "25%" },
                  { key: "total_products_ordered", label: "Commandé", width: "10%" },
                  { key: "stock_break_products", label: "Qte Rupture", width: "10%" },
                  { key: "stock_break_rate", label: "Taux Rupture (%)", width: "10%" },
                  { key: "stock_break_amount", label: "Montant Rupture (€)", width: "10%" },
                ].map(({ key, label, width }) => (
                  <th
                    key={key}
                    className="p-4 cursor-pointer transition hover:bg-red-600"
                    style={{ width }}
                    onClick={() => toggleSort(key as keyof ProductStockBreakData)}
                  >
                    <div className="flex justify-center items-center gap-2">
                      {label}
                      {sortColumn === key ? (
                        sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />
                      ) : (
                        <FaSort />
                      )}
                    </div>
                  </th>
                ))}

                {/* ✅ Colonne "Détails" */}
                <th className="p-4 text-center">Détails</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((product, index) => (
                <React.Fragment key={`${product.code_13_ref}-${index}`}>
                  <tr className="border-b bg-gray-50 hover:bg-gray-200 transition text-center">
                    <td className="p-3">{product.code_13_ref}</td>
                    <td className="p-3">{product.product_name}</td>
                    <td className="p-3">
  {formatLargeNumber(parseFloat(product.total_products_ordered), false)}
  {product.previous?.total_products_ordered !== undefined && (
    <span className="block text-xs text-gray-500">
      {calculateEvolution(parseFloat(product.previous.total_products_ordered), parseFloat(product.total_products_ordered))}
    </span>
  )}
</td>
                    <td className="p-3">
  {formatLargeNumber(parseFloat(product.stock_break_products), false)}
  {product.previous?.stock_break_products !== undefined && (
    <span className="block text-xs text-gray-500">
      {calculateEvolution(parseFloat(product.previous.stock_break_products), parseFloat(product.stock_break_products))}
    </span>
  )}
</td>

<td className="p-3">
  {formatLargeNumber(parseFloat(product.stock_break_rate))}%
  {product.previous?.stock_break_rate !== undefined && (
    <span className="block text-xs text-gray-500">
      {calculateEvolution(parseFloat(product.previous.stock_break_rate), parseFloat(product.stock_break_rate))}
    </span>
  )}
</td>

<td className="p-3">
  {formatLargeNumber(parseFloat(product.stock_break_amount))}
  {product.previous?.stock_break_amount !== undefined && (
    <span className="block text-xs text-gray-500">
      {calculateEvolution(parseFloat(product.previous.stock_break_amount), parseFloat(product.stock_break_amount))}
    </span>
  )}
</td>

                    {/* ✅ Colonne "Détails" */}
                    <td className="p-3 text-center">
                      <motion.button
                        animate={{ rotate: expandedProduct === product.code_13_ref ? 90 : 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => toggleDetails(product.code_13_ref)}
                        className="p-2 rounded-full bg-red-600 flex items-center justify-center text-center"
                      >
                        <FaChevronRight className="text-white text-lg w-full" />
                      </motion.button>
                    </td>
                  </tr>

                  {/* ✅ Détails du produit */}
                  {expandedProduct === product.code_13_ref && (
                    <tr>
                      <td colSpan={7} className="p-4 bg-red-100 text-center text-red-900">
                        {loadingStockData[product.code_13_ref] && <p className="text-gray-500">Chargement des données...</p>}

                        {salesStockData[product.code_13_ref] && (
                          <ProductSalesStockChart salesStockData={salesStockData[product.code_13_ref]} />
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
    </div>
  );
};

export default ProductBreakTable;