import React, { useState, useMemo, useEffect } from "react";
import Plot from "react-plotly.js";
import { motion } from "framer-motion";
import { FaChartPie, FaChevronRight } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import Link from "next/link";

interface TreemapChartProps {
  labels: string[];
  parents: string[];
  revenue: number[];
  margin: number[];
  quantity: number[];
}

const TreemapChart: React.FC<TreemapChartProps> = ({ labels, parents, revenue, margin, quantity }) => {
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "margin" | "quantity">("revenue");
  const [selectedLevel, setSelectedLevel] = useState<"universe" | "category" | "family">("universe");

  // 📌 Sélection des valeurs affichées
  const values = selectedMetric === "revenue" ? revenue : selectedMetric === "margin" ? margin : quantity;
  const metricLabel = selectedMetric === "revenue" ? "Chiffre d'Affaires (€)" : selectedMetric === "margin" ? "Marge (€)" : "Quantité vendue";

  // 🔹 Traduction des niveaux
  const levelTranslations: Record<string, string> = {
    universe: "Univers",
    category: "Catégorie",
    family: "Famille",
  };

  // 📌 Extraction du **Top 5** basé sur `selectedLevel`
  const levelItems = useMemo(() => {
    let filteredItems = labels.map((label, index) => ({
      label,
      value: values[index],
      parent: parents[index],
    }));

    if (selectedLevel === "universe") {
      filteredItems = filteredItems.filter((item) => item.parent === "");
    } else if (selectedLevel === "category") {
      const validUniverses = new Set(labels.filter((_, index) => parents[index] === ""));
      filteredItems = filteredItems.filter((item) => validUniverses.has(item.parent));
    } else if (selectedLevel === "family") {
      const validCategories = new Set(labels.filter((_, index) => parents[index] !== "" && parents[index] !== labels[index]));
      filteredItems = filteredItems.filter((item) => validCategories.has(item.parent));
    }

    return filteredItems.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [selectedLevel, values, labels, parents]);

  return (
    <motion.div 
      className="w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row items-start bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 📊 Graphique Treemap */}
      <div className="w-full">
        <Plot
          data={[
            {
              type: "treemap",
              labels: labels,
              parents: parents,
              values: values,
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
              hoverinfo: "label+value+percent parent",
            },
          ]}
          layout={{
            autosize: true,
            height: 650,
            width: "100%",
            paper_bgcolor: "rgba(255,255,255,0)",
            plot_bgcolor: "rgba(255,255,255,0)",
            margin: { t: 20, l: 0, r: 0, b: 0 },
          }}
          config={{ displayModeBar: false }}
        />
      </div>

      <div className="h-2 w-[10%]" />

      {/* 🎛️ Boutons et légende avec TOP 5 */}
      <div className="w-full flex flex-col space-y-4 justify-end mt-6 md:mt-0">
        {/* 📌 Sélecteur pour la métrique */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedMetric("revenue")}
            className={`px-4 py-2 rounded-md font-semibold ${selectedMetric === "revenue" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            📊 CA
          </button>
          <button
            onClick={() => setSelectedMetric("margin")}
            className={`px-4 py-2 rounded-md font-semibold ${selectedMetric === "margin" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            💰 Marge
          </button>
          <button
            onClick={() => setSelectedMetric("quantity")}
            className={`px-4 py-2 rounded-md font-semibold ${selectedMetric === "quantity" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            📦 Quantité
          </button>
        </div>

        <div className="mt-4">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as "universe" | "category" | "family")}
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-700 font-semibold focus:ring-2 focus:ring-teal-500"
            >
              <option value="universe">🌍 Univers</option>
              <option value="category">📦 Catégorie</option>
              <option value="family">👨‍👩‍👧 Famille</option>
            </select>
          </div>

        {/* 📌 Légende dynamique - Top 5 */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📌 {metricLabel} - Top 5 {levelTranslations[selectedLevel]}</h3>
          <ul className="space-y-2">
            {levelItems.map((item, index) => {
              const segmentUrl = `/segmentation?${selectedLevel}=${encodeURIComponent(item.label)}`;

              return (
                <li key={index} className="p-4 bg-white  text-sm rounded-md shadow-md border border-gray-300 flex justify-between items-center gap-1">
                  <Link href={segmentUrl} passHref target="_blank" rel="noopener noreferrer">
  <div className="p-3 bg-teal-50 border border-teal-500 rounded-md font-semibold text-teal-700 flex items-center justify-between cursor-pointer hover:bg-teal-100 hover:border-teal-600 transition-all duration-200">
    <span>{item.label}</span>
    <FaChevronRight className="text-teal-600 transition-transform duration-200 group-hover:translate-x-1" />
  </div>
</Link>

<p className="text-xs font-medium text-gray-600">{formatLargeNumber(item.value)}</p>
                </li>
              );
            })}
          </ul>

          {/* 🔽 Sélecteur du niveau */}
        </div>
      </div>
    </motion.div>
  );
};

export default TreemapChart;