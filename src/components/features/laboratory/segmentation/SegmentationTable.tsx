import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaSortUp, FaSortDown, FaSort, FaChevronRight } from "react-icons/fa";

// Composants communs
import Loader from "@/components/common/feedback/Loader";
import SearchInput from "@/components/common/inputs/SearchInput";
import SegmentDetailTable from "./SegmentDetailTable";

// Contextes et utilitaires
import { useFilterContext } from "@/contexts/FilterContext";
import { formatLargeNumber } from "@/libs/formatUtils";

// Types
export interface SegmentationDataItem {
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
}

export interface SegmentationData {
  [key: string]: SegmentationDataItem;
}

interface SegmentColumn {
  key: keyof SegmentationDataItem;
  label: string;
  format?: (value: number) => string;
}

interface SegmentationTableProps {
  title: string;
  data: SegmentationData;
}

// Mappage entre les titres normalisés et les clés de segment
const SEGMENT_KEY_MAP: Record<string, string> = {
  "chiffre daffaires par famille": "family",
  "chiffre daffaires par univers": "universe",
  "chiffre daffaires par categorie": "category",
  "chiffre daffaires par sous-categorie": "sub_category",
  "chiffre daffaires par gamme": "range_name",
  "chiffre daffaires par specificite": "specificity",
  "chiffre daffaires par sous-famille": "sub_family",
};

/**
 * Composant de tableau de segmentation qui affiche les données de CA/Marge
 * avec une option pour afficher les détails pour chaque segment.
 */
const SegmentationTable: React.FC<SegmentationTableProps> = ({ title, data }) => {
  // ------------------- États -------------------
  const [sortColumn, setSortColumn] = useState<keyof SegmentationDataItem | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [segmentData, setSegmentData] = useState<Record<string, any>>({});
  const [loadingSegments, setLoadingSegments] = useState<Record<string, boolean>>({});
  
  const { filters } = useFilterContext();

  // ------------------- Fonctions utilitaires -------------------
  
  /**
   * Normalise le titre pour faciliter la correspondance avec les clés de segment
   */
  const normalizeTitle = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Enlève les caractères spéciaux sauf les espaces
      .replace(/\s+/g, ' ')     // Normalise les espaces
      .trim();
  }, []);
  
  /**
   * Convertit une valeur en nombre tout en gérant les formats particuliers
   */
  const toNumber = useCallback((value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
  }, []);
  
  /**
   * Calcule l'évolution en pourcentage entre deux valeurs
   */
  const calculateEvolution = useCallback((currentStr: string, comparisonStr: string): string => {
    const current = toNumber(currentStr);
    const comparison = toNumber(comparisonStr);
    
    if (comparison === 0) return current > 0 ? "+∞%" : "N/A";
    
    const evolution = ((current - comparison) / comparison) * 100;
    return `${evolution > 0 ? "+" : ""}${evolution.toFixed(1)}%`;
  }, [toNumber]);

  /**
   * Génère une URL de segment pour la navigation
   */
  const getSegmentUrl = useCallback((key: string): string => {
    const normalizedTitle = normalizeTitle(title);
    const segmentKey = SEGMENT_KEY_MAP[normalizedTitle];
    
    if (!segmentKey) return "#";
    return `/segmentation?${segmentKey}=${encodeURIComponent(key)}`;
  }, [title, normalizeTitle]);
  
  // ------------------- Handlers -------------------
  
  /**
   * Récupère les données détaillées pour un segment spécifique
   */
  const fetchSegmentData = useCallback(async (segment: string) => {
    setLoadingSegments((prev) => ({ ...prev, [segment]: true }));

    const normalizedTitle = normalizeTitle(title);
    const segmentKey = SEGMENT_KEY_MAP[normalizedTitle];
  
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
          comparisonDateRange: filters.comparisonDateRange,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la récupération des données");
      }
  
      const result = await response.json();
  
      // Stockage des données globales et par marque
      setSegmentData((prev) => ({
        ...prev,
        [segment]: {
          global: result.segmentData,
          brands: result.brandDetails,
        },
      }));
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données du segment :", error);
    } finally {
      setLoadingSegments((prev) => ({ ...prev, [segment]: false }));
    }
  }, [title, filters, normalizeTitle]);
  
  /**
   * Gère le tri par colonne
   */
  const toggleSort = useCallback((column: keyof SegmentationDataItem) => {
    setSortOrder(prev => (sortColumn === column ? (prev === "asc" ? "desc" : "asc") : "desc"));
    setSortColumn(column);
  }, [sortColumn]);
  
  /**
   * Gère l'expansion/réduction d'une ligne pour afficher les détails
   */
  const toggleDetails = useCallback((key: string) => {
    setExpandedRows((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
  
      // Chargement des données uniquement si la ligne est ouverte pour la première fois
      if (!prev[key] && !segmentData[key]) {
        fetchSegmentData(key);
      }
  
      return newState;
    });
  }, [fetchSegmentData, segmentData]);
  
  // ------------------- Données dérivées -------------------
  
  /**
   * Colonnes à afficher dans le tableau
   */
  const columns: SegmentColumn[] = useMemo(() => [
    { key: "revenue_current", label: "💰 CA (€)", format: (value) => formatLargeNumber(value, true) },
    { key: "margin_current", label: "💵 Marge (€)", format: (value) => formatLargeNumber(value, true) },
    { key: "quantity_sold_current", label: "📦 Quantité Vendue", format: (value) => formatLargeNumber(value, false) },
  ], []);
  
  /**
   * Données triées et filtrées selon les critères actuels
   */
  const sortedData = useMemo(() => {
    return Object.entries(data)
      .filter(([key]) => key.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort(([, a], [, b]) => {
        if (!sortColumn) return 0;
        const valA = toNumber(a[sortColumn]);
        const valB = toNumber(b[sortColumn]);
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
  }, [data, searchQuery, sortColumn, sortOrder, toNumber]);
  
  // ------------------- Animations -------------------
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const rowVariants = {
    collapsed: { opacity: 1 },
    expanded: { 
      opacity: 1,
      backgroundColor: "rgba(240, 253, 250, 0.5)",
      transition: { duration: 0.3 }
    }
  };
  
  const detailsVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: {
        height: { duration: 0.4 },
        opacity: { duration: 0.3, delay: 0.1 }
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3, delay: 0.1 }
      }
    }
  };
  
  // ------------------- Rendu -------------------
  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6 mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Barre de recherche */}
      <div className="flex justify-between items-center mb-6">
        <div className="mr-auto w-[35%]">
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="🔍 Rechercher un segment..." 
            accentColor="teal"
            variant="outlined"
          />
        </div>
      </div>

      {/* Tableau principal */}
      <div className="overflow-hidden border border-gray-200 shadow-lg rounded-lg">
        <table className="w-full border-collapse rounded-lg table-auto">
          {/* En-tête du tableau */}
          <thead>
            <tr className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-md">
              <th className="p-4 text-left rounded-tl-lg">Segment</th>
              {columns.map(({ key, label }) => (
                <th 
                  key={key} 
                  className="p-4 text-right cursor-pointer hover:bg-teal-600/80 transition-colors" 
                  onClick={() => toggleSort(key)}
                >
                  <div className="flex justify-end items-center gap-2">
                    {label} 
                    <motion.div animate={{ scale: sortColumn === key ? 1.1 : 1 }}>
                      {sortColumn === key 
                        ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) 
                        : <FaSort className="opacity-50" />
                      }
                    </motion.div>
                  </div>
                </th>
              ))}
              <th className="p-4 text-center rounded-tr-lg">Détails</th>
            </tr>
          </thead>
          
          {/* Corps du tableau */}
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 p-6 bg-gray-50">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p>Aucune donnée disponible ou correspondant à votre recherche</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map(([key, values]) => {
                if (!values) return null;

                const segmentUrl = getSegmentUrl(key);
                if (!segmentUrl || segmentUrl === "#") return null;
                
                const isExpanded = !!expandedRows[key];

                return (
                  <React.Fragment key={key}>
                    {/* Ligne principale avec données */}
                    <motion.tr 
                      className={`border-b transition-colors duration-300 ${isExpanded ? 'bg-teal-50/80' : 'bg-white hover:bg-gray-100'}`}
                      variants={rowVariants}
                      animate={isExpanded ? "expanded" : "collapsed"}
                    >
                      {/* Colonne Segment avec lien */}
                      <td className="p-4 font-medium">
                        <Link href={segmentUrl} passHref target="_blank" rel="noopener noreferrer">
                          <motion.div 
                            className="text-base font-semibold flex items-center gap-3 px-3 py-2 rounded-md border border-teal-500 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all duration-200 max-w-xs"
                            whileHover={{ 
                              scale: 1.02, 
                              boxShadow: "0 4px 12px rgba(20, 184, 166, 0.15)",
                              x: 2
                            }}
                          >
                            <span className="truncate">{key}</span>
                            <FaChevronRight className="flex-shrink-0 text-teal-600 transition-transform duration-200 group-hover:translate-x-1" />
                          </motion.div>
                        </Link>
                      </td>

                      {/* Colonnes de données avec évolution */}
                      {columns.map(({ key: colKey, format }) => {
                        const currentValue = toNumber(values[colKey] || "0");
                        const comparisonKey = colKey.replace("_current", "_comparison") as keyof SegmentationDataItem;
                        const comparisonValue = toNumber(values[comparisonKey] || "0");
                        const evolution = calculateEvolution(currentValue.toString(), comparisonValue.toString());
                        const isPositive = evolution !== "N/A" && !evolution.startsWith("-");

                        return (
                          <td key={colKey} className="p-4 text-right">
                            <div className="flex flex-col items-end justify-center">
                              <span className="font-semibold text-gray-900">
                                {format ? format(currentValue) : formatLargeNumber(currentValue, colKey !== "quantity_sold_current")}
                              </span>
                              <motion.span 
                                className={`text-xs mt-1 font-medium px-2 py-0.5 rounded-full text-white ${
                                  isPositive ? "bg-green-500" : "bg-red-500"
                                }`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                {evolution}
                              </motion.span>
                            </div>
                          </td>
                        );
                      })}

                      {/* Bouton détails */}
                      <td className="p-4 text-center">
                        <motion.button
                          animate={{ 
                            rotate: isExpanded ? 90 : 0,
                            backgroundColor: isExpanded ? "#0d9488" : "#0f766e"
                          }}
                          transition={{ duration: 0.3 }}
                          onClick={() => toggleDetails(key)}
                          className="p-2 rounded-full bg-teal-600 hover:bg-teal-700 shadow-md flex items-center justify-center text-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaChevronRight className="text-white text-sm" />
                        </motion.button>
                      </td>
                    </motion.tr>

                    {/* Ligne de détails (avec animation) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="p-0 overflow-hidden">
                            <motion.div
                              variants={detailsVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="p-4 border-t border-teal-100"
                            >
                              {loadingSegments[key] ? (
                                <Loader 
                                  message="Chargement des données du segment..." 
                                  color="teal" 
                                  size="medium" 
                                  type="spinner"
                                />
                              ) : segmentData[key] ? (
                                <SegmentDetailTable
                                  segmentName={key}
                                  globalData={segmentData[key].global}
                                  brandDetails={segmentData[key].brands}
                                  selectedLab={filters.brands[0]}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p>Aucune donnée disponible pour ce segment</p>
                                </div>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
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