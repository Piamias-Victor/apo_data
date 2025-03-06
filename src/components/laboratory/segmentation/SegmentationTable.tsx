import React, { useState } from "react";
import { FaSort, FaSortUp, FaSortDown, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { motion } from "framer-motion";
import SegmentationSalesStockChart from "./SegmentationSalesStockChart"; // ✅ Import du graphique
import { useFilterContext } from "@/contexts/FilterContext";
import Link from "next/link";
import SegmentDetailTable from "./SegmentDetailTable";

interface SegmentationData {
  [key: string]: { 
    revenue_current: string; 
    margin_current: string;
    revenue_comparison: string;
    margin_comparison: string;
    quantity_sold_current: string;
    quantity_sold_comparison: string;
    quantity_purchased_current: string;
    quantity_purchased_comparison: string;
    purchase_amount_current: string;
    purchase_amount_comparison: string;
  };
}

interface SegmentationTableProps {
  title: string;
  data: SegmentationData;
}

const SegmentationTable: React.FC<SegmentationTableProps> = ({ title, data }) => {
  const [sortColumn, setSortColumn] = useState<keyof SegmentationData[string] | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [segmentData, setSegmentData] = useState<Record<string, any>>({});
const [loadingSegments, setLoadingSegments] = useState<Record<string, boolean>>({});
    const { filters } = useFilterContext();
    
    

    const normalizeTitle = (title: string): string => {
      return title
        .toLowerCase()
        .replace(/[^\w\s']/gi, '') // ✅ Garde les apostrophes pour "d'affaires"
        .replace(/\s+/g, ' ') // ✅ Remplace les espaces multiples par un seul espace
        .trim();
    };
      
      const segmentKeyMap: Record<string, string> = {
        "chiffre d'affaires par famille": "family",
        "chiffre d'affaires par univers": "universe",
        "chiffre d'affaires par catgorie": "category",
        "chiffre d'affaires par sous-catégorie": "sub_category",
        "chiffre d'affaires par gamme": "range_name",
        "chiffre d'affaires par spcificit": "specificity",
        "chiffre d'affaires par sous-famille": "sub_family", // ✅ Ajouté pour éviter l'erreur
      };
      
      const fetchSegmentData = async (segment: string) => {
        setLoadingSegments((prev) => ({ ...prev, [segment]: true }));


      
        const normalizedTitle = normalizeTitle(title);
        const segmentKey = segmentKeyMap[normalizedTitle];
      
        if (!segmentKey) {
          console.error("❌ Erreur : Clé de segmentation invalide", title, "→", normalizedTitle);
          setLoadingSegments((prev) => ({ ...prev, [segment]: false }));
          return;
        }
      
        try {
          const response = await fetch("/api/segmentation/GetGlobalSegmentData", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              segment: segment,
              type: segmentKey,
              pharmacies: filters.pharmacies.length > 0 ? filters.pharmacies : null,
              dateRange: filters.dateRange,
              comparisonDateRange: filters.comparisonDateRange, // ✅ Ajout de la période de comparaison
            }),
          });
      
          const result = await response.json();
      
          if (!response.ok) {
            console.error("❌ Erreur API:", result);
            throw new Error(result.error || "Erreur inconnue");
          }
      
          // ✅ Stocker les deux jeux de données
          setSegmentData((prev) => ({
            ...prev,
            [segment]: {
              global: result.segmentData,
              brands: result.brandDetails, // ✅ Stocke les données par marque
            },
          }));
        } catch (error) {
          console.error("❌ Erreur lors du chargement des données du segment :", error);
        } finally {
          setLoadingSegments((prev) => ({ ...prev, [segment]: false }));
        }
      };
  // 📌 Fonction pour convertir une valeur string en nombre
  const toNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // 📌 Fonction pour calculer l'évolution en %
  const calculateEvolution = (currentStr: string, comparisonStr: string) => {
    const current = toNumber(currentStr);
    const comparison = toNumber(comparisonStr);
    if (comparison === 0) return "N/A";
    const evolution = ((current - comparison) / comparison) * 100;
    return `${evolution > 0 ? "+" : ""}${evolution.toFixed(1)}%`;
  };


  // 📌 Fonction pour trier les données
  const sortedData = Object.entries(data)
    .filter(([key]) => key.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort(([, a], [, b]) => {
      if (!sortColumn) return 0;
      const valA = toNumber(a[sortColumn]);
      const valB = toNumber(b[sortColumn]);
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

  // 📌 Gère le tri des colonnes
  const toggleSort = (column: keyof SegmentationData[string]) => {
    setSortOrder(prev => (sortColumn === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortColumn(column);
  };


  const validSegmentKeys = [
    "universe",
    "category",
    "sub_category",
    "range_name",
    "family",
    "sub_family",
    "specificity"
  ];

  // 📌 Gère l'affichage des détails
  const toggleDetails = (key: string) => {
    setExpandedRows((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
  
      // ⚡ Appeler fetchSegmentData uniquement si on ouvre la ligne
      if (!prev[key] && !segmentData[key]) {
        fetchSegmentData(key);
      }
  
      return newState;
    });
  };


  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 📌 Titre et barre de recherche */}
      <div className="flex justify-between items-center mb-6">
        <div className="mr-auto w-[35%]">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="🔍 Rechercher un segment..." />
        </div>
      </div>

      <div className="overflow-hidden border border-gray-200 shadow-lg rounded-lg">
        <table className="w-full border-collapse rounded-lg table-auto">
          <thead>
            <tr className="bg-teal-500 text-white text-md">
              <th className="p-4 text-left">Segment</th>
              {[
                { key: "revenue_current", label: "💰 CA (€)" },
                { key: "margin_current", label: "💵 Marge (€)" },
                { key: "quantity_sold_current", label: "📦 Quantité Vendue" },
              ].map(({ key, label }) => (
                <th key={key} className="p-4 text-right cursor-pointer" onClick={() => toggleSort(key as keyof SegmentationData[string])}>
                  <div className="flex justify-end items-center gap-2">
                    {label} {sortColumn === key ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                  </div>
                </th>
              ))}
              {/* ✅ Ajout de la colonne Détails */}
              <th className="p-4 text-center">Détails</th>
            </tr>
          </thead>
          <tbody>
  {sortedData.length === 0 ? (
    <tr>
      <td colSpan={7} className="text-center text-gray-500 p-4">Aucune donnée disponible.</td>
    </tr>
  ) : (
    sortedData.map(([key, values]) => {
      if (!values) return null; // ⚡ Empêche les erreurs

      

      // ✅ Génération de l'URL dynamique
      const normalizedTitle = normalizeTitle(title);
      console.log("🔗 normalizedTitle :", normalizedTitle);

      const segmentKey = segmentKeyMap[normalizedTitle] || null;

      console.log("🔗 segmentKey :", segmentKey);

      if (!segmentKey) return null;

      const segmentUrl = segmentKey ? `/segmentation?${segmentKey}=${encodeURIComponent(key)}` : "#";

      console.log("🔗 segment :", key);

      return (
        <React.Fragment key={key}>
          <tr className="border-b bg-gray-50 hover:bg-gray-200 transition">
            <td className="p-4 font-medium">
            <Link href={segmentUrl} passHref target="_blank" rel="noopener noreferrer">
              <div className="text-lg font-semibold flex items-center gap-3 px-3 py-2 rounded-md border border-teal-500 text-teal-700 bg-teal-50 hover:bg-teal-200 hover:border-teal-600 transition-all duration-200">
                <span>{key}</span>
                <FaChevronRight className="text-teal-600 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
            </td>

            {["revenue_current", "margin_current", "quantity_sold_current"].map((column) => {
              const currentValue = toNumber(values[column] || "0");
              const comparisonValue = toNumber(values[`${column.replace("_current", "_comparison")}`] || "0");
              const evolution = calculateEvolution(currentValue.toString(), comparisonValue.toString());

              return (
                <td key={column} className="p-4 text-right">
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-semibold text-gray-900">
                      {formatLargeNumber(currentValue)}
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      evolution !== "N/A" && parseFloat(evolution) < 0 ? "bg-red-400 text-white" : "bg-green-400 text-white"
                    }`}>
                      {evolution}
                    </span>
                  </div>
                </td>
              );
            })}

            <td className="p-4 text-center">
              <motion.button
                animate={{ rotate: expandedRows[key] ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => toggleDetails(key)}
                className="p-2 rounded-full bg-teal-600 flex items-center justify-center text-center"
              >
                {expandedRows[key] ? <FaChevronRight className="text-white text-lg" /> : <FaChevronRight className="text-white text-lg" />}
              </motion.button>
            </td>
          </tr>

          {expandedRows[key] && (
            <tr className="bg-gray-100">
              <td colSpan={7} className="p-4">
                {loadingSegments[key] ? (
                  <p className="text-gray-500">📊 Chargement des données...</p>
                ) : segmentData[key] ? (
                  <SegmentDetailTable
                    segmentName={key}
                    globalData={segmentData[key].global}
                    brandDetails={segmentData[key].brands}
                    selectedLab={filters.brands[0]}
                  />
                ) : (
                  <p className="text-gray-500 text-center">Aucune donnée disponible.</p>
                )}
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })
  )}
</tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SegmentationTable;