import React, { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion } from "framer-motion";
import { RiMoneyEuroCircleFill, RiStockFill } from "react-icons/ri";
import { FaBoxOpen, FaChartLine } from "react-icons/fa";

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

// 📌 Fonction pour formater l'évolution avec le même design que SalesDataComponent
const formatEvolution = (value: number | null) => {
  if (value === null || isNaN(value)) return "N/A";
  const num = Number(value);
  const formattedValue = `${num.toFixed(1)}%`;

  return (
    <div className="flex items-center justify-center mt-2">
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
        ${num > 0 ? "bg-green-400 text-white" : num < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
        {formattedValue}
      </span>
    </div>
  );
};

/**
 * Interface pour stocker les données financières du laboratoire
 */
interface LabMetrics {
  avgsellprice: number | null;
  avgsellpriceevolution: number | null;
  avgweightedbuyprice: number | null;
  avgweightedbuypriceevolution: number | null;
  avgmargin: number | null;
  avgmarginevolution: number | null;
  avgmarginpercentage: number | null;
  avgmarginpercentageevolution: number | null;
  avgstockvalue: number | null;
  avgstockvalueevolution: number | null;
  numreferencessold: number | null;
  numreferencessoldevolution: number | null;
  numpharmaciessold: number | null;
  numpharmaciessoldevolution: number | null;
}

const LabMetricsComponent: React.FC = () => {
  const { filters } = useFilterContext();
  const [metrics, setMetrics] = useState<LabMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/getLabMetrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Impossible de récupérer les données");

        const data = await response.json();
        setMetrics(data.metrics || null);
      } catch (err) {
        setError("Erreur lors de la récupération des métriques");
      } finally {
        setLoading(false);
      }
    };

    fetchLabMetrics();
  }, [filters]);

  console.log("📊 Lab Metrics Data :", metrics);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg border border-white max-w-6xl mx-auto"
    >
      {/* 📌 Loader */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-40">
          <div className="border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"></div>
          <span className="text-gray-100 mt-2">Chargement en cours...</span>
        </div>
      )}

      {/* ❌ Erreur */}
      {error && <p className="text-red-300 text-center">{error}</p>}

      {/* ✅ Contenu uniquement si les données sont disponibles */}
      {!loading && !error && metrics && (
        <>
          {/* 📌 Titre */}
          <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
            <h2 className="text-lg font-semibold">💰 Indicateurs Financiers</h2>
            <p className="text-sm opacity-80">Calculs sur 12 mois</p>
          </div>

          {/* 🟢 Contenu en GRID */}
          <div className="grid grid-cols-2 gap-8">
            {/* 🔵 INDICATEURS FINANCIERS */}
<div className="border-r border-white pr-6">
  <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
    <FaChartLine className="mr-2" /> Indicateurs Financiers
  </h3>
  <div className="grid grid-cols-3 gap-4">
    {/* 🔹 Prix de vente moyen */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(metrics.avgsellprice, true)}</p>
      <p className="text-sm opacity-80">Prix de Vente Moyen</p>
      {formatEvolution(metrics.avgsellpriceevolution)}
    </div>

    {/* 🔹 Prix d'achat moyen pondéré */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(metrics.avgweightedbuyprice, true)}</p>
      <p className="text-sm opacity-80">Prix d'Achat Moyen</p>
      {formatEvolution(metrics.avgweightedbuypriceevolution)}
    </div>

    {/* 🔹 Marge moyenne */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(metrics.avgmargin, true)}</p>
      <p className="text-sm opacity-80">Marge Moyenne</p>
      {formatEvolution(metrics.avgmarginevolution)}
    </div>
  </div>
</div>

{/* 🟠 PERFORMANCE & STOCK */}
<div className="pl-6">
  <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
    <FaBoxOpen className="mr-2" /> Performance & Stock
  </h3>
  <div className="grid grid-cols-2 gap-4">
    {/* 🔹 % Marge */}
    <div className="text-center">
      <p className="text-xl font-bold">
        {metrics.avgmarginpercentage !== null ? `${formatLargeNumber(metrics.avgmarginpercentage, false)} %` : "N/A"}
      </p>
      <p className="text-sm opacity-80">% Marge Moyen</p>
      {formatEvolution(metrics.avgmarginpercentageevolution)}
    </div>

    {/* 🔹 Valeur moyenne du stock */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(metrics.avgstockvalue, true)}</p>
      <p className="text-sm opacity-80">Valeur Stock Moyenne</p>
      {formatEvolution(metrics.avgstockvalueevolution)}
    </div>
  </div>
</div>

            {/* 🟢 RÉFÉRENCES ET PHARMACIES */}
            <div className="col-span-2 border-t border-white pt-6">
              <div className="grid grid-cols-2 gap-8">
                {/* 🔹 Nombre de références vendues */}
                <div className="text-center">
                  <p className="text-xl font-bold">{metrics.numreferencessold ?? "N/A"}</p>
                  <p className="text-sm opacity-80">Références Vendues</p>
                  {formatEvolution(metrics.numreferencessoldevolution)}
                </div>

                {/* 🔹 Nombre de pharmacies ayant vendu */}
                <div className="text-center">
                  <p className="text-xl font-bold">{metrics.numpharmaciessold ?? "N/A"}</p>
                  <p className="text-sm opacity-80">Pharmacies ayant vendu</p>
                  {formatEvolution(metrics.numpharmaciessoldevolution)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LabMetricsComponent;