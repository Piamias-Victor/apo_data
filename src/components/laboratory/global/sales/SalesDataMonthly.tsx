import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown, FaShoppingCart, FaBoxOpen, FaChartLine, FaMoneyBillWave } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface SalesData {
  month: string;
  total_quantity: number;
  revenue?: number;
  margin?: number;
  purchase_quantity?: number;
  purchase_amount?: number;
}

interface SalesDataMonthlyProps {
  salesData: SalesData[];
  loading: boolean;
  error: string | null;
}

const SalesDataMonthly: React.FC<SalesDataMonthlyProps> = ({ salesData, loading, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof SalesData>("revenue"); // 📌 Tri par défaut sur CA
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // 📌 Descendant par défaut

  // 📌 Fonction pour gérer le tri des colonnes
  const toggleSort = (column: keyof SalesData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  // 📌 Tri des données en fonction de la colonne sélectionnée
  const sortedData = [...salesData].sort((a, b) => {
    if (sortColumn === "month") {
      return sortOrder === "asc"
        ? a.month.localeCompare(b.month)
        : b.month.localeCompare(a.month);
    }
    return sortOrder === "asc" ? (a[sortColumn] ?? 0) - (b[sortColumn] ?? 0) : (b[sortColumn] ?? 0) - (a[sortColumn] ?? 0);
  });

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-300 relative">
      {/* 📌 Bouton de toggle avec animation */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-4 right-4 bg-teal-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-teal-600 transition flex items-center gap-2"
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"} {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      {/* 📌 Titre */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        📊 <span>Analyse des Ventes Mensuelles</span>
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
            {!loading && !error && salesData.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-lg transition-all duration-300 ease-in-out">
                <table className="w-full border-collapse">
                  {/* 🔹 En-tête du tableau avec colonnes fixes */}
                  <thead>
                    <tr className="bg-teal-500 text-white text-md">
                      {[
                        { key: "month", label: "Mois" },
                        { key: "total_quantity", label: "Quantité Vendue" },
                        { key: "revenue", label: "Chiffre d'Affaires (€)" },
                        { key: "margin", label: "Marge (€)" },
                        { key: "purchase_quantity", label: "Achats" },
                        { key: "purchase_amount", label: "Montant Achats (€)" },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          className="p-4 cursor-pointer w-1/6 transition hover:bg-teal-600"
                          onClick={() => toggleSort(key as keyof SalesData)}
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
                      <tr key={index} className="border-b hover:bg-teal-50 transition text-center">
                        <td className="p-5">{data.month}</td>
                        <td className="p-5">{formatLargeNumber(data.total_quantity, false)}</td>
                        <td className="p-5">{data.revenue ? formatLargeNumber(data.revenue) : "N/A"}</td>
                        <td className="p-5">{data.margin ? formatLargeNumber(data.margin) : "N/A"}</td>
                        <td className="p-5">{data.purchase_quantity ? formatLargeNumber(data.purchase_quantity, false) : "N/A"}</td>
                        <td className="p-5">{data.purchase_amount ? formatLargeNumber(data.purchase_amount) : "N/A"}</td>
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

export default SalesDataMonthly;