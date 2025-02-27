import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle, FaChartLine, FaMoneyBillWave, FaBoxOpen } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface StockBreakData {
  month: string;
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
}

interface StockBreakDataMonthlyProps {
  stockBreakData: StockBreakData[];
  loading: boolean;
  error: string | null;
}

const StockBreakDataMonthly: React.FC<StockBreakDataMonthlyProps> = ({ stockBreakData, loading, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof StockBreakData | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 📌 Fonction de tri des colonnes
  const toggleSort = (column: keyof StockBreakData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // 📌 Tri des données en fonction de la colonne sélectionnée
  const sortedData = [...stockBreakData].sort((a, b) => {
    if (!sortColumn) return 0;

    let valA = a[sortColumn] ?? 0;
    let valB = b[sortColumn] ?? 0;

    // 🔹 Conversion en nombre pour éviter un tri alphabétique
    valA = typeof valA === "string" ? parseFloat(valA.replace(/[^0-9.-]+/g, "")) : valA;
    valB = typeof valB === "string" ? parseFloat(valB.replace(/[^0-9.-]+/g, "")) : valB;

    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 relative">
      {/* 📌 Bouton de toggle */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md hover:bg-red-600 transition flex items-center"
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"}
        {isCollapsed ? <FaChevronDown className="ml-2" /> : <FaChevronUp className="ml-2" />}
      </button>

      {/* 📌 Titre */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">📅 Détails Mensuels des Ruptures</h2>

      {/* 📌 Contenu animé */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* 🔹 Loader & Erreur */}
            {loading && <p className="text-gray-500 text-center">Chargement des données...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* 📌 Tableau des données */}
            {!loading && !error && stockBreakData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  {/* 🔹 En-tête du tableau */}
                  <thead>
                    <tr className="bg-red-100 text-red-900">
                      <th className={`p-3 cursor-pointer ${sortColumn === "month" ? "bg-red-300 text-white" : ""}`} onClick={() => toggleSort("month")}>
                        <div className="flex items-center gap-2">
                          Mois {sortColumn === "month" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div> 
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "total_products_ordered" ? "bg-red-300 text-white" : ""}`} onClick={() => toggleSort("total_products_ordered")}>
                        <div className="flex items-center gap-2">
                          Produits Commandés {sortColumn === "total_products_ordered" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "stock_break_products" ? "bg-red-300 text-white" : ""}`} onClick={() => toggleSort("stock_break_products")}>
                        <div className="flex items-center gap-2">
                          Produits en Rupture {sortColumn === "stock_break_products" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "stock_break_rate" ? "bg-red-300 text-white" : ""}`} onClick={() => toggleSort("stock_break_rate")}>
                        <div className="flex items-center gap-2">
                          Taux de Rupture {sortColumn === "stock_break_rate" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "stock_break_amount" ? "bg-red-300 text-white" : ""}`} onClick={() => toggleSort("stock_break_amount")}>
                        <div className="flex items-center gap-2">
                          Montant des Ruptures (€) {sortColumn === "stock_break_amount" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  
                  {/* 🔹 Contenu du tableau */}
                  <tbody>
                    {sortedData.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-red-50 text-center">
                        <td className="p-3">{data.month}</td>
                        <td className="p-3">{formatLargeNumber(data.total_products_ordered, false)}</td>
                        <td className="p-3">{formatLargeNumber(data.stock_break_products, false)}</td>
                        <td className="p-3">{formatLargeNumber(data.stock_break_rate, false)}%</td>
                        <td className="p-3">{formatLargeNumber(data.stock_break_amount, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 🔹 Message si pas de données */}
            {!loading && !error && stockBreakData.length === 0 && (
              <p className="text-gray-500 text-center col-span-2">Aucune donnée disponible.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockBreakDataMonthly;