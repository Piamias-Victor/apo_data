import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaChartPie, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface StockData {
  month: string;
  total_avg_stock: number;
  total_stock_value: number;
  total_revenue: number;
}

interface StockDataMonthlyProps {
  stockData: StockData[];
  loading: boolean;
  error: string | null;
}

const StockDataMonthly: React.FC<StockDataMonthlyProps> = ({ stockData, loading, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {loading && <p className="text-gray-500 text-center">Chargement des données...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading &&
              !error &&
              stockData.length > 0 &&
              stockData.map((data, index) => {
                // ✅ Calcul sécurisé des valeurs
                const monthsOfStock =
                  data.total_revenue > 0 ? data.total_stock_value / (data.total_revenue / 12) : 0;
                const stockValuePercentage =
                  data.total_revenue > 0 ? (data.total_stock_value / data.total_revenue) * 100 : 0;

                return (
                  <div key={index} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-700 flex justify-between items-center">
                      {data.month}
                      <span className="text-sm text-gray-500">📅 Détails</span>
                    </h3>

                    {/* 📌 Ligne 1 : Stock Moyen & Valeur du Stock */}
                    <div className="flex justify-between items-center mt-4">
                      <StockDetailBlock
                        title="Stock Moyen"
                        value={data.total_avg_stock}
                        icon={<FaChartPie className="text-blue-500 text-xl" />}
                      />
                      <StockDetailBlock
                        title="Valeur du Stock"
                        value={data.total_stock_value}
                        icon={<FaMoneyBillWave className="text-green-500 text-xl" />}
                        isCurrency
                      />
                    </div>

                    {/* 📌 Ligne 2 : Mois de Stock & % Valeur Stock / CA */}
                    <div className="flex justify-between items-center mt-4">
                      <StockDetailBlock
                        title="Mois de Stock"
                        value={monthsOfStock}
                        icon={<FaChartLine className="text-orange-500 text-xl" />}
                      />
                      <StockDetailBlock
                        title="% Stock / CA"
                        value={stockValuePercentage}
                        icon={<FaChartLine className="text-yellow-500 text-xl" />}
                        isPercentage
                      />
                    </div>
                  </div>
                );
              })}

            {!loading && !error && stockData.length === 0 && (
              <p className="text-gray-500 text-center col-span-2">Aucune donnée disponible.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface StockDetailBlockProps {
  title: string;
  value: number;
  icon?: JSX.Element;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

const StockDetailBlock: React.FC<StockDetailBlockProps> = ({ title, value, icon, isCurrency = false, isPercentage = false }) => {
  return (
    <div className="text-right">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="flex items-center justify-end space-x-2 w-full">
        {icon}
        <p className="text-lg font-semibold">
          {isPercentage ? `${value.toFixed(2)}%` : formatLargeNumber(value, isCurrency)}
        </p>
      </div>
    </div>
  );
};

export default StockDataMonthly;