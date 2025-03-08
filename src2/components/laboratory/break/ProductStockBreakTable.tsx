import React, { useState, useEffect, useMemo } from "react";
import { FaSort, FaChevronRight } from "react-icons/fa";
import Loader from "@/components/ui/Loader"; 
import { useFilterContext } from "@/contexts/FilterContext";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import StockBreakDataComponent from "../../../../src/components/features/stock-break/StockBreakDataComponent";
import { motion } from "framer-motion";
import ProductBreakChart from "../../../../src/components/common/charts/BreakChart";

interface ProductStockBreak {
  code_13_ref: string;
  name: string;
  total_quantity_sold: number;
  total_orders: number;
  total_quantity_ordered: number;
  total_stock_break_quantity: number;
  total_stock_break_amount: number;
}

const ProductStockBreakTable: React.FC = () => {
  const { filters } = useFilterContext();
  const [ruptures, setRuptures] = useState<ProductStockBreak[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof ProductStockBreak | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [productBreakData, setProductBreakData] = useState<{ 
    [key: string]: { 
      month: string; 
      total_quantity_sold: number; 
      total_quantity_ordered: number; 
      total_stock_break_quantity: number; 
      total_stock_break_amount: number; 
      
    }[] 
  }>({});
  const hasSelectedData =
  filters.distributors.length > 0 ||
  filters.brands.length > 0 ||
  filters.universes.length > 0 ||
  filters.categories.length > 0 ||
  filters.families.length > 0 ||
  filters.specificities.length > 0;

  // 📌 Traduction des colonnes
  const columnHeaders: { [key in keyof ProductStockBreak]: string } = {
    code_13_ref: "EAN",
    name: "Nom du Produit",
    total_quantity_sold: "Quantité Vendue",
    total_orders: "Commandes",
    total_quantity_ordered: "Quantité Commandée",
    total_stock_break_quantity: "Rupture (Qté)",
    total_stock_break_amount: "Rupture (€)"
  };

  // 🚀 **Appel API pour récupérer les données**
  useEffect(() => {
    const fetchStockBreaks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/segmentation/getProductBreaksByLab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });
  
        if (!response.ok) throw new Error("Erreur lors de la récupération des ruptures");
  
        const data = await response.json();
  
        // 🔹 Regroupement des ruptures par produit
        const aggregatedData = data.ruptures.reduce((acc: Record<string, ProductStockBreak>, rupture: ProductStockBreak) => {
          const ean = rupture.code_13_ref;
  
          if (!acc[ean]) {
            acc[ean] = {
              code_13_ref: ean,
              name: rupture.name,
              total_quantity_sold: Number(rupture.total_quantity_sold) || 0,
              total_orders: Number(rupture.total_orders) || 0,
              total_quantity_ordered: Number(rupture.total_quantity_ordered) || 0,
              total_stock_break_quantity: Number(rupture.total_stock_break_quantity) || 0,
              total_stock_break_amount: Number(rupture.total_stock_break_amount) || 0,
            };
          } else {
            acc[ean].total_quantity_sold += Number(rupture.total_quantity_sold) || 0;
            acc[ean].total_orders += Number(rupture.total_orders) || 0;
            acc[ean].total_quantity_ordered += Number(rupture.total_quantity_ordered) || 0;
            acc[ean].total_stock_break_quantity += Number(rupture.total_stock_break_quantity) || 0;
            acc[ean].total_stock_break_amount += Number(rupture.total_stock_break_amount) || 0;
          }
  
          return acc;
        }, {});
  
        // 🔹 Stockage des données pour le graphique des ruptures
        const breakDataByProduct = data.ruptures.reduce((acc: any, item: any) => {
          if (!acc[item.code_13_ref]) acc[item.code_13_ref] = [];
          acc[item.code_13_ref].push({
            month: item.month,
            total_quantity_sold: item.total_quantity_sold,
            total_quantity_ordered: item.total_quantity_ordered,
            total_stock_break_quantity: item.total_stock_break_quantity,
            total_stock_break_amount: item.total_stock_break_amount,
          });
          return acc;
        }, {});
  
        setRuptures(Object.values(aggregatedData));
        setProductBreakData(breakDataByProduct); // ✅ Stocke les données pour les graphiques
  
      } catch (err) {
        setError("Impossible de charger les ruptures");
      } finally {
        setLoading(false);
      }
    };
  
    fetchStockBreaks();
  }, [filters]);

  // 🔽🔼 Fonction de tri
  const toggleSort = (column: keyof ProductStockBreak) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // 🔍 **Filtrage et tri des produits**
  const filteredRuptures = useMemo(() => {
    let sorted = ruptures.filter(
      (p) => p.code_13_ref.includes(searchQuery) || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn) {
      sorted = sorted.sort((a, b) => {
        let valA = a[sortColumn] as number | string;
        let valB = b[sortColumn] as number | string;

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }

    return sorted;
  }, [searchQuery, sortColumn, sortOrder, ruptures]);

  // 📌 **Toggle détails du produit**
  const toggleDetails = (code: string) => {
    setExpandedProduct(expandedProduct === code ? null : code);
  };

  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;

  return (
    <div className="max-w-8xl mx-auto p-8 space-y-16">
      <StockBreakDataComponent />

      <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-teal-300">
        {/* 🔍 Barre de recherche */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="🔍 Rechercher par EAN ou Nom..."
            className="w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading && <Loader message="Chargement des ruptures..." />}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-teal-100 text-teal-900">
                {Object.keys(columnHeaders).map((col) => (
                  <th key={col} className="p-3 cursor-pointer" onClick={() => toggleSort(col as keyof ProductStockBreak)}>
                    {columnHeaders[col as keyof ProductStockBreak]} <FaSort className="inline-block ml-1" />
                  </th>
                ))}
                <th className="p-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuptures.map((rupture) => (
                <React.Fragment key={rupture.code_13_ref}>
                  <tr className="border-b hover:bg-teal-50">
                    <td className="p-3 text-center">{rupture.code_13_ref}</td>
                    <td className="p-3">{rupture.name}</td>
                    <td className="p-3 text-center">{formatLargeNumber(rupture.total_quantity_sold, false)}</td>
                    <td className="p-3 text-center">{rupture.total_orders}</td>
                    <td className="p-3 text-center">{formatLargeNumber(rupture.total_quantity_ordered, false)}</td>
                    <td className="p-3 text-center">{formatLargeNumber(rupture.total_stock_break_quantity, false)}</td>
                    <td className="p-3 text-center text-red-600 font-bold">{formatLargeNumber(rupture.total_stock_break_amount)}</td>
                    <td className="p-3 text-center">
                      <motion.button
                        animate={{ rotate: expandedProduct === rupture.code_13_ref ? 90 : 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => toggleDetails(rupture.code_13_ref)}
                        className="p-2 rounded-full bg-teal-600 flex items-center justify-center"
                      >
                        <FaChevronRight className="text-white text-lg" />
                      </motion.button>
                    </td>
                  </tr>
                  {expandedProduct === rupture.code_13_ref && (
                    <tr className="bg-gray-100">
                      <td colSpan={8} className="p-4">
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="bg-white shadow-md rounded-lg p-4 border border-gray-300"
                        >
                          <h3 className="text-lg font-bold text-teal-700">📊 Détails des Ruptures</h3>

                          {/* 📊 Intégration du graphique */}
                          {productBreakData[rupture.code_13_ref] && productBreakData[rupture.code_13_ref].length > 0 ? (
                            <ProductBreakChart breakData={productBreakData[rupture.code_13_ref]} />
                          ) : (
                            <p className="text-gray-500 text-center">Aucune donnée disponible.</p>
                          )}
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductStockBreakTable;