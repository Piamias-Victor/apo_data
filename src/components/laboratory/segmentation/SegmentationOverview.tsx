import { useFilterContext } from "@/contexts/FilterContext";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import SegmentationTable from "./SegmentationTable";
import dynamic from "next/dynamic";
const TreemapChart = dynamic(() => import("@/components/laboratory/segmentation/TreemapChart"), { ssr: false });

interface SegmentationComparisonData {
  segment: string;
  universe: string;
  category: string;
  sub_category: string;
  range_name: string;
  family: string;
  sub_family: string;
  specificity: string;
  revenue_current: number;
  margin_current: number;
  revenue_comparison: number;
  margin_comparison: number;
  revenue_evolution: number;
  margin_evolution: number;
  quantity_sold_current: number;
  quantity_sold_comparison: number;
  quantity_purchased_current: number;
  quantity_purchased_comparison: number;
  purchase_amount_current: number;
  purchase_amount_comparison: number;
}

const SegmentationOverview: React.FC = () => {
  const [segmentationData, setSegmentationData] = useState<SegmentationComparisonData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilterContext();
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [selectedLevel, setSelectedLevel] = useState<"universe" | "category" | "sub_category" | "family" | "sub_family" | "specificity">("universe");

  useEffect(() => {
    const fetchSegmentationData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/segmentation/getLabRevenuePosition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des données");

        const data = await response.json();

        setSegmentationData(data.segmentationData);
      } catch (err) {
        setError("Impossible de récupérer les données.");
        console.error("❌ Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentationData();
  }, [filters]);

  if (loading) return <p className="text-gray-500 text-center">⏳ Chargement des données...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!segmentationData || segmentationData.length === 0)
    return <p className="text-gray-500 text-center">Aucune donnée disponible.</p>;

  // 🏗️ Fonction d'agrégation des données par segmentation
  const aggregateByKey = (key: keyof SegmentationComparisonData) => {
    return segmentationData.reduce((acc, data) => {
      const value = data[key] || "N/A";

      if (!acc[value]) {
        acc[value] = {
          revenue_current: 0,
          margin_current: 0,
          revenue_comparison: 0,
          margin_comparison: 0,
          revenue_evolution: 0,
          margin_evolution: 0,
          quantity_sold_current: 0,
          quantity_sold_comparison: 0,
          quantity_purchased_current: 0,
          quantity_purchased_comparison: 0,
          purchase_amount_current: 0,
          purchase_amount_comparison: 0,
        };
      }

      acc[value].revenue_current += data.revenue_current;
      acc[value].margin_current += data.margin_current;
      acc[value].revenue_comparison += data.revenue_comparison;
      acc[value].margin_comparison += data.margin_comparison;
      acc[value].quantity_sold_current += data.quantity_sold_current;
      acc[value].quantity_sold_comparison += data.quantity_sold_comparison;
      acc[value].quantity_purchased_current += data.quantity_purchased_current;
      acc[value].quantity_purchased_comparison += data.quantity_purchased_comparison;
      acc[value].purchase_amount_current += data.purchase_amount_current;
      acc[value].purchase_amount_comparison += data.purchase_amount_comparison;

      acc[value].revenue_evolution =
        ((acc[value].revenue_current - acc[value].revenue_comparison) / acc[value].revenue_comparison) * 100 || 0;
      acc[value].margin_evolution =
        ((acc[value].margin_current - acc[value].margin_comparison) / acc[value].margin_comparison) * 100 || 0;

      return acc;
    }, {} as Record<string, SegmentationComparisonData>);
  };

  // 📊 Agrégation des données pour chaque segmentation
  const revenueByUniverse = aggregateByKey("universe");
  const revenueByCategory = aggregateByKey("category");
  const revenueBySubCategory = aggregateByKey("sub_category");
  const revenueByFamily = aggregateByKey("family");
  const revenueBySubFamily = aggregateByKey("sub_family");
  const revenueBySpecificity = aggregateByKey("specificity");

  // 📌 Liste des segments à afficher
  const segments = [
    { title: "🌍 Chiffre d'affaires par Univers", data: revenueByUniverse },
    { title: "📦 Chiffre d'affaires par Catégorie", data: revenueByCategory },
    { title: "👨‍👩‍👧 Chiffre d'affaires par Famille", data: revenueByFamily },
    { title: "🛠️ Chiffre d'affaires par Spécificité", data: revenueBySpecificity },
  ];

  const transformToTreemapData = (data: SegmentationComparisonData[], selectedLevel: string) => {
    const labels: string[] = [];
    const parents: string[] = [];
    const revenue: number[] = [];
    const margin: number[] = [];
    const quantity: number[] = [];

    // 🔹 Stocker les valeurs agrégées par niveau
    const aggregatedData = new Map<string, { revenue: number; margin: number; quantity: number; parent: string }>();

    // 🌳 Hiérarchie : univers > category > family
    data.forEach((item) => {
        const { universe, category, family, revenue_current, margin_current, quantity_sold_current } = item;

        // ✅ Assurer que toutes les valeurs sont bien des nombres
        const revenueNum = Number(revenue_current) || 0;
        const marginNum = Number(margin_current) || 0;
        const quantityNum = Number(quantity_sold_current) || 0;

        // 🔹 Univers (Niveau 1 - Root)
        if (universe) {
            if (!aggregatedData.has(universe)) {
                aggregatedData.set(universe, { revenue: 0, margin: 0, quantity: 0, parent: "" });
            }
            const entry = aggregatedData.get(universe)!;
            entry.revenue += revenueNum;
            entry.margin += marginNum;
            entry.quantity += quantityNum;
        }

        // 🔹 Catégorie (Niveau 2 - Parent = Univers)
        if (category) {
            if (!aggregatedData.has(category)) {
                aggregatedData.set(category, { revenue: 0, margin: 0, quantity: 0, parent: universe });
            }
            const entry = aggregatedData.get(category)!;
            entry.revenue += revenueNum;
            entry.margin += marginNum;
            entry.quantity += quantityNum;
        }

        // 🔹 Famille (Niveau 3 - Parent = Catégorie)
        if (family) {
            if (!aggregatedData.has(family)) {
                aggregatedData.set(family, { revenue: 0, margin: 0, quantity: 0, parent: category });
            }
            const entry = aggregatedData.get(family)!;
            entry.revenue += revenueNum;
            entry.margin += marginNum;
            entry.quantity += quantityNum;
        }
    });

    // 🚀 Convertir en format lisible par le treemap
    aggregatedData.forEach((value, key) => {
        labels.push(key);
        parents.push(value.parent);
        revenue.push(value.revenue);
        margin.push(value.margin);
        quantity.push(value.quantity);
    });

    return { labels, parents, revenue, margin, quantity };
};

  return (
    <div className="rounded-xl p-8 relative">
      {/* 📌 Titre principal */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        📊 <span>Segmentation des Ventes</span>
      </h2>

      <div className="mb-4">
        <TreemapChart {...transformToTreemapData(segmentationData, selectedLevel)} selectedLevel={selectedLevel} />
      </div>

      {/* 🔹 Affichage des tableaux de segmentation */}
      <div className="space-y-4">
        {segments.map(({ title, data }) => (
          <div key={title} className="bg-gray-50 shadow-md rounded-lg p-4 relative border border-gray-200">
            {/* 🔹 Bouton "Afficher/Masquer" spécifique à chaque tableau */}
            <button
              className="absolute top-4 right-4 bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-teal-600 transition flex items-center gap-2"
              onClick={() => setExpandedTables((prev) => ({ ...prev, [title]: !prev[title] }))}
            >
              {expandedTables[title] ? "Masquer" : "Afficher"} détails {expandedTables[title] ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {/* 📌 Titre du tableau */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

            {/* 🔹 Contenu du tableau avec animation */}
            <AnimatePresence>
              {expandedTables[title] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <SegmentationTable title={title} data={data} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SegmentationOverview;