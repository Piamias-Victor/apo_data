import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaExclamationTriangle, FaChartLine, FaMoneyBillWave, FaBoxOpen } from "react-icons/fa";
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {loading && <p className="text-gray-500 text-center">Chargement des données...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && !error && stockBreakData.length > 0 && stockBreakData.map((data, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-300">
                <h3 className="text-lg font-semibold text-gray-700 flex justify-between items-center">
                  {data.month}
                  <span className="text-sm text-gray-500">📅 Détails</span>
                </h3>
                <div className="flex justify-between mt-4">
                  {/* 📌 Colonne Produits commandés */}
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Produits commandés</p>
                    <div className="flex items-center space-x-2">
                      <FaBoxOpen className="text-blue-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.total_products_ordered, false)}</p>
                    </div>
                  </div>

                  {/* 📌 Colonne Produits en rupture */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Produits en rupture</p>
                    <div className="flex items-center space-x-2 justify-end">
                      <FaExclamationTriangle className="text-red-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.stock_break_products, false)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  {/* 📉 Taux de rupture */}
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Taux de rupture</p>
                    <div className="flex items-center space-x-2 ">
                      <FaChartLine className="text-orange-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.stock_break_rate, false)}%</p>
                    </div>
                  </div>

                  {/* 💰 Montant des ruptures */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Montant des ruptures</p>
                    <div className="flex items-center justify-end space-x-2 w-full">
                      <FaMoneyBillWave className="text-green-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.stock_break_amount, true)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

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