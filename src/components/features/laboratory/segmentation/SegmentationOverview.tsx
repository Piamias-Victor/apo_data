import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChartBar, HiCalendarDays, HiMagnifyingGlass, HiChevronDown, HiChevronUp, HiSparkles } from "react-icons/hi2";
import dynamic from "next/dynamic";
import Loader from "@/components/common/feedback/Loader";
import { useFilterContext } from "@/contexts/FilterContext";
import SectionTitle from "@/components/common/sections/SectionTitle";
import Separator from "@/components/common/sections/Separator";
import SegmentationTable from "./SegmentationTable";
import CollapsibleSection from "@/components/common/sections/CollapsibleSection";

// Interface pour les données de segmentation
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
  loading: () => <Loader message="Préparation du graphique..." color="teal" type="pulse" size="lg" />
});

// Types des segments disponibles
const SEGMENT_TYPES = ["universe", "category", "family", "specificity"] as const;
type SegmentType = typeof SEGMENT_TYPES[number];

/**
 * Composant principal de la vue Segmentation avec visualisation avancée des données
 */
const SegmentationOverview: React.FC = () => {
  // États
  const [segmentationData, setSegmentationData] = useState<SegmentationComparisonData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [selectedLevel, setSelectedLevel] = useState<"universe" | "category" | "family">("universe");
  
  const { filters } = useFilterContext();

  // Variantes d'animation pour le conteneur
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        duration: 0.6
      }
    }
  };

  // Variantes d'animation pour les éléments
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] // Courbe d'accélération Apple
      }
    }
  };

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
  const transformToTreemapData = useCallback(() => {
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
    { type: "universe", title: "Segmentation par Univers", emoji: "🌍" },
    { type: "category", title: "Segmentation par Catégorie", emoji: "📦" },
    { type: "family", title: "Segmentation par Famille", emoji: "👨‍👩‍👧" },
    { type: "specificity", title: "Segmentation par Spécificité", emoji: "🛠️" },
  ];

  // Obtention des segments agrégés pour l'affichage
  const segmentData = segmentConfigs.map(config => ({
    title: config.title,
    emoji: config.emoji,
    data: aggregateByKey(config.type as keyof SegmentationComparisonData)
  }));

  // Toggle pour afficher/masquer les détails d'un tableau
  const toggleTableDetails = (title: string) => {
    setExpandedTables(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return <Loader type="pulse" message="Analyse des données de segmentation en cours..." color="teal" size="lg" />;
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-red-50/90 backdrop-blur-sm rounded-xl border border-red-200 text-center shadow-sm"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">Erreur de chargement</h3>
        <p className="text-red-600">{error}</p>
      </motion.div>
    );
  }

  if (!segmentationData || segmentationData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-amber-50/90 backdrop-blur-sm rounded-xl border border-amber-200 text-center shadow-sm"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-amber-700 mb-2">Aucune donnée disponible</h3>
        <p className="text-amber-600">Nous n'avons pas trouvé de données de segmentation pour les critères sélectionnés.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-8xl mx-auto space-y-10"
    >
      {/* Titre de la section */}
      <motion.div variants={itemVariants}>
        <SectionTitle 
          emoji="🔍" 
          title="Analyse de Segmentation" 
          description="Visualisation détaillée des performances selon différents segments commerciaux"
          color="text-teal-600"
          emojiColor="text-yellow-400"
          withLine={true}
          align="center"
        />
      </motion.div>

      {/* Graphique Treemap */}
      <motion.div 
        variants={itemVariants}
        className="w-full rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
      >
        <div className="p-6 md:p-8 relative bg-gradient-to-br from-teal-50 to-blue-50 border-b border-teal-100/50">
          {/* Accent décoratif */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500 shadow-sm"></div>
          
          {/* Éléments de design de fond */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-5 left-20 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
          
          <div className="flex items-center relative z-10">
            <motion.div 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-100/80 text-teal-600 shadow-sm border border-teal-200/50 mr-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <HiChartBar className="w-6 h-6" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Visualisation des Segments
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-gray-500 text-sm mt-1"
              >
                Explorer visuellement la répartition des ventes par segment
              </motion.p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-white">
          <TreemapChart 
            {...transformToTreemapData()} 
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
          />
        </div>
      </motion.div>

      <Separator from="teal-400" via="blue-400" to="teal-500" />

      {/* Tableaux de segmentation */}
      <motion.div variants={itemVariants} className="space-y-8">
        {segmentData.map(({ title, emoji, data }) => (
          <CollapsibleSection 
            key={title}
            title={`${emoji} ${title}`}
            icon={<HiMagnifyingGlass className="w-5 h-5" />}
            buttonColorClass="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
            rounded="xl"
            shadowDepth="lg"
            transparentBackground={true}
            titleSize="lg"
            defaultCollapsed={true}
          >
            <SegmentationTable title={title} data={data} />
          </CollapsibleSection>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SegmentationOverview;