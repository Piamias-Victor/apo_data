import React, { useState } from "react";
import { FaChartPie, FaMoneyBillWave, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion } from "framer-motion";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import Loader from "@/components/ui/Loader";

interface LabRevenueCardProps {
  segment: string;
  revenue: number;
  globalrevenue: number;
  margin: number;        // ✅ Ajout de la marge du labo
  globalmargin: number;  // ✅ Ajout de la marge globale
  type: string;
}

// 🎨 **Couleurs par type**
const typeColors: Record<string, string> = {
  universe: "bg-gradient-to-r from-blue-500 to-cyan-600",
  category: "bg-gradient-to-r from-green-500 to-lime-600",
  family: "bg-gradient-to-r from-orange-500 to-yellow-600",
};

const LabRevenueCard: React.FC<LabRevenueCardProps> = ({ segment, revenue, globalrevenue, type, globalmargin, margin }) => {
  // 🟢 **État pour l'affichage des détails**
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState<{ laboratoire: string; total_sales: number; part_de_marche: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ✅ Calcul de la part de marché
  const marketShare = globalrevenue > 0 ? (revenue / globalrevenue) * 100 : 0;
  const marginShare = globalmargin > 0 ? (margin / globalmargin) * 100 : 0; // ✅ Ajout du % de marge
  const cardColor = typeColors[type] || "bg-gradient-to-r from-gray-500 to-gray-700"; 

  // 🔄 **Récupération des détails des laboratoires**
  const fetchLabDetails = async () => {
    setExpanded(!expanded);

    if (!expanded) {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/segmentation/getTopLabsBySegment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ segment, type }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des laboratoires");

        const data = await response.json();
        setLabs(data.labs);
      } catch (err) {
        setError("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`p-6 text-white rounded-xl shadow-lg border border-white ${cardColor}`}
    >
      {/* 📌 **En-tête de la carte** */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FaChartPie className="text-yellow-400" /> {segment}
        </h2>
        <button
          onClick={fetchLabDetails}
          className="text-white focus:outline-none transform transition-transform"
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* 📊 Valeurs principales */}
      <div className="flex justify-between items-center mb-4">
        {/* 📉 CA du Labo */}
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(revenue, true)}</p>
          <p className="text-sm opacity-80 flex items-center gap-2">
            <FaMoneyBillWave className="text-green-300" /> CA Labo
          </p>
        </div>

        {/* 📈 CA Global */}
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(globalrevenue, true)}</p>
          <p className="text-sm opacity-80 flex items-center gap-2">
            <FaMoneyBillWave className="text-blue-300" /> CA Marché
          </p>
        </div>

        {/* 📌 Part de marché */}
        <div className="text-center">
          <p
            className={`text-xl font-bold ${
              marketShare > 10 ? "text-green-300" : marketShare > 5 ? "text-yellow-300" : "text-red-300"
            }`}
          >
            {marketShare.toFixed(1)}%
          </p>
          <p className="text-sm opacity-80">Part de Marché</p>
        </div>
      </div>

      {/* 🔥 Barre de progression smooth */}
      <div className="w-full bg-white rounded-full h-3 relative">
        <motion.div
          className="h-3 rounded-full absolute left-0 top-0"
          initial={{ width: "0%" }}
          animate={{ width: `${marketShare}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            backgroundColor: marketShare > 10 ? "#10B981" : marketShare > 5 ? "#FBBF24" : "#EF4444",
          }}
        ></motion.div>
      </div>

      <div className="h-4"/>

      <div className="flex justify-between items-center mb-4">
  {/* 🏆 Marge du Labo */}
  <div className="text-center">
    <p className="text-xl font-bold">{formatLargeNumber(margin, true)}</p>
    <p className="text-sm opacity-80 flex items-center gap-2">
      <FaMoneyBillWave className="text-red-300" /> Marge Labo
    </p>
  </div>

  {/* 📉 Marge Globale */}
  <div className="text-center">
    <p className="text-xl font-bold">{formatLargeNumber(globalmargin, true)}</p>
    <p className="text-sm opacity-80 flex items-center gap-2">
      <FaMoneyBillWave className="text-purple-300" /> Marge Marché
    </p>
  </div>

  {/* 📌 Part de Marge */}
  <div className="text-center">
    <p className={`text-xl font-bold ${marginShare > 10 ? "text-green-300" : marginShare > 5 ? "text-yellow-300" : "text-red-300"}`}>
      {marginShare.toFixed(1)}%
    </p>
    <p className="text-sm opacity-80">Part de Marge</p>
  </div>
</div>

{/* 🔥 Barre de progression Marge */}
<div className="w-full bg-white rounded-full h-3 relative">
  <motion.div
    className="h-3 rounded-full absolute left-0 top-0"
    initial={{ width: "0%" }}
    animate={{ width: `${marginShare}%` }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    style={{
      backgroundColor: marginShare > 10 ? "#10B981" : marginShare > 5 ? "#FBBF24" : "#EF4444",
    }}
  ></motion.div>
</div>

      {/* 📌 **Détails des laboratoires (si ouverts)** */}
      {expanded && (
        <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
          {loading && <Loader message="Chargement des laboratoires..." />}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && labs.length > 0 && (
            <ul className="space-y-2">
              {labs.map((lab, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{lab.laboratoire}</span>
                  <span className="font-bold">{lab.part_de_marche}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default LabRevenueCard;