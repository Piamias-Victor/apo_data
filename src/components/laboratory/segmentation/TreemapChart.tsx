import React, { useState, useMemo } from "react";
import Plot from "react-plotly.js";
import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import Link from "next/link";

interface TreemapDataProps {
  labels: string[];
  parents: string[];
  revenue: number[];
  margin: number[];
  quantity: number[];
}

interface TreemapChartProps extends TreemapDataProps {
  selectedLevel: "universe" | "category" | "family";
  onLevelChange?: (level: "universe" | "category" | "family") => void;
}

const TreemapChart: React.FC<TreemapChartProps> = ({ 
  labels, 
  parents, 
  revenue, 
  margin, 
  quantity,
  selectedLevel,
  onLevelChange
}) => {
  // États
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "margin" | "quantity">("revenue");

  // Configuration des métriques
  const metricConfig = {
    revenue: {
      label: "Chiffre d'Affaires (€)",
      values: revenue,
      icon: "📊"
    },
    margin: {
      label: "Marge (€)",
      values: margin,
      icon: "💰"
    },
    quantity: {
      label: "Quantité vendue",
      values: quantity,
      icon: "📦"
    }
  };

  // Configuration des niveaux
  const levelConfig = {
    universe: {
      label: "Univers",
      filterFn: (item: any) => item.parent === "",
      icon: "🌍"
    },
    category: {
      label: "Catégorie",
      filterFn: (item: any, validUniverses: Set<string>) => validUniverses.has(item.parent),
      icon: "📦"
    },
    family: {
      label: "Famille",
      filterFn: (item: any, validCategories: Set<string>) => validCategories.has(item.parent),
      icon: "👨‍👩‍👧"
    }
  };

  // Valeurs à afficher basées sur la métrique sélectionnée
  const currentMetric = metricConfig[selectedMetric];

  // Extraction du Top 5 basé sur le niveau sélectionné
  const levelItems = useMemo(() => {
    // Mapper les données pour créer les objets à filtrer
    let items = labels.map((label, index) => ({
      label,
      value: currentMetric.values[index],
      parent: parents[index],
    }));

    // Filtrer en fonction du niveau sélectionné
    if (selectedLevel === "universe") {
      items = items.filter(levelConfig.universe.filterFn);
    } else if (selectedLevel === "category") {
      const validUniverses = new Set(labels.filter((_, index) => parents[index] === ""));
      items = items.filter(item => levelConfig.category.filterFn(item, validUniverses));
    } else if (selectedLevel === "family") {
      const validCategories = new Set(
        labels.filter((_, index) => parents[index] !== "" && parents[index] !== labels[index])
      );
      items = items.filter(item => levelConfig.family.filterFn(item, validCategories));
    }

    // Trier par valeur décroissante et prendre les 5 premiers
    return items
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [selectedLevel, currentMetric.values, labels, parents]);

  // Configuration du graphique Plotly
  const plotlyConfig = {
    data: [{
      type: "treemap",
      labels,
      parents,
      values: currentMetric.values,
      textinfo: "label+value",
      marker: { 
        colorscale: [
          [0, "#E0F2F1"],  
          [0.2, "#80CBC4"],
          [0.4, "#4DB6AC"],
          [0.6, "#26A69A"],
          [0.8, "#00897B"],
          [1, "#00695C"],  
        ],
        line: { width: 2, color: "#ffffff" }, 
      },
      hoverinfo: "label+value+percent parent"
    }],
    layout: {
      autosize: true,
      height: 650,
      width: "100%",
      paper_bgcolor: "rgba(255,255,255,0)",
      plot_bgcolor: "rgba(255,255,255,0)",
      margin: { t: 20, l: 0, r: 0, b: 0 }
    },
    config: { 
      displayModeBar: false,
      responsive: true
    }
  };

  return (
    <motion.div 
      className="w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row items-start bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Graphique Treemap */}
      <div className="w-full md:w-3/4">
        <Plot
          data={plotlyConfig.data}
          layout={plotlyConfig.layout}
          config={plotlyConfig.config}
          className="w-full"
        />
      </div>

      {/* Séparateur */}
      <div className="h-6 md:h-auto md:w-6" />

      {/* Contrôles et Top 5 */}
      <div className="w-full md:w-1/4 flex flex-col space-y-6 mt-6 md:mt-0">
        {/* Sélecteur de métrique */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Sélectionner une métrique</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(metricConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key as "revenue" | "margin" | "quantity")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedMetric === key 
                    ? "bg-teal-600 text-white shadow-md" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {config.icon} {key === "revenue" ? "CA" : key === "margin" ? "Marge" : "Quantité"}
              </button>
            ))}
          </div>
        </div>

        {/* Sélecteur de niveau */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Niveau d'analyse</h3>
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange?.(e.target.value as "universe" | "category" | "family")}
            className="w-full px-4 py-2 rounded-md border bg-white text-gray-700 font-medium focus:ring-2 focus:ring-teal-500 transition-shadow shadow-sm"
          >
            {Object.entries(levelConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.icon} {config.label}</option>
            ))}
          </select>
        </div>

        {/* Top 5 des éléments */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <h3 className="text-md font-semibold text-gray-900 mb-3">
            {currentMetric.icon} Top 5 {levelConfig[selectedLevel].label}
          </h3>
          <ul className="space-y-2">
            {levelItems.map((item, index) => {
              const segmentUrl = `/segmentation?${selectedLevel}=${encodeURIComponent(item.label)}`;

              return (
                <li key={index} className="p-3 bg-white text-sm rounded-md shadow-sm border border-gray-300 flex justify-between items-center">
                  <Link 
                    href={segmentUrl} 
                    passHref 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-teal-50 border border-teal-500 rounded-md font-medium text-teal-700 flex items-center justify-between w-3/4 hover:bg-teal-100 hover:border-teal-600 transition-all duration-200"
                  >
                    <span className="truncate">{item.label}</span>
                    <FaChevronRight className="text-teal-600 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <span className="text-xs font-medium text-gray-600">
                    {formatLargeNumber(item.value, selectedMetric === "quantity" ? false : true)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default TreemapChart;