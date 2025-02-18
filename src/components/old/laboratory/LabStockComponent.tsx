import React, { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion } from "framer-motion";
import { FaBox, FaEuroSign, FaChartLine, FaPercentage } from "react-icons/fa";

// 📌 Fonction pour formater les nombres
const formatLargeNumber = (value: any, isCurrency: boolean = true): string => {
  if (!value || isNaN(Number(value))) return "N/A";

  const num = Number(value);
  let formattedValue = num.toFixed(2).replace(".", ",");

  if (num >= 1_000_000) {
    formattedValue = `${(num / 1_000_000).toFixed(2).replace(".", ",")} M`;
  } else if (num >= 1_000) {
    formattedValue = `${(num / 1_000).toFixed(2).replace(".", ",")} K`;
  }

  return isCurrency ? `${formattedValue} €` : formattedValue;
};

/**
 * Interface pour stocker les données du rapport de stock
 */
interface StockReportData {
  totalstockquantity: number;
  totalstockvalue: number;
  stockmonthsquantity: number | null;
  stockvaluepercentage: number | null;
}

const LabStockComponent: React.FC = () => {
  const { filters } = useFilterContext();
  const [stockData, setStockData] = useState<StockReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/stock/getLabStock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Impossible de récupérer les données");

        const data = await response.json();
        setStockData(data.stockData);
      } catch (err) {
        setError("Erreur lors de la récupération du stock");
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [filters]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl shadow-lg border border-white max-w-6xl mx-auto"
    >
      {/* 📌 Loader */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-40">
          <div className="border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"></div>
          <span className="text-white mt-2">Chargement des données...</span>
        </div>
      )}

      {/* ❌ Erreur */}
      {error && <p className="text-red-300 text-center mt-4">{error}</p>}

      {/* ✅ Contenu uniquement si les données sont disponibles */}
      {!loading && !error && stockData && (
        <>
          {/* 📌 Titre */}
          <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              📦 Analyse du Stock
            </h2>
            <p className="text-sm opacity-80">Données sur le stock et leur impact</p>
          </div>

          {/* 📊 GRID PRINCIPALE */}
          <div className="grid grid-cols-2 gap-8">
            {/* 🔵 SECTION STOCK */}
            <div className="border-r border-white pr-6">
              <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
                <FaEuroSign className="mr-2" /> Valeur du Stock
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* 🔹 Stock Moyen (Quantité) */}
                <div className="text-center">
                  <p className="text-xl font-bold">{formatLargeNumber(stockData.totalstockquantity, false)}</p>
                  <p className="text-sm opacity-80">Stock Moyen</p>
                </div>

                {/* 🔹 Valeur du Stock */}
                <div className="text-center">
                  <p className="text-xl font-bold">{formatLargeNumber(stockData.totalstockvalue)}</p>
                  <p className="text-sm opacity-80">Valeur Stock</p>
                </div>
              </div>
            </div>

            {/* 🟠 SECTION PERFORMANCE */}
            <div className="pl-6">
              <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
                <FaChartLine className="mr-2" /> Performance du Stock
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* 🔹 Mois de Stock en Quantité */}
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {stockData.stockmonthsquantity !== null
                      ? `${formatLargeNumber(stockData.stockmonthsquantity, false)} mois`
                      : "N/A"}
                  </p>
                  <p className="text-sm opacity-80">Stock (Mois)</p>
                </div>

                {/* 🔹 Stock en % du CA */}
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {stockData.stockvaluepercentage !== null
                      ? `${formatLargeNumber(stockData.stockvaluepercentage, false)} %`
                      : "N/A"}
                  </p>
                  <p className="text-sm opacity-80">Stock / CA</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LabStockComponent;