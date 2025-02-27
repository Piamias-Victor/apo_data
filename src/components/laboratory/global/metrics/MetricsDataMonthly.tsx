import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown, FaTag, FaStore, FaChartLine } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface MetricsData {
  month: string;
  avg_sale_price: number;
  avg_purchase_price: number;
  avg_margin: number;
  avg_margin_percentage: number;
  unique_products_sold: number;
  unique_selling_pharmacies: number;
}

interface MetricsDataMonthlyProps {
  metricsData: MetricsData[];
  loading: boolean;
  error: string | null;
}

const MetricsDataMonthly: React.FC<MetricsDataMonthlyProps> = ({ metricsData, loading, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof MetricsData | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 📌 Fonction de tri des colonnes
  const toggleSort = (column: keyof MetricsData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // 📌 Tri des données en fonction de la colonne sélectionnée
  const sortedData = [...metricsData].sort((a, b) => {
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
        className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md hover:bg-teal-600 transition flex items-center"
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"}
        {isCollapsed ? <FaChevronDown className="ml-2" /> : <FaChevronUp className="ml-2" />}
      </button>

      {/* 📌 Titre */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">📅 Détails Mensuels</h2>

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
            {!loading && !error && metricsData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  {/* 🔹 En-tête du tableau */}
                  <thead>
                    <tr className="bg-teal-100 text-teal-900">
                      <th className={`p-3 cursor-pointer ${sortColumn === "month" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("month")}>
                        <div className="flex items-center gap-2">
                          Mois {sortColumn === "month" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "avg_sale_price" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("avg_sale_price")}>
                        <div className="flex items-center gap-2">
                          Prix Vente Moyen (€) {sortColumn === "avg_sale_price" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "avg_purchase_price" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("avg_purchase_price")}>
                        <div className="flex items-center gap-2">
                          Prix Achat Moyen (€) {sortColumn === "avg_purchase_price" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "avg_margin" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("avg_margin")}>
                        <div className="flex items-center gap-2">
                          Marge (€) {sortColumn === "avg_margin" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "unique_products_sold" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("unique_products_sold")}>
                        <div className="flex items-center gap-2">
                          Références Vendues {sortColumn === "unique_products_sold" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "unique_selling_pharmacies" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("unique_selling_pharmacies")}>
                        <div className="flex items-center gap-2">
                          Pharmacies {sortColumn === "unique_selling_pharmacies" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                    </tr>
                  </thead>

                  {/* 🔹 Contenu du tableau */}
                  <tbody>
                    {sortedData.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-teal-50 text-center">
                        <td className="p-3">{data.month}</td>
                        <td className="p-3">{formatLargeNumber(data.avg_sale_price, true)}</td>
                        <td className="p-3">{formatLargeNumber(data.avg_purchase_price, true)}</td>
                        <td className="p-3">{formatLargeNumber(data.avg_margin, true)}</td>
                        <td className="p-3">{formatLargeNumber(data.unique_products_sold, false)}</td>
                        <td className="p-3">{formatLargeNumber(data.unique_selling_pharmacies, false)}</td>
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

export default MetricsDataMonthly;