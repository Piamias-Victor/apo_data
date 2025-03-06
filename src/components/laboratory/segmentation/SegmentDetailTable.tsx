import React, { useState } from "react";
import { FaChevronRight, FaChevronDown, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { motion } from "framer-motion";
import DataBlock from "../global/DataBlock";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

interface BrandDetail {
  brand_lab: string;
  revenue_current: number;
  margin_current: number;
  quantity_sold_current: number;
  revenue_comparison: number;
  margin_comparison: number;
  quantity_sold_comparison: number;
  revenue_evolution: number;
  margin_evolution: number;
  quantity_sold_evolution: number;
}

interface SegmentDetailTableProps {
  segmentName: string;
  globalData: Record<string, number>;
  brandDetails: BrandDetail[];
  selectedLab?: string;
}

const SegmentDetailTable: React.FC<SegmentDetailTableProps> = ({ segmentName, globalData, brandDetails, selectedLab }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [sortColumn, setSortColumn] = useState<keyof BrandDetail>("revenue_current"); // ✅ Tri par défaut sur CA
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  console.log('selectedLab :', selectedLab)

  // ✅ Ajout du calcul de la part de marché et de la part de la marge pour chaque marque
  const updatedBrandDetails = brandDetails.map((brand) => {
    const marketShare = globalData.revenue_current > 0 ? (brand.revenue_current / globalData.revenue_current) * 100 : 0;
    const marginShare = globalData.margin_current > 0 ? (brand.margin_current / globalData.margin_current) * 100 : 0;
    const profitabilityIndex = marketShare > 0 ? (marginShare / marketShare) * 100 : 0;
  
    return {
      ...brand,
      market_share: marketShare,
      margin_share: marginShare,
      profitability_index: profitabilityIndex,
    };
  });

  const selectedLabDetails = updatedBrandDetails.find((brand) => brand.brand_lab === selectedLab);

  const sortedByRevenue = [...updatedBrandDetails].sort((a, b) => b.revenue_current - a.revenue_current);
const selectedLabRank = selectedLabDetails
  ? sortedByRevenue.findIndex((brand) => brand.brand_lab === selectedLab) + 1
  : null;


  // 📌 Fonction pour calculer l'évolution en %
  const calculateEvolution = (current: number, comparison: number) => {
    if (comparison === 0) return "N/A";
    const evolution = ((current - comparison) / comparison) * 100;
    return `${evolution > 0 ? "+" : ""}${evolution.toFixed(1)}%`;
  };

  // 📌 Fonction pour trier les données
  const sortedData = [...updatedBrandDetails].sort((a, b) => {
    const valA = a[sortColumn] || 0;
    const valB = b[sortColumn] || 0;
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  // 📌 Gestion du tri des colonnes
  const toggleSort = (column: keyof BrandDetail) => {
    setSortOrder(prev => (sortColumn === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortColumn(column);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-300">
      {/* 🔹 Titre et bouton d'expansion */}
      <div
        className="flex justify-between items-center cursor-pointer pb-3 border-b border-gray-200"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold text-gray-900">📊 {segmentName}</h3>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          {expanded ? <FaChevronDown className="text-gray-600" /> : <FaChevronRight className="text-gray-600" />}
        </motion.div>
      </div>

      {expanded && (
        <div className="mt-4">
          {/* ✅ Données Globales avec DataBlock */}
          <h4 className="text-md font-semibold text-gray-800 mb-3">🌍 Données Globales</h4>
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <DataBlock title="CA Actuel (€)" value={globalData.revenue_current} previousValue={globalData.revenue_comparison} isCurrency />
            <DataBlock title="Marge Actuelle (€)" value={globalData.margin_current} previousValue={globalData.margin_comparison} isCurrency />
            <DataBlock title="Quantité Vendue" value={globalData.quantity_sold_current} previousValue={globalData.quantity_sold_comparison} />
          </div>

          {selectedLabDetails && (
            <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <h4 className="text-md font-semibold text-gray-800 mb-3">🔍 Focus : {selectedLabDetails.brand_lab}</h4>
                <div className="grid grid-cols-3 gap-4">
                <DataBlock title="📈 Part de Marché" value={selectedLabDetails.market_share} isPercentage />
                <DataBlock title="📉 Part de Marge" value={selectedLabDetails.margin_share} isPercentage />
                <DataBlock title="🏆 Classement CA" value={selectedLabRank} />
                </div>
            </div>
            )}

          {/* ✅ Détails par Marque - Nouveau Design */}
          <h4 className="text-md font-semibold text-gray-800 mt-6 mb-3">🏷️ Détails par Marque</h4>
          {brandDetails.length > 0 ? (
            <div className="overflow-hidden border border-gray-200 shadow-lg rounded-lg">
              <table className="w-full border-collapse rounded-lg table-auto">
                <thead>
                  <tr className="bg-teal-500 text-white text-md">
                    <th className="p-4 text-left">Marque</th>
                    {[
                      { key: "revenue_current", label: "💰 CA (€)" },
                      { key: "margin_current", label: "💵 Marge (€)" },
                      { key: "quantity_sold_current", label: "📦 Quantité Vendue" },
                      { key: "market_share", label: "📈 Part de Marché (%)" },
                      { key: "margin_share", label: "📉 Part de Marge (%)" }, // ✅ Nouvelle colonne
                      { key: "profitability_index", label: "💡 Indice Rentabilité" },
                    ].map(({ key, label }) => (
                      <th key={key} className="p-4 text-right cursor-pointer" onClick={() => toggleSort(key as keyof BrandDetail)}>
                        <div className="flex justify-end items-center gap-2">
                          {label}
                          {sortColumn === key ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((brand, index) => {
                    const revenueEvolution = calculateEvolution(brand.revenue_current, brand.revenue_comparison);
                    return (
                      <tr key={index} className="border-b bg-gray-50 hover:bg-gray-200 transition">
                        {/* 📌 Nom de la marque */}
                        <td className="p-4 font-medium">{brand.brand_lab || "Non spécifié"}</td>

                        {/* 📌 Valeurs affichées en 3 lignes */}
                        {["revenue_current", "margin_current", "quantity_sold_current"].map((column) => (
                          <td key={column} className="p-4 text-right">
                            <div className="flex flex-col gap-1 items-center justify-center">
                              <span className="font-semibold text-gray-900">{formatLargeNumber(brand[column as keyof BrandDetail])}</span>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  parseFloat(revenueEvolution) < 0 ? "bg-red-400 text-white" : "bg-green-400 text-white"
                                }`}
                              >
                                {revenueEvolution}
                              </span>
                              <span className="text-xs text-gray-600">{formatLargeNumber(brand[`${column.replace("_current", "_comparison")}` as keyof BrandDetail])}</span>
                            </div>
                          </td>
                        ))}

                        {/* 📌 Part de marché calculée dynamiquement */}
                        <td className="p-4 text-right">
                          <span className="font-semibold text-gray-900">{brand.market_share.toFixed(1)}%</span>
                        </td>

                        {/* 📌 Part de marge calculée dynamiquement */}
                        <td className="p-4 text-right">
                          <span className="font-semibold text-gray-900">{brand.margin_share.toFixed(1)}%</span>
                        </td>
                        {/* 📌 Indice de Rentabilité calculé dynamiquement */}
                        <td className="p-4 text-right">
                        <span className={`px-2 py-1 rounded-md text-white font-semibold ${
                            brand.profitability_index >= 100 ? "bg-green-400" : "bg-red-400"
                        }`}>
                            {brand.profitability_index.toFixed(1)}%
                        </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-3">Aucune donnée disponible pour les marques.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SegmentDetailTable;