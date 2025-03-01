import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { AnimatePresence, motion } from "framer-motion";

interface SalesData {
  pharmacy_id: string;
  pharmacy_name: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  evolution: {
    total_quantity: number;
    revenue: number;
    margin: number;
    purchase_quantity: number;
    purchase_amount: number;
  };
}

interface SalesDataByPharmacyProps {
  salesData: SalesData[];
  loading: boolean;
  error: string | null;
}

const SalesDataByPharmacy: React.FC<SalesDataByPharmacyProps> = ({ salesData, loading, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof SalesData>("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleSort = (column: keyof SalesData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  const renderEvolution = (value: number) => {
    if (value > 0)
      return <span className="text-green-500 text-xs flex items-center justify-center mt-1">{value.toFixed(1)}% <FaArrowUp className="ml-1" /></span>;
    if (value < 0)
      return <span className="text-red-500 text-xs flex items-center justify-center mt-1">{value.toFixed(1)}% <FaArrowDown className="ml-1" /></span>;
    return <span className="text-gray-400 text-xs flex justify-center mt-1">0%</span>;
  };

  const sortedData = [...salesData].sort((a, b) => {
    if (sortColumn === "pharmacy_name") {
      return sortOrder === "asc"
        ? a.pharmacy_name.localeCompare(b.pharmacy_name)
        : b.pharmacy_name.localeCompare(a.pharmacy_name);
    }
    return sortOrder === "asc" ? a[sortColumn] - b[sortColumn] : b[sortColumn] - a[sortColumn];
  });

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-300 relative">
      {/* 📌 Bouton de toggle */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-4 right-4 bg-pink-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-pink-600 transition flex items-center gap-2"
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"} {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      {/* 📊 Titre */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        🏥 <span>Ventes par Pharmacie</span>
      </h2>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {loading && <p className="text-gray-500 text-center">⏳ Chargement des données...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && !error && salesData.length > 0 && (
              <div className="overflow-hidden border border-gray-200 shadow-lg rounded-lg">
                <table className="w-full border-collapse rounded-lg">
                  <thead>
                    <tr className="bg-pink-500 text-white text-md rounded-lg">
                      {["#", "pharmacy_name", "total_quantity", "revenue", "margin", "purchase_quantity", "purchase_amount"].map((col, index) => (
                        <th
                          key={index}
                          className="p-4 cursor-pointer transition hover:bg-pink-600"
                          onClick={() => col !== "#" && toggleSort(col as keyof SalesData)}
                        >
                          <div className="flex justify-center items-center gap-2">
                            {col === "#" && "#"}
                            {col === "pharmacy_name" && "Pharmacie"}
                            {col === "total_quantity" && "Qté Vendue"}
                            {col === "revenue" && "CA (€)"}
                            {col === "margin" && "Marge (€)"}
                            {col === "purchase_quantity" && "Qté Achetée"}
                            {col === "purchase_amount" && "Montant Achats (€)"}
                            {col !== "#" && (sortColumn === col ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((data, index) => (
                      <tr key={data.pharmacy_id} className="border-b hover:bg-gray-100 transition text-center">
                        <td className="p-5 font-bold">{index + 1}</td> {/* ✅ Ajout du classement */}
                        <td className="p-5">{data.pharmacy_name}</td>
                        <td className="p-5">{formatLargeNumber(data.total_quantity, false)}{renderEvolution(data.evolution.total_quantity)}</td>
                        <td className="p-5">{formatLargeNumber(data.revenue)}{renderEvolution(data.evolution.revenue)}</td>
                        <td className="p-5">{formatLargeNumber(data.margin)}{renderEvolution(data.evolution.margin)}</td>
                        <td className="p-5">{formatLargeNumber(data.purchase_quantity, false)}{renderEvolution(data.evolution.purchase_quantity)}</td>
                        <td className="p-5">{formatLargeNumber(data.purchase_amount)}{renderEvolution(data.evolution.purchase_amount)}</td>
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

export default SalesDataByPharmacy;