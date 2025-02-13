import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaChevronDown,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExchangeAlt,
} from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  code_13_ref: string;
  name: string;
  tva_percentage: number;
  avg_price_with_tax: number | null;
  avg_weighted_price: number | null;
  margin: number | null;
  margin_percentage: number | null;
  min_price_with_tax: number | null;
  max_price_with_tax: number | null;
  total_sales_quantity: number | null;
}

const CatalogProductsOld: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"unit" | "total">("unit");

  useEffect(() => {
    if (!hasSelectedLabs) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/segmentation/getCatalogue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Échec du fetch des produits");

        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError("Impossible de récupérer les produits");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  if (!hasSelectedLabs) {
    return <p className="text-gray-500 text-center mt-4">Sélectionnez un laboratoire pour voir le catalogue.</p>;
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code_13_ref.includes(searchTerm)
  );

  // 📌 Fonction de tri dynamique
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = (a as any)[sortColumn] ?? 0;
    const bValue = (b as any)[sortColumn] ?? 0;

    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn === column) {
      return sortOrder === "asc" ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
    }
    return <FaSort className="ml-1 text-gray-400" />;
  };

  // ✅ Fonction pour gérer l'affichage des détails
  const toggleRow = (code_13_ref: string) => {
    setExpandedRows((prev) => ({ ...prev, [code_13_ref]: !prev[code_13_ref] }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 🔎 Barre de recherche & Mode d'affichage */}
      <div className="flex justify-between items-center">
        <div className="relative max-w-lg">
          <div className="p-3 border border-gray-300 flex items-center bg-gray-100 rounded-lg shadow-sm">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="bg-transparent outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 📌 Bouton pour switcher entre affichage unitaire et total */}
        <button
          onClick={() => setViewMode(viewMode === "unit" ? "total" : "unit")}
          className="p-3 bg-blue-500 text-white rounded-lg flex items-center shadow-md hover:bg-blue-600 transition"
        >
          <FaExchangeAlt className="mr-2" />
          {viewMode === "unit" ? "Afficher les Totaux" : "Afficher les Unitaires"}
        </button>
      </div>

      {/* 📦 Tableau des produits */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              {[
                { key: "code_13_ref", label: "Réf" },
                { key: "name", label: "Nom" },
                { key: "avg_price_with_tax", label: viewMode === "unit" ? "Prix Vente Moy." : "CA Total" },
                { key: "avg_weighted_price", label: viewMode === "unit" ? "Prix Achat Moy." : "Achat Total" },
                { key: "margin", label: viewMode === "unit" ? "Marge Moyenne" : "Marge Totale" },
                { key: "total_sales_quantity", label: "Volume" }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="py-3 px-4 text-left cursor-pointer select-none"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center">
                    {label}
                    {getSortIcon(key)}
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-center">Détails</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => (
              <React.Fragment key={product.code_13_ref}>
                <tr className="border-b">
                  <td className="py-3 px-4">{product.code_13_ref}</td>
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">
                    {viewMode === "unit"
                      ? product.avg_price_with_tax
                        ? `${product.avg_price_with_tax} €`
                        : "N/A"
                      : product.total_sales_quantity && product.avg_price_with_tax
                      ? `${(product.total_sales_quantity * product.avg_price_with_tax).toFixed(2)} €`
                      : "N/A"}
                  </td>

                  <td className="py-3 px-4">
                    {viewMode === "unit"
                      ? product.avg_weighted_price
                        ? `${product.avg_weighted_price} €`
                        : "N/A"
                      : product.total_sales_quantity && product.avg_weighted_price
                      ? `${(product.total_sales_quantity * product.avg_weighted_price).toFixed(2)} €`
                      : "N/A"}
                  </td>

                  <td className="py-3 px-4">
                    {viewMode === "unit"
                      ? product.margin
                        ? `${product.margin} €`
                        : "N/A"
                      : product.total_sales_quantity && product.margin
                      ? `${(product.total_sales_quantity * product.margin).toFixed(2)} €`
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-center">{product.total_sales_quantity ?? "0"}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => toggleRow(product.code_13_ref)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition">
                      {expandedRows[product.code_13_ref] ? <FaChevronDown /> : <FaChevronRight />}
                    </button>
                  </td>
                </tr>

                {/* 🔽 Détails */}
                <AnimatePresence>
                  {expandedRows[product.code_13_ref] && (
                    <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-b">
                      <td colSpan={6} className="p-4">
                        <div className="flex items-center gap-8 text-sm text-gray-700">
                          <div className="flex items-center gap-4"><span className="font-medium">Prix Min :</span><span className="text-green-500">{product.min_price_with_tax ? `${product.min_price_with_tax} €` : "N/A"}</span></div>
                          <div className="flex items-center gap-4"><span className="font-medium">Prix Max :</span><span className="text-red-500">{product.max_price_with_tax ? `${product.max_price_with_tax} €` : "N/A"}</span></div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogProductsOld;