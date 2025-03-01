import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
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
  const [sortColumn, setSortColumn] = useState<keyof MetricsData>("avg_sale_price"); // 📌 Tri par défaut sur Prix Vente Moyen
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // 📌 Descendant par défaut

  // 📌 Fonction de tri des colonnes
  const toggleSort = (column: keyof MetricsData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  // 📌 Tri des données en fonction de la colonne sélectionnée
  const sortedData = [...metricsData].sort((a, b) => {
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
        className="absolute top-4 right-4 bg-violet-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-violet-600 transition flex items-center gap-2"
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"} {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      {/* 📌 Titre */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        📅 <span>Indicateurs Mensuels</span>
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
            {!loading && !error && metricsData.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-lg transition-all duration-300 ease-in-out">
                <table className="w-full border-collapse">
                  {/* 🔹 En-tête du tableau avec colonnes fixes */}
                  <thead>
                    <tr className="bg-violet-500 text-white text-md">
                      {[
                        { key: "month", label: "Mois" },
                        { key: "avg_sale_price", label: "Prix Vente Moyen (€)" },
                        { key: "avg_purchase_price", label: "Prix Achat Moyen (€)" },
                        { key: "avg_margin", label: "Marge (€)" },
                        { key: "unique_products_sold", label: "Références Vendues" },
                        { key: "unique_selling_pharmacies", label: "Pharmacies" },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          className="p-4 cursor-pointer w-1/6 transition hover:bg-violet-600"
                          onClick={() => toggleSort(key as keyof MetricsData)}
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
                      <tr key={index} className="border-b hover:bg-gray-100 transition text-center">
                        <td className="p-5">{data.month}</td>
                        <td className="p-5">{formatLargeNumber(data.avg_sale_price, true)}</td>
                        <td className="p-5">{formatLargeNumber(data.avg_purchase_price, true)}</td>
                        <td className="p-5">{formatLargeNumber(data.avg_margin, true)}</td>
                        <td className="p-5">{formatLargeNumber(data.unique_products_sold, false)}</td>
                        <td className="p-5">{formatLargeNumber(data.unique_selling_pharmacies, false)}</td>
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