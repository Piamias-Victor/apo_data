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
  const [sortColumn, setSortColumn] = useState<keyof StockBreakData>("stock_break_amount"); // 📌 Tri par défaut sur montant des ruptures
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // 📌 Descendant par défaut

  // 📌 Fonction de tri des colonnes
  const toggleSort = (column: keyof StockBreakData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  // 📌 Tri des données en fonction de la colonne sélectionnée
  const sortedData = [...stockBreakData].sort((a, b) => {
    if (sortColumn === "month") {
      return sortOrder === "asc"
        ? a.month.localeCompare(b.month)
        : b.month.localeCompare(a.month);
    }
    return sortOrder === "asc" ? a[sortColumn] - b[sortColumn] : b[sortColumn] - a[sortColumn];
  });

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-300 relative">
      {/* 📌 Bouton de toggle avec animation */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-4 right-4 bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-red-600 transition flex items-center gap-2"
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"} {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      {/* 📌 Titre */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        🚨 <span>Suivi des Ruptures de Stock</span>
      </h2>

      {/* 📌 Contenu animé */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* 🔹 Loader & Erreur */}
            {loading && <p className="text-gray-500 text-center">Chargement des données...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* 📌 Tableau des données */}
            {!loading && !error && stockBreakData.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-lg transition-all duration-300 ease-in-out">
                <table className="w-full border-collapse">
                  {/* 🔹 En-tête du tableau avec colonnes fixes */}
                  <thead>
                    <tr className="bg-red-500 text-white text-md">
                      {[
                        { key: "month", label: "Mois" },
                        { key: "total_products_ordered", label: "Produits Commandés" },
                        { key: "stock_break_products", label: "Produits en Rupture" },
                        { key: "stock_break_rate", label: "Taux de Rupture (%)" },
                        { key: "stock_break_amount", label: "Montant des Ruptures (€)" },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          className="p-4 cursor-pointer w-1/6 transition hover:bg-red-600"
                          onClick={() => toggleSort(key as keyof StockBreakData)}
                        >
                          <div className="flex justify-center items-center gap-2">
                            {label}
                            {sortColumn === key ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* 🔹 Contenu du tableau */}
                  <tbody>
                    {sortedData.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-red-50 transition text-center">
                        <td className="p-5">{data.month}</td>
                        <td className="p-5">{formatLargeNumber(data.total_products_ordered, false)}</td>
                        <td className="p-5">{formatLargeNumber(data.stock_break_products, false)}</td>
                        <td className="p-5">{formatLargeNumber(data.stock_break_rate, false)}%</td>
                        <td className="p-5">{formatLargeNumber(data.stock_break_amount, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockBreakDataMonthly;