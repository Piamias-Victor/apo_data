import React, { useEffect, useState } from "react";
import {
  FaEuroSign,
  FaLayerGroup,
  FaFolderOpen,
  FaTag,
  FaCubes,
  FaChartPie,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion, AnimatePresence } from "framer-motion";
import { formatLargeNumber } from "@/libs/utils/formatUtils";

// Interface des données retournées par l'API
interface SegmentationRevenue {
  universe: string | null;
  category: string | null;
  sub_category: string | null;
  family: string | null;
  sub_family: string | null;
  specificity: string | null;
  revenue: number;
  global_revenue: number;
}

// Icônes par type de segmentation
const segmentationIcons: { [key: string]: React.ReactNode } = {
  universes: <FaLayerGroup className="text-2xl text-teal-600" />,
  categories: <FaFolderOpen className="text-2xl text-blue-600" />,
  subCategories: <FaTag className="text-2xl text-purple-600" />,
  families: <FaCubes className="text-2xl text-orange-600" />,
  subFamilies: <FaChartPie className="text-2xl text-pink-600" />,
  specificities: <FaEuroSign className="text-2xl text-red-600" />,
};

const SegmentationRevenueComponent: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0;

  const [segmentationRevenue, setSegmentationRevenue] = useState<SegmentationRevenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!hasSelectedLabs) return;

    const fetchSegmentationRevenue = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/sell-out/getSegmentationRevenue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur de récupération du CA");

        const data = await response.json();
        setSegmentationRevenue(data.segmentationRevenue);
      } catch (err) {
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentationRevenue();
  }, [filters]);

  if (!hasSelectedLabs) {
    return <p className="text-gray-500 text-center mt-4">Sélectionnez un laboratoire pour voir les données.</p>;
  }

  // ✅ Organiser les données par type de segmentation
  const groupedData: { [key: string]: Map<string, { revenue: number; global_revenue: number }> } = {
    universes: new Map(),
    categories: new Map(),
    subCategories: new Map(),
    families: new Map(),
    subFamilies: new Map(),
    specificities: new Map(),
  };

  segmentationRevenue.forEach(({ universe, category, sub_category, family, sub_family, specificity, revenue, global_revenue }) => {
    if (universe) {
      const existing = groupedData.universes.get(universe);
      groupedData.universes.set(universe, {
        revenue: (existing?.revenue || 0) + revenue,
        global_revenue: (existing?.global_revenue || 0) + global_revenue,
      });
    }
  
    if (category) {
      const existing = groupedData.categories.get(category);
      groupedData.categories.set(category, {
        revenue: (existing?.revenue || 0) + revenue,
        global_revenue: (existing?.global_revenue || 0) + global_revenue,
      });
    }
  
    if (sub_category) {
      const existing = groupedData.subCategories.get(sub_category);
      groupedData.subCategories.set(sub_category, {
        revenue: (existing?.revenue || 0) + revenue,
        global_revenue: (existing?.global_revenue || 0) + global_revenue,
      });
    }
  
    if (family) {
      const existing = groupedData.families.get(family);
      groupedData.families.set(family, {
        revenue: (existing?.revenue || 0) + revenue,
        global_revenue: (existing?.global_revenue || 0) + global_revenue,
      });
    }
  
    if (sub_family) {
      const existing = groupedData.subFamilies.get(sub_family);
      groupedData.subFamilies.set(sub_family, {
        revenue: (existing?.revenue || 0) + revenue,
        global_revenue: (existing?.global_revenue || 0) + global_revenue,
      });
    }
  
    if (specificity) {
      const existing = groupedData.specificities.get(specificity);
      groupedData.specificities.set(specificity, {
        revenue: (existing?.revenue || 0) + revenue,
        global_revenue: (existing?.global_revenue || 0) + global_revenue,
      });
    }
  });


  // Fonction pour gérer l'affichage des détails
  const toggleCollapse = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* 📌 Loader */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-40">
          <div className="border-t-4 border-teal-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
          <span className="text-teal-600 mt-2">Chargement des données...</span>
        </div>
      )}

      {/* ❌ Erreur */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* 📌 Affichage des données sous forme de cartes déroulantes */}
      {!loading && !error && segmentationRevenue.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedData).map(([key, dataMap]) => (
            <motion.div
              key={key}
              className="p-5 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-start text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {segmentationIcons[key]} {/* Icône */}
              <h3 className="text-lg font-semibold text-gray-700 mt-3">{key.toUpperCase()}</h3>

              {/* Bouton d'affichage des détails */}
              <button
                onClick={() => toggleCollapse(key)}
                className="text-teal-600 hover:text-teal-800 transition flex items-center gap-2 mt-2"
              >
                {expandedSections[key] ? "Masquer les détails" : "Afficher les détails"}
                {expandedSections[key] ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {/* Affichage conditionnel des détails */}
              <AnimatePresence>
                {expandedSections[key] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full mt-3"
                  >
                    {Array.from(dataMap.entries()).map(([name, { revenue, global_revenue }]) => {

const revenueNumber = parseFloat(revenue) || 0;
const globalRevenueNumber = parseFloat(global_revenue) || 0;

const percentage = globalRevenueNumber > 0 ? (revenueNumber / globalRevenueNumber) * 100 : 0;

  return (
    <div key={name} className="mt-2 w-full p-2 bg-gray-50 rounded-lg">
  <div className="flex justify-between items-center gap-1">
    <span className="text-sm text-gray-700 truncate">{name}</span>
    <div className="flex justify-end items-center gap-1 whitespace-nowrap">
  <span className="text-sm text-teal-600 font-semibold">
    {formatLargeNumber(revenue, true)}
  </span>
  <span className="text-sm text-gray-500 font-semibold">/</span>
  <span className="text-sm text-blue-600 font-semibold">
    {formatLargeNumber(global_revenue, true)}
  </span>
</div>
  </div>
  
  {/* ✅ Affichage du pourcentage */}
  <div className="text-xs text-gray-500">
    {globalRevenueNumber > 0 ? `${percentage.toFixed(2)}% du segment` : "0% du segment"}
  </div>

  {/* ✅ Barre de progression */}
  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
    <div
      className="bg-teal-600 h-2 rounded-full"
      style={{
        width: globalRevenueNumber > 0 ? `${percentage}%` : "0%",
      }}
    ></div>
  </div>
</div>
  );
})}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SegmentationRevenueComponent;