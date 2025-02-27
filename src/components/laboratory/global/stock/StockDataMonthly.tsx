import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown, FaChartPie, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface StockSalesData {
  month: string;
  total_avg_stock: number;
  total_stock_value: number;
  total_quantity: number;
  total_revenue: number;
}

interface StockDataMonthlyProps {
  stockData: StockSalesData[];
  loading: boolean;
  error: string | null;
}

const StockDataMonthly: React.FC<StockDataMonthlyProps> = ({ stockData, loading, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof StockSalesData | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 📌 Fonction de tri des colonnes
  const toggleSort = (column: keyof StockSalesData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // 📌 Tri des données en fonction de la colonne sélectionnée
  const sortedData = [...stockData].sort((a, b) => {
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
        className="absolute top-4 right-4 bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md hover:bg-indigo-600 transition flex items-center"
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"}
        {isCollapsed ? <FaChevronDown className="ml-2" /> : <FaChevronUp className="ml-2" />}
      </button>

      {/* 📌 Titre */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">📅 Détails Mensuels du Stock</h2>

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
            {!loading && !error && stockData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  {/* 🔹 En-tête du tableau */}
                  <thead>
                    <tr className="bg-indigo-100 text-indigo-900">
                      <th className={`p-3 cursor-pointer ${sortColumn === "month" ? "bg-indigo-300 text-white" : ""}`} onClick={() => toggleSort("month")}>
                        <div className="flex items-center gap-2">
                          Mois {sortColumn === "month" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "total_avg_stock" ? "bg-indigo-300 text-white" : ""}`} onClick={() => toggleSort("total_avg_stock")}>
                        <div className="flex items-center gap-2">
                          Stock Moyen {sortColumn === "total_avg_stock" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "total_stock_value" ? "bg-indigo-300 text-white" : ""}`} onClick={() => toggleSort("total_stock_value")}>
                        <div className="flex items-center gap-2">
                          Valeur du Stock (€) {sortColumn === "total_stock_value" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "total_quantity" ? "bg-indigo-300 text-white" : ""}`} onClick={() => toggleSort("total_quantity")}>
                        <div className="flex items-center gap-2">
                          Quantité Vendue {sortColumn === "total_quantity" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "total_revenue" ? "bg-indigo-300 text-white" : ""}`} onClick={() => toggleSort("total_revenue")}>
                        <div className="flex items-center gap-2">
                          Chiffre d'Affaires (€) {sortColumn === "total_revenue" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                    </tr>
                  </thead>

                  {/* 🔹 Contenu du tableau */}
                  <tbody>
                    {sortedData.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-indigo-50 text-center">
                        <td className="p-3">{data.month}</td>
                        <td className="p-3">{formatLargeNumber(data.total_avg_stock, false)}</td>
                        <td className="p-3">{formatLargeNumber(data.total_stock_value, true)}</td>
                        <td className="p-3">{formatLargeNumber(data.total_quantity, false)}</td>
                        <td className="p-3">{formatLargeNumber(data.total_revenue, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 🔹 Message si pas de données */}
            {!loading && !error && stockData.length === 0 && (
              <p className="text-gray-500 text-center col-span-2">Aucune donnée disponible.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockDataMonthly;