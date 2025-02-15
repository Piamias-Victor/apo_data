import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaTag, FaStore, FaChartLine } from "react-icons/fa";
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

            {!loading && !error && metricsData.length > 0 && metricsData.map((data, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-300">
                <h3 className="text-lg font-semibold text-gray-700 flex justify-between items-center">
                  {data.month}
                  <span className="text-sm text-gray-500">📅 Détails</span>
                </h3>
                <div className="flex justify-between mt-4">
                  {/* 📌 Colonne Prix et Marges */}
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Prix & Marges</p>
                    <div className="flex items-center space-x-2">
                      <FaTag className="text-blue-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.avg_sale_price, true)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaTag className="text-green-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.avg_purchase_price, true)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaChartLine className="text-yellow-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.avg_margin, true)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaChartLine className="text-purple-500" />
                      <p className="text-lg font-semibold">{data.avg_margin_percentage}%</p>
                    </div>
                  </div>

                  {/* 📌 Colonne Références & Pharmacies */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Références & Pharmacies</p>
                    <div className="flex items-center space-x-2">
                      <FaStore className="text-red-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.unique_products_sold, false)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaStore className="text-indigo-500" />
                      <p className="text-lg font-semibold">{formatLargeNumber(data.unique_selling_pharmacies, false)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!loading && !error && metricsData.length === 0 && (
              <p className="text-gray-500 text-center col-span-2">Aucune donnée disponible.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetricsDataMonthly;