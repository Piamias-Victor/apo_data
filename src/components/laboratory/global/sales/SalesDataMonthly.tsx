import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaShoppingCart, FaBoxOpen, FaChartLine, FaMoneyBillWave } from "react-icons/fa";
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {loading && <p className="text-gray-500 text-center">Chargement des données...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && !error && salesData.length > 0 && salesData.map((data, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-300">
                <h3 className="text-lg font-semibold text-gray-700 flex justify-between items-center">
                  {data.month}
                  <span className="text-sm text-gray-500">📅 Détails</span>
                </h3>
                <div className="flex justify-between mt-4">
                  {/* 📌 Colonne Sell-Out */}
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Sell-Out</p>
                    <div className="flex items-center space-x-2">
                      <FaShoppingCart className="text-blue-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.total_quantity, false)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaChartLine className="text-green-500" />
                      <p className="text-lg font-semibold">{data.revenue ? formatLargeNumber(data.revenue) : "N/A"}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaMoneyBillWave className="text-yellow-500" />
                      <p className="text-lg font-semibold">{data.margin ? formatLargeNumber(data.margin) : "N/A"}</p>
                    </div>
                  </div>

                  {/* 📌 Colonne Sell-In */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Sell-In</p>
                    <div className="flex items-center space-x-2">
                      <FaBoxOpen className="text-purple-500" />
                      <p className="text-lg font-semibold">{data.purchase_quantity ? formatLargeNumber(data.purchase_quantity, false) : "N/A"}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaMoneyBillWave className="text-red-500" />
                      <p className="text-lg font-semibold">{data.purchase_amount ? formatLargeNumber(data.purchase_amount) : "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

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