import React, { useState, useMemo } from "react";
import Plot from "react-plotly.js";
import { motion } from "framer-motion";

interface TreemapChartProps {
  labels: string[];
  parents: string[];
  revenue: number[];
  margin: number[];
  quantity: number[];
}

const TreemapChart: React.FC<TreemapChartProps> = ({ labels, parents, revenue, margin, quantity }) => {
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "margin" | "quantity">("revenue");
  const [selectedLevel, setSelectedLevel] = useState<"universe" | "category" | "sub_category" | "family" | "sub_family" | "specificity">("universe");

  // 📊 Sélection des valeurs affichées
  const values = selectedMetric === "revenue" ? revenue : selectedMetric === "margin" ? margin : quantity;
  const metricLabel = selectedMetric === "revenue" ? "Chiffre d'Affaires (€)" : selectedMetric === "margin" ? "Marge (€)" : "Quantité vendue";

  // 📌 Extraction du **Top 5** basé sur `selectedLevel`
  const levelItems = useMemo(() => {
    // On filtre uniquement les éléments correspondant au niveau sélectionné
    const filteredItems = labels.map((label, index) => ({
      label,
      value: values[index],
      parent: parents[index],
    })).filter((item) => item.parent === "" || selectedLevel === "universe" || item.parent === selectedLevel);

    return filteredItems
      .sort((a, b) => b.value - a.value) // 🔽 Trie par valeur décroissante
      .slice(0, 5); // ✅ Garde le Top 5
  }, [selectedLevel, values]);

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
            margin: { t: 10, l: 0, r: 0, b: 0 },
          }}
          config={{ displayModeBar: false }}
        />
      </div>

      <div className="h-2 w-[10%]" />

      {/* 🎛️ Boutons et légende */}
      <div className="w-full flex md:flex-col space-x-4 md:space-x-0 md:space-y-4 justify-end md:justify-center mt-6 md:mt-0">
        <button
          onClick={() => setSelectedMetric("revenue")}
          className={`px-6 py-3 rounded-lg text-sm font-semibold shadow-md transition w-full md:w-auto ${
            selectedMetric === "revenue" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📊 Chiffre d'Affaires
        </button>
        <button
          onClick={() => setSelectedMetric("margin")}
          className={`px-6 py-3 rounded-lg text-sm font-semibold shadow-md transition w-full md:w-auto ${
            selectedMetric === "margin" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          💰 Marge
        </button>
        <button
          onClick={() => setSelectedMetric("quantity")}
          className={`px-6 py-3 rounded-lg text-sm font-semibold shadow-md transition w-full md:w-auto ${
            selectedMetric === "quantity" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📦 Quantité
        </button>

        {/* 📌 Légende dynamique */}
        <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md w-full md:w-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📌 {metricLabel} - Top 5 {selectedLevel}</h3>
          <ul className="space-y-2">
            {levelItems.map((item, index) => (
              <li key={index} className="flex justify-between text-gray-700">
                <span className="font-medium">{item.label}</span>
                <span className="font-semibold text-teal-700">{item.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>

          {/* 🔽 Sélecteur pour choisir le niveau */}
          <div className="mt-4">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm bg-white text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="universe">🌍 Univers</option>
              <option value="category">📦 Catégories</option>
              <option value="sub_category">📌 Sous-Catégories</option>
              <option value="family">👨‍👩‍👧 Familles</option>
              <option value="sub_family">👶 Sous-Familles</option>
              <option value="specificity">🛠️ Spécificités</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TreemapChart;