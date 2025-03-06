import React, { useState, useEffect } from "react";
import { FaSort, FaSortUp, FaSortDown, FaChevronRight, FaChevronUp } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { useFilterContext } from "@/contexts/FilterContext";
import SearchInput from "@/components/ui/inputs/SearchInput";
import DataBlock from "../global/DataBlock";
import { FaChevronDown } from "react-icons/fa"; // ✅ Import de l'icône flèche
import { AnimatePresence, motion } from "framer-motion";
import ProductSalesStockChart from "./ProductSalesStockChart";

interface ProductSalesData {
  code_13_ref: string;
  product_name: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  avg_selling_price: number;
  avg_purchase_price: number;
  avg_margin: number;
  part_ca_labo: number; // ✅ Part du produit sur le CA du labo
  part_marge_labo: number; // ✅ Part du produit sur la Marge du labo
  indice_rentabilite: number; // ✅ Indice de rentabilité
  type: "current" | "comparison";
  previous?: {
    total_quantity: number;
    revenue: number;
    margin: number;
    purchase_quantity: number;
    purchase_amount: number;
    avg_selling_price: number;
    avg_purchase_price: number;
    avg_margin: number;
    part_ca_labo: number;
    part_marge_labo: number;
    indice_rentabilite: number;
  };
}

const ProductTable: React.FC = () => {
  const { filters } = useFilterContext();
  const [products, setProducts] = useState<ProductSalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof ProductSalesData | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showUnitValues, setShowUnitValues] = useState<boolean>(false);
  const [sortedData, setSortedData] = useState<ProductSalesData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // 🔍 État pour la recherche

  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const [salesStockData, setSalesStockData] = useState<Record<string, ProductSalesStockData[]>>({});
  const [loadingStockData, setLoadingStockData] = useState<Record<string, boolean>>({});

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true); // ✅ Permet de masquer/afficher le tableau

  const toggleDetails = async (code_13_ref: string) => {
    setExpandedProduct((prev) => (prev === code_13_ref ? null : code_13_ref));
  
    // 📌 Si les données sont déjà chargées, ne pas refaire un appel API
    if (salesStockData[code_13_ref] || loadingStockData[code_13_ref]) return;
  
    setLoadingStockData((prev) => ({ ...prev, [code_13_ref]: true }));
  
    try {
      const response = await fetch("/api/sell-out/getProductSalesAndStock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_13_ref, pharmacies: filters.pharmacies }),
      });
  
      if (!response.ok) throw new Error("Erreur lors de la récupération des données de ventes/stocks.");
  
      const data = await response.json();
      setSalesStockData((prev) => ({ ...prev, [code_13_ref]: data.salesStockData }));
    } catch (error) {
      console.error("❌ Erreur API :", error);
    } finally {
      setLoadingStockData((prev) => ({ ...prev, [code_13_ref]: false }));
    }
  };

  // 📌 Récupération des données depuis l'API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const response = await fetch("/api/segmentation/getLabProducts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });
  
        if (!response.ok) throw new Error("Erreur lors de la récupération des produits");
  
        const data = await response.json();
  
        // Regroupement des données actuelles et comparatives
        const mergedProducts = data.products.reduce((acc: ProductSalesData[], product) => {
          if (product.type === "current") {
            const comparison = data.products.find(p => p.code_13_ref === product.code_13_ref && p.type === "comparison");
            acc.push({ ...product, previous: comparison });
          }
          return acc;
        }, []);
  
        setProducts(mergedProducts);
        setSortedData(mergedProducts);
      } catch (err) {
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, [filters]);

  // 📌 Tri des données à chaque changement de `sortColumn` ou `sortOrder`
  useEffect(() => {
    if (!sortColumn) {
      setSortedData(products);
      return;
    }

    setSortedData([...products].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (valA == null) valA = sortColumn === "product_name" ? "" : -Infinity;
      if (valB == null) valB = sortColumn === "product_name" ? "" : -Infinity;

      const isNumeric = [
        "total_quantity", "revenue", "margin", 
        "purchase_quantity", "purchase_amount", 
        "avg_selling_price", "avg_purchase_price", "avg_margin"
      ].includes(sortColumn);

      return isNumeric
        ? (sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA))
        : (sortOrder === "asc" 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA)));
    }));
  }, [sortColumn, sortOrder, products]);

  const filteredData = sortedData.filter((product) =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code_13_ref.includes(searchQuery)
  );

  // 📌 Gestion du tri des colonnes
  const toggleSort = (column: keyof ProductSalesData) => {
    setSortOrder(prev => (sortColumn === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortColumn(column);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-300 relative">
      {/* 📌 Titre */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        📊 Performances Produits
      </h2>
      
      {/* 📌 Bouton Toggle avec animation */}
<button
  onClick={() => setIsCollapsed((prev) => !prev)}
  className="absolute top-4 right-4 bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-blue-600 transition flex items-center gap-2"
>
  {isCollapsed ? "Afficher Produits" : "Masquer Produits"}{" "}
  {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
</button>

      {/* 📌 Toggle entre Totaux et Valeurs Unitaires */}
      
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
  {/* 🔍 Barre de recherche */}
  <div className="w-full md:w-2/3">
    <SearchInput
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Rechercher par Code 13 ou Nom..."
    />
  </div>

  {/* 🔄 Bouton pour switch entre Totaux & Unitaires */}
  <button
    onClick={() => setShowUnitValues((prev) => !prev)}
    className="bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:bg-blue-600 transition w-full md:w-auto"
  >
    {showUnitValues ? "Afficher Totaux" : "Afficher Valeurs Unitaires"}
  </button>
</div>

      {/* 🔹 Loader & Erreur */}
      {loading && <p className="text-gray-500 text-center">⏳ Chargement des données...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {/* 📌 Tableau des produits */}
     {/* 📌 Tableau des produits avec animation */}
<AnimatePresence>
  {!loading && !error && filteredData.length > 0 && !isCollapsed && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden border border-gray-200 shadow-lg rounded-lg"
    >
          <table className="w-full border-collapse rounded-lg table-auto">
            {/* 🔹 En-tête */}
            <thead>
    <tr className="bg-blue-500 text-white text-md rounded-lg">
    {[
      { key: "code_13_ref", label: "Code 13", width: "15%" },
      { key: "product_name", label: "Produit", width: "20%" },
      { key: "total_quantity", label: "Qte", width: "10%" },
      ...(showUnitValues
        ? [
            { key: "avg_selling_price", label: "Prix (€)", width: "15%" },
            { key: "avg_margin", label: "Marge (€)", width: "10%" },
            { key: "purchase_quantity", label: "Qte Achetée", width: "10%" },
            { key: "avg_purchase_price", label: "Achat (€)", width: "15%" },
          ]
        : [
            { key: "revenue", label: "CA (€)", width: "15%" },
            { key: "margin", label: "Marge (€)", width: "10%" },
            { key: "purchase_quantity", label: "Qte Achetée", width: "10%" },
            { key: "purchase_amount", label: "Achat (€)", width: "15%" },
          ]),
          { key: "indice_rentabilite", label: "Rentabilité", width: "10%" },
    ].map(({ key, label, width }) => (
      <th
        key={key}
        className="p-4 cursor-pointer transition hover:bg-blue-600"
        style={{ width }}
        onClick={() => toggleSort(key as keyof ProductSalesData)}
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

    {/* ✅ Colonne "Détails" placée EN DERNIER */}
      <th className="p-4 text-center">Détails</th>
      </tr>
    </thead>

            {/* 🔹 Contenu */}
            <tbody className="text-sm">
    {filteredData.map((product, index) => (
    <React.Fragment key={`${product.code_13_ref}-${index}`}>
      <tr className="border-b bg-gray-50 hover:bg-gray-200 transition text-center">
        {/* ✅ Code 13 (EAN) */}
        <td className="p-3">{product.code_13_ref}</td>

        {/* ✅ Nom du produit */}
        <td className="p-3">
          <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={product.product_name}>
            {product.product_name}
          </div>
        </td>

        {/* ✅ Quantité */}
        <td className="p-3">
          {formatLargeNumber(product.total_quantity, false)}
          {product.previous && (
            <span className="block text-xs text-gray-500">
              {getEvolution(product.total_quantity, product.previous.total_quantity)}
            </span>
          )}
        </td>

        {showUnitValues ? (
          <>
            <td className="p-3">
              {formatLargeNumber(product.avg_selling_price)}
              {product.previous && (
                <span className="block text-xs text-gray-500">
                  {getEvolution(product.avg_selling_price, product.previous.avg_selling_price)}
                </span>
              )}
            </td>
            <td className="p-3">
              {formatLargeNumber(product.avg_margin)}
              {product.previous && (
                <span className="block text-xs text-gray-500">
                  {getEvolution(product.avg_margin, product.previous.avg_margin)}
                </span>
              )}
            </td>
            <td className="p-3">
              {formatLargeNumber(product.purchase_quantity, false)}
              {product.previous && (
                <span className="block text-xs text-gray-500">
                  {getEvolution(product.purchase_quantity, product.previous.purchase_quantity)}
                </span>
              )}
            </td>
            <td className="p-3">
              {formatLargeNumber(product.avg_purchase_price)}
              {product.previous && (
                <span className="block text-xs text-gray-500">
                  {getEvolution(product.avg_purchase_price, product.previous.avg_purchase_price)}
                </span>
              )}
            </td>
          </>
        ) : (
          <>
            <td className="p-3">
              {formatLargeNumber(product.revenue)}
              {product.previous && (
                <span className="block text-xs text-gray-500">
                  {getEvolution(product.revenue, product.previous.revenue)}
                </span>
              )}
            </td>
            <td className="p-3">
              {formatLargeNumber(product.margin)}
              {product.previous && (
                <span className="block text-xs text-gray-500">
                  {getEvolution(product.margin, product.previous.margin)}
                </span>
              )}
            </td>
            <td className="p-3">
              {formatLargeNumber(product.purchase_quantity, false)}
              {product.previous && (
                <span className="block text-xs text-gray-500">
                  {getEvolution(product.purchase_quantity, product.previous.purchase_quantity)}
                </span>
              )}
            </td>
            <td className="p-3">
              {formatLargeNumber(product.purchase_amount)}
              {product.previous && (
                <span className="block text-xs text-gray-500">
                  {getEvolution(product.purchase_amount, product.previous.purchase_amount)}
                </span>
              )}
            </td>
          </>
        )}

            <td className="p-3">
              {formatLargeNumber(product.indice_rentabilite, false)}
              {product.previous && (
                <span className="block text-xs text-gray-500">
                  {getEvolution(product.indice_rentabilite, product.previous.indice_rentabilite)}
                </span>
              )}
            </td>

        {/* ✅ Colonne "Détails" placée EN DERNIER pour correspondre au thead */}
        <td className="p-3 text-center">
          <motion.button
            animate={{ rotate: expandedProduct === product.code_13_ref ? 90 : 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => toggleDetails(product.code_13_ref)}
            className="p-2 rounded-full bg-blue-600 flex items-center justify-center text-center"
          >
            <FaChevronRight className="text-white text-lg w-full" />
          </motion.button>
        </td>
      </tr>

      {/* ✅ Détails du produit (expandable) */}
      {expandedProduct === product.code_13_ref && (
        <tr>
          <td colSpan={showUnitValues ? 9 : 9} className="p-4 bg-blue-100 text-center text-blue-900">
            {/* 🔄 Loader en attendant l'affichage */}
            {loadingStockData[product.code_13_ref] && <p className="text-gray-500">Chargement des données...</p>}

            {/* 📊 Affichage du graphique seulement si les données sont disponibles */}
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
          
          </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default ProductTable;


const getEvolution = (current: number, previous?: number) => {
  if (previous === undefined || previous === null) return <span className="text-gray-500">N/A</span>;
  if (previous === 0) return current > 0 ? <span className="text-green-500">+100%</span> : <span className="text-gray-500">0%</span>;

  const percentage = ((current - previous) / previous) * 100;
  const isPositive = percentage >= 0;

  return (
    <span className={isPositive ? "text-green-500" : "text-red-500"}>
      {isNaN(percentage) || !isFinite(percentage) ? "0%" : (isPositive ? "+" : "") + percentage.toFixed(1) + "%"}
    </span>
  );
};