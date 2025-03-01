import React, { useState, useEffect, useMemo } from "react";
import { FaChevronRight, FaSort, FaTag, FaWarehouse } from "react-icons/fa";
import { motion } from "framer-motion";
import Loader from "@/components/ui/Loader"; // 🟢 Assure-toi que le chemin est correct
import { useFilterContext } from "@/contexts/FilterContext";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import ProductSalesStockChart from "@/components/laboratory/product/ProductSalesStockChart";
import { FaChevronDown } from "react-icons/fa";
import SalesDataComponent from "../global/sales/SalesDataComponent";

interface Product {
  code_13_ref: string;
  name: string;
  avg_sale_price: number;
  min_sale_price: number;
  max_sale_price: number;
  avg_purchase_price: number;
  avg_margin: number;
  pharmacies_in_stock: number;
  total_quantity_sold: number;
  revenue_share: number;  // ✅ Ajouté pour le calcul de l'indice
  margin_share: number;   // ✅ Ajouté pour le calcul de l'indice
  rentability_index: number; // ✅ Nouvelle propriété
}



const ProductTable: React.FC = () => {
    const { filters } = useFilterContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTotalMode, setIsTotalMode] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Product | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  // 🔹 États pour stocker les ventes mensuelles, le chargement et les erreurs
  const [productSalesStock, setProductSalesStock] = useState<{ month: string; total_quantity_sold: number; avg_stock_quantity: number }[]>([]);
  const [salesStockLoading, setSalesStockLoading] = useState<boolean>(false);
  const [salesStockError, setSalesStockError] = useState<string | null>(null);
  const hasSelectedData =
  filters.distributors.length > 0 ||
  filters.brands.length > 0 ||
  filters.universes.length > 0 ||
  filters.categories.length > 0 ||
  filters.families.length > 0 ||
  filters.specificities.length > 0;
  // 📌 Traduction des colonnes
  const columnHeaders: { [key in keyof Product]: string } = {
    code_13_ref: "Ean",
    name: "Nom",
    avg_sale_price: "Prix de Vente(€)",
    min_sale_price: "Prix Min(€)",
    max_sale_price: "Prix Max(€)",
    avg_purchase_price: "Prix d'Achat(€)",
    avg_margin: "Marge(€)",
    pharmacies_in_stock: "Pharmacies",
    total_quantity_sold: "Quantité",
    revenue_share: "Part CA (%)",
    margin_share: "Part Marge (%)",
    rentability_index: "Indice Rentabilité", // ✅ Ajout
  };

  // 🚀 **Appel API pour récupérer les données**
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/segmentation/getLabProducts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }), // 🔹 Mettre ici les vrais filtres
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des produits");

        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    };

    // 🚀 **Fetch des ventes mensuelles d'un produit**

    fetchProducts();
  }, [filters]);

  const fetchProductSalesAndStock = async (code_13_ref: string) => {
    try {
        setSalesStockLoading(true);
        setSalesStockError(null);

        const response = await fetch("/api/sell-out/getProductSalesAndStock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code_13_ref, pharmacies: filters.pharmacies.length > 0 ? filters.pharmacies : null }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des ventes et stocks");

        const data = await response.json();

        // 🔹 Mise à jour avec stock_break_quantity inclus
        setProductSalesStock(data.salesStockData.map((item: any) => ({
            month: item.month,
            total_quantity_sold: item.total_quantity_sold,
            avg_stock_quantity: item.avg_stock_quantity,
            stock_break_quantity: item.stock_break_quantity, // ✅ Ajout des ruptures
        })));
    } catch (err) {
        setSalesStockError("Impossible de charger les données");
    } finally {
        setSalesStockLoading(false);
    }
};

  // 🔽🔼 Fonction de tri
  const toggleSort = (column: keyof Product) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // 🔍 **Filtrage et tri des produits**
  const filteredProducts = useMemo(() => {
    let sorted = products
      .map(product => ({
        ...product,
        rentability_index: product.margin_share - product.revenue_share, // ✅ Calcul dynamique de l'indice
      }))
      .filter(
        (p) =>
          (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code_13_ref.includes(searchQuery)) &&
          p.total_quantity_sold > 0 // Filtrer les produits avec 0 ventes si nécessaire
      );
  
    if (sortColumn) {
      sorted = sorted.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
  
        if (typeof valA === "string") valA = parseFloat(valA);
        if (typeof valB === "string") valB = parseFloat(valB);
  
        // ✅ Cas spécial pour "Indice Rentabilité"
        if (sortColumn === "rentability_index") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
  
        // ✅ Cas spécial pour "Marge (€)"
        if (sortColumn === "avg_margin") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
  
        // 🔢 Si c'est un nombre, trier numériquement
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
  
        // 🔤 Sinon, trier alphabétiquement (nom, EAN...)
        return sortOrder === "asc"
          ? String(a[sortColumn]).localeCompare(String(b[sortColumn]))
          : String(b[sortColumn]).localeCompare(String(a[sortColumn]));
      });
    }
  
    return sorted;
  }, [searchQuery, sortColumn, sortOrder, products]);

// 🟢 **Calcul des valeurs unitaires ou totales**
const getValue = (product: Product, field: keyof Product) => {
    const value = product[field] as number;

    if (field === "avg_margin") {
        // ✅ Correction : recalcul du pourcentage de marge avec gestion de NaN
        const marginPercentage = (product.avg_sale_price > 0) 
            ? ((product.avg_margin / product.avg_sale_price) * 100) 
            : "0.00";
        return formatLargeNumber(marginPercentage, false);
    }

    return isTotalMode ? formatLargeNumber(value * product.total_quantity_sold) : formatLargeNumber(value);
};

  // 📌 **Toggle détails du produit**
  const toggleDetails = (code: string) => {
    if (expandedProduct === code) {
        setExpandedProduct(null);
        setProductSalesStock([]); // 🔹 Réinitialise les ventes et stocks
    } else {
        setExpandedProduct(code);
        fetchProductSalesAndStock(code); // 🔹 Appel unique pour récupérer ventes + stock
    }
};

if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;

  return (
    <div className="max-w-8xl mx-auto p-8 space-y-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-4xl font-extrabold text-teal-600 tracking-wide flex items-center justify-center gap-3">
          <span className="text-yellow-500">📊</span> Suivi des Performances Commerciales
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Analyse des ventes, marges et prévisions pour une gestion optimale 📈
        </p>
      </motion.div>

      {/* 📊 Section des données de ventes */}
      <SalesDataComponent />

      <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-teal-300">
        {/* 🔍 Barre de recherche et mode total */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou code..."
            className="w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setIsTotalMode(!isTotalMode)}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            {isTotalMode ? "Valeurs Unitaires" : "Totaux"}
          </button>
        </div>

        {/* 🚀 **Affichage du Loader ou de l'erreur** */}
        {loading && <Loader message="Chargement des produits..." />}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* 📊 Tableau */}
        {!loading && !error && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-teal-100 text-teal-900">
                {["code_13_ref", "name", "avg_sale_price", "avg_purchase_price", "avg_margin", "total_quantity_sold"].map(
                  (col) => (
                    <th key={col} className="p-3 cursor-pointer" onClick={() => toggleSort(col as keyof Product)}>
                      {columnHeaders[col as keyof Product]} <FaSort className="inline-block ml-1" />
                    </th>
                  )
                )}
                <th className="p-3 cursor-pointer" onClick={() => toggleSort("rentability_index")}>
                  Indice Rentabilité <FaSort className="inline-block ml-1" />
                </th>
                <th className="p-3">Détails</th>
              </tr>
            </thead>
            <tbody>
    {filteredProducts.map((product) => {
      const rentabilityIndex = product.margin_share - product.revenue_share; // 🔥 Calcul de l'indice de rentabilité

      return (
        <React.Fragment key={product.code_13_ref}>
          <tr className="border-b hover:bg-teal-50">
            <td className="p-3 text-center">{product.code_13_ref}</td>
            <td className="p-3">{product.name}</td>
            <td className="p-3 text-center">{getValue(product, "avg_sale_price")}</td>
            <td className="p-3 text-center">{getValue(product, "avg_purchase_price")}</td>
            <td className="p-3 text-center">{getValue(product, "avg_margin")}%</td>
            <td className="p-3 text-center">{formatLargeNumber(product.total_quantity_sold, false)}</td>
            
            {/* 🔥 Nouvelle colonne pour l'Indice de Rentabilité */}
            <td className="p-3 text-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  rentabilityIndex > 0 ? "bg-green-400 text-white" 
                  : rentabilityIndex < 0 ? "bg-red-400 text-white" 
                  : "bg-gray-300 text-gray-700"
                }`}
              >
                {rentabilityIndex > 0 ? "+" : ""}
                {rentabilityIndex.toFixed(2)}%
              </span>
            </td>

            <td className="p-3 text-center">
              <motion.button
                animate={{ rotate: expandedProduct === product.code_13_ref ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => toggleDetails(product.code_13_ref)}
                className="p-2 rounded-full bg-teal-600 flex items-center justify-center text-center"
              >
                <FaChevronRight className="text-white text-lg w-full" />
              </motion.button>
            </td>
          </tr>

          {/* 🔽 Fiche Détails améliorée */}
          {expandedProduct === product.code_13_ref && (
            <tr>
              <td colSpan={8} className="p-4 bg-teal-100 shadow-md">
                <motion.div className="flex w-full flex-col items-center justify-between text-teal-900">
                  <div className="flex items-center gap-2 w-full justify-between text-teal-900 p-2">
                      <p className="flex items-center justify-center gap-2"><FaTag/><strong>Prix Min :</strong> {product.min_sale_price} €</p>
                      <p className="flex items-center justify-center gap-2"><FaTag/><strong>Prix Max :</strong> {product.max_sale_price} €</p>
                      <p className="flex items-center justify-center gap-2"><FaWarehouse/><strong>Pharmacies en Stock :</strong> {product.pharmacies_in_stock}</p>
                      <p className="flex items-center justify-center gap-2 font-bold">
                        <FaTag/><strong>Part du CA :</strong> {product.revenue_share}%
                      </p>
                      <p className="flex items-center justify-center gap-2 font-bold">
                        <FaTag/><strong>Part de la Marge :</strong> {product.margin_share}%
                      </p>
                  </div>
                  {/* 📊 Section des ventes mensuelles */}
                  {!salesStockLoading && !salesStockError && (
                      <ProductSalesStockChart salesStockData={productSalesStock} />
                  )}
                </motion.div>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })}
  </tbody>
          </table>
        )}
      </div>
    </div>
    
  );
};

export default ProductTable;