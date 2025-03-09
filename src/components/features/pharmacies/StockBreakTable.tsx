import SearchInput from "@/components/common/inputs/SearchInput";
import { formatLargeNumber } from "@/libs/formatUtils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaArrowUp, FaArrowDown, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface StockBreakData {
  pharmacy_id: string;
  pharmacy_name: string;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
  evolution: {
    stock_break_products: number;
    stock_break_rate: number;
    stock_break_amount: number;
  };
}

interface StockBreakTableProps {
  stockBreakData: StockBreakData[];
  loading: boolean;
  error: string | null;
}

const StockBreakTable: React.FC<StockBreakTableProps> = ({ stockBreakData, loading, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof StockBreakData>("stock_break_products");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSort = (column: keyof StockBreakData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  const renderEvolution = (value: number) => {
    if (value > 0)
      return <span className="text-red-500 text-xs flex items-center justify-center mt-1">{value.toFixed(1)}% <FaArrowUp className="ml-1" /></span>;
    if (value < 0)
      return <span className="text-green-500 text-xs flex items-center justify-center mt-1">{value.toFixed(1)}% <FaArrowDown className="ml-1" /></span>;
    return <span className="text-gray-400 text-xs flex justify-center mt-1">0%</span>;
  };

  const sortedData = [...stockBreakData]
    .filter((data) => data.pharmacy_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortOrder === "asc" ? a[sortColumn] - b[sortColumn] : b[sortColumn] - a[sortColumn]);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-300 relative">
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-4 right-4 bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-red-600 transition flex items-center gap-2"
      >
        {isCollapsed ? "Afficher détails" : "Masquer détails"} {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        🚨 <span>Ruptures de Stock par Pharmacie</span>
      </h2>

      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher une pharmacie..." />

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            {loading ? <p className="text-gray-500 text-center">⏳ Chargement des données...</p> : error ? <p className="text-red-500 text-center">{error}</p> : (
              <div className="overflow-hidden border border-gray-200 shadow-lg rounded-lg mt-4">
                <table className="w-full border-collapse rounded-lg">
                  <thead>
                    <tr className="bg-red-500 text-white text-md rounded-lg">
                      <th className="p-4">Pharmacie</th>
                      <th className="p-4 cursor-pointer" onClick={() => toggleSort("stock_break_products")}>Produits en Rupture</th>
                      <th className="p-4 cursor-pointer" onClick={() => toggleSort("stock_break_rate")}>Taux de Rupture</th>
                      <th className="p-4 cursor-pointer" onClick={() => toggleSort("stock_break_amount")}>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((data) => (
                      <tr key={data.pharmacy_id} className="border-b text-center">
                        <td className="p-5">{data.pharmacy_name}</td>
                        <td className="p-5">{data.stock_break_products}{renderEvolution(data.evolution.stock_break_products)}</td>
                        <td className="p-5">{data.stock_break_rate.toFixed(2)}%{renderEvolution(data.evolution.stock_break_rate)}</td>
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

export default StockBreakTable;