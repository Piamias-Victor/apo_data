import React, { useState } from "react";
import { FaSort, FaSortUp, FaSortDown, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { motion } from "framer-motion";
import SegmentationSalesStockChart from "./SegmentationSalesStockChart"; // ✅ Import du graphique
import { useFilterContext } from "@/contexts/FilterContext";

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
  const [salesStockData, setSalesStockData] = useState<Record<string, any[]>>({});
    const [loadingGraphs, setLoadingGraphs] = useState<Record<string, boolean>>({});
    const { filters } = useFilterContext();
    
    

    const normalizeTitle = (title: string): string => {
        return title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '') // Supprime les caractères spéciaux comme 📦
          .trim();
      };
      
      const segmentKeyMap: Record<string, string> = {
        "chiffre daffaires par famille": "family",
        "chiffre daffaires par univers": "universe",
        "chiffre daffaires par categorie": "category",
        "chiffre daffaires par sous-categorie": "sub_category",
        "chiffre daffaires par gamme": "range_name",
        "chiffre daffaires par specificite": "specificity",
      };
      
      const fetchSegmentSalesStock = async (segment: string) => {
        setLoadingGraphs((prev) => ({ ...prev, [segment]: true }));
      
        const normalizedTitle = normalizeTitle(title);
        const segmentKey = segmentKeyMap[normalizedTitle];
      
        if (!segmentKey) {
          console.error("❌ Erreur : Clé de segmentation invalide", title, "→", normalizedTitle);
          setLoadingGraphs((prev) => ({ ...prev, [segment]: false }));
          return;
        }
      
        try {
          const response = await fetch("/api/segmentation/getDetailSegmentation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              segment: segment, // ✅ Correction → Assigne bien le segment à envoyer
              type: segmentKey, // ✅ Correction → Envoie le bon type
              filters: filters, // ✅ Correction → Envoie bien `filters`, sans l'encapsuler
            }),
          });
      
          const result = await response.json();
      
          if (!response.ok) {
            console.error("❌ Erreur API:", result);
            throw new Error(result.error || "Erreur inconnue");
          }
      
          setSalesStockData((prev) => ({ ...prev, [segment]: result.salesStockData }));
        } catch (error) {
          console.error("❌ Erreur lors du chargement des données du graphique :", error);
        } finally {
          setLoadingGraphs((prev) => ({ ...prev, [segment]: false }));
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
  
      // ⚡ Appeler fetchSegmentSalesStock uniquement si on ouvre la ligne
      if (!prev[key] && !salesStockData[key]) {
        fetchSegmentSalesStock(key);
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
                { key: "quantity_purchased_current", label: "📥 Quantité Achetée" },
                { key: "purchase_amount_current", label: "💰 Montant Achats (€)" },
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
            {sortedData.map(([key, values]) => (
              <React.Fragment key={key}>
                {/* 📌 Ligne principale */}
                <tr className="border-b bg-gray-50 hover:bg-gray-200 transition">
                  <td className="p-4 font-medium">{key}</td>
                  {["revenue_current", "margin_current", "quantity_sold_current", "quantity_purchased_current", "purchase_amount_current"].map((column) => (
                    <td key={column} className="p-4 text-right">
                      <div className="flex flex-col items-center justify-center">
                        {/* Valeur actuelle */}
                        <span className="font-semibold text-gray-900">
                          {formatLargeNumber(toNumber(values[column]))}
                        </span>
                        {/* Évolution */}
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded-full ${
                            calculateEvolution(values[column], values[`${column.replace("_current", "_comparison")}`]) !== "N/A" &&
                            parseFloat(calculateEvolution(values[column], values[`${column.replace("_current", "_comparison")}`])) ?? 0 >= 0
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {calculateEvolution(values[column], values[`${column.replace("_current", "_comparison")}`])}
                        </span>
                      </div>
                    </td>
                  ))}
                  {/* ✅ Bouton Détails */}
                  <td className="p-4 text-center">
                    <motion.button
                        animate={{ rotate: expandedRows[key] ? 180 : 0 }} // ✅ Rotation correcte
                        transition={{ duration: 0.3 }}
                        onClick={() => toggleDetails(key)}
                        className="p-2 rounded-full bg-teal-600 flex items-center justify-center text-center"
                    >
                        {expandedRows[key] ? <FaChevronDown className="text-white text-lg" /> : <FaChevronRight className="text-white text-lg" />}
                    </motion.button>
                    </td>
                </tr>

                {/* 📌 Ligne de détails (visible si ouvert) */}
                {expandedRows[key] && (
                <tr className="bg-gray-100">
                    <td colSpan={7} className="p-4">
                    {loadingGraphs[key] ? (
                        <p className="text-gray-500">📊 Chargement des données...</p>
                    ) : salesStockData[key]?.length > 0 ? (
                        <SegmentationSalesStockChart salesStockData={salesStockData[key]} />
                    ) : (
                        <p className="text-gray-500 text-center">Aucune donnée disponible.</p>
                    )}
                    </td>
                </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SegmentationTable;