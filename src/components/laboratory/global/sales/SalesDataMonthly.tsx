import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaSort, FaShoppingCart, FaBoxOpen, FaChartLine, FaMoneyBillWave, FaSortUp, FaSortDown } from "react-icons/fa";
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
  const [sortColumn, setSortColumn] = useState<keyof SalesData | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 📌 Fonction de tri des colonnes
  const toggleSort = (column: keyof SalesData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // 📌 Tri des données en fonction de la colonne sélectionnée
  const sortedData = [...salesData].sort((a, b) => {
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
            {!loading && !error && salesData.length > 0 && (
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
                      <th className={`p-3 cursor-pointer ${sortColumn === "total_quantity" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("total_quantity")}>
                      <div className="flex items-center gap-2">
                      Quantité Vendue {sortColumn === "total_quantity" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                      </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "revenue" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("revenue")}>
                      <div className="flex items-center gap-2">
                      Chiffre d'Affaires (€) {sortColumn === "revenue" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                      </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "margin" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("margin")}>
                      <div className="flex items-center gap-2">
                      Marge (€) {sortColumn === "margin" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                      </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "purchase_quantity" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("purchase_quantity")}>
                      <div className="flex items-center gap-2">
                      Achats {sortColumn === "purchase_quantity" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                      </div>
                      </th>
                      <th className={`p-3 cursor-pointer ${sortColumn === "purchase_amount" ? "bg-teal-300 text-white" : ""}`} onClick={() => toggleSort("purchase_amount")}>
                      <div className="flex items-center gap-2">
                      Montant Achats (€) {sortColumn === "purchase_amount" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                      </div>
                      </th>
                    </tr>
                  </thead>
                  
                  {/* 🔹 Contenu du tableau */}
                  <tbody>
                    {sortedData.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-teal-50 text-center">
                        <td className="p-3">{data.month}</td>
                        <td className="p-3">{formatLargeNumber(data.total_quantity, false)}</td>
                        <td className="p-3">{data.revenue ? formatLargeNumber(data.revenue) : "N/A"}</td>
                        <td className="p-3">{data.margin ? formatLargeNumber(data.margin) : "N/A"}</td>
                        <td className="p-3">{data.purchase_quantity ? formatLargeNumber(data.purchase_quantity, false) : "N/A"}</td>
                        <td className="p-3">{data.purchase_amount ? formatLargeNumber(data.purchase_amount) : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 🔹 Message si pas de données */}
            {!loading && !error && salesData.length === 0 && (
              <p className="text-gray-500 text-center col-span-2">Aucune donnée disponible.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalesDataMonthly;