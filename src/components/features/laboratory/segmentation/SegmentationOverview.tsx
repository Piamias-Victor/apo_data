import Loader from "@/components/common/feedback/Loader";
import { useFilterContext } from "@/contexts/FilterContext";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import SegmentationTable from "./SegmentationTable";


// Define the SegmentationComparisonData type
interface SegmentationComparisonData {
  universe?: string;
  category?: string;
  family?: string;
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

// Import dynamique pour éviter les problèmes de SSR avec Plotly
const TreemapChart = dynamic(() => import("@/components/common/charts/TreemapChart"), { 
  ssr: false,
  loading: () => <Loader message="Chargement du graphique..." />
});

// Types des segments disponibles
const SEGMENT_TYPES = ["universe", "category", "family", "specificity"] as const;
type SegmentType = typeof SEGMENT_TYPES[number];

const SegmentationOverview: React.FC = () => {
  // États
  const [segmentationData, setSegmentationData] = useState<SegmentationComparisonData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [selectedLevel, setSelectedLevel] = useState<"universe" | "category" | "family">("universe");
  
  const { filters } = useFilterContext();

  // Récupération des données de segmentation
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

  // Fonction pour agréger les données par clé de segmentation
  const aggregateByKey = useCallback((key: keyof SegmentationComparisonData) => {
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

      // Agrégation des valeurs numériques
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

      // Calcul des évolutions
      acc[value].revenue_evolution = calculateEvolution(
        acc[value].revenue_current, 
        acc[value].revenue_comparison
      );
      
      acc[value].margin_evolution = calculateEvolution(
        acc[value].margin_current, 
        acc[value].margin_comparison
      );

      return acc;
    }, {} as Record<string, SegmentationComparisonData>);
  }, [segmentationData]);

  // Calcul d'évolution en pourcentage avec gestion des cas particuliers
  const calculateEvolution = (current: number, comparison: number): number => {
    if (comparison === 0) return current > 0 ? 100 : 0;
    return ((current - comparison) / Math.abs(comparison)) * 100;
  };

  // Transformation des données pour le Treemap
  const transformToTreemapData = useCallback((): TreemapDataProps => {
    const labels: string[] = [];
    const parents: string[] = [];
    const revenue: number[] = [];
    const margin: number[] = [];
    const quantity: number[] = [];

    // Stocker les valeurs agrégées par niveau
    const aggregatedData = new Map<string, { 
      revenue: number; 
      margin: number; 
      quantity: number; 
      parent: string 
    }>();

    // Hiérarchie : univers > category > family
    segmentationData.forEach((item) => {
      const { universe, category, family, revenue_current, margin_current, quantity_sold_current } = item;

      // Assurer des valeurs numériques valides
      const revenueNum = Number(revenue_current) || 0;
      const marginNum = Number(margin_current) || 0;
      const quantityNum = Number(quantity_sold_current) || 0;

      // Univers (Niveau 1 - Root)
      if (universe) {
        if (!aggregatedData.has(universe)) {
          aggregatedData.set(universe, { revenue: 0, margin: 0, quantity: 0, parent: "" });
        }
        const entry = aggregatedData.get(universe)!;
        entry.revenue += revenueNum;
        entry.margin += marginNum;
        entry.quantity += quantityNum;
      }

      // Catégorie (Niveau 2 - Parent = Univers)
      if (category) {
        if (!aggregatedData.has(category)) {
          aggregatedData.set(category, { revenue: 0, margin: 0, quantity: 0, parent: universe });
        }
        const entry = aggregatedData.get(category)!;
        entry.revenue += revenueNum;
        entry.margin += marginNum;
        entry.quantity += quantityNum;
      }

      // Famille (Niveau 3 - Parent = Catégorie)
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

    // Convertir les données agrégées en format pour le treemap
    aggregatedData.forEach((value, key) => {
      labels.push(key);
      parents.push(value.parent);
      revenue.push(value.revenue);
      margin.push(value.margin);
      quantity.push(value.quantity);
    });

    return { labels, parents, revenue, margin, quantity };
  }, [segmentationData]);

  // Configuration des segments à afficher
  const segmentConfigs = [
    { type: "universe", title: "🌍 Chiffre d'affaires par Univers", emoji: "🌍" },
    { type: "category", title: "📦 Chiffre d'affaires par Catégorie", emoji: "📦" },
    { type: "family", title: "👨‍👩‍👧 Chiffre d'affaires par Famille", emoji: "👨‍👩‍👧" },
    { type: "specificity", title: "🛠️ Chiffre d'affaires par Spécificité", emoji: "🛠️" },
  ];

  // Obtention des segments agrégés pour l'affichage
  const segmentData = segmentConfigs.map(config => ({
    title: config.title,
    data: aggregateByKey(config.type as keyof SegmentationComparisonData)
  }));

  // Toggle pour afficher/masquer les détails d'un tableau
  const toggleTableDetails = (title: string) => {
    setExpandedTables(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Gestion des états de chargement et d'erreur
  if (loading) return <Loader message="Chargement des données de segmentation..." />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!segmentationData || segmentationData.length === 0)
    return <p className="text-gray-500 text-center">Aucune donnée disponible.</p>;

  return (
    <div className="rounded-xl p-8 relative">
      {/* Titre principal */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        📊 <span>Segmentation des Ventes</span>
      </h2>

      {/* Graphique Treemap */}
      <div className="mb-8">
        <TreemapChart 
          {...transformToTreemapData()} 
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
        />
      </div>

      {/* Tableaux de segmentation */}
      <div className="space-y-6">
        {segmentData.map(({ title, data }) => (
          <div key={title} className="bg-gray-50 shadow-md rounded-lg p-4 relative border border-gray-200">
            {/* Bouton toggle */}
            <button
              className="absolute top-4 right-4 bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-teal-600 transition flex items-center gap-2"
              onClick={() => toggleTableDetails(title)}
            >
              {expandedTables[title] ? "Masquer" : "Afficher"} détails 
              {expandedTables[title] ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {/* Titre du tableau */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

            {/* Contenu du tableau avec animation */}
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