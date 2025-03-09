import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import SectionTitle from "@/components/common/sections/SectionTitle";
import PeriodSelector from "@/components/common/sections/PeriodSelector";
import Separator from "@/components/common/sections/Separator";
import { HiSparkles, HiMagnifyingGlass, HiArrowPath } from "react-icons/hi2";
import TreeMapChart from "@/components/common/charts/TreemapChart";

interface TreeMapDataItem {
  id: string;
  name: string;
  parent: string;
  value: number;
  secondaryValue?: number;
  color?: string;
  level: "universe" | "category" | "subcategory" | "family" | "subfamily" | "product";
  metadata?: {
    evolution?: number;
    margin_rate?: number;
    quantity?: number;
  };
}

interface TopPerformerItem {
  id: string;
  name: string;
  value: number;
  evolution: number;
  parent: string;
  level: string;
}

const SegmentationTreeMapPage: React.FC = () => {

  console.log('ici :')
  const { filters } = useFilterContext();
  const [treeMapData, setTreeMapData] = useState<TreeMapDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [valueType, setValueType] = useState<"revenue" | "margin" | "quantity">("revenue");
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Extraction des meilleurs performers pour affichage
  const topPerformers = React.useMemo(() => {
    // Filtrer pour ne garder que les éléments de niveau supérieur et trier par valeur
    const universeItems = treeMapData
      .filter(item => item.parent === "")
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Filtrer pour ne garder que les éléments avec une évolution positive
    const growthItems = treeMapData
      .filter(item => item.metadata?.evolution !== undefined && item.metadata.evolution > 0)
      .sort((a, b) => (b.metadata?.evolution || 0) - (a.metadata?.evolution || 0))
      .slice(0, 5);

    return { universeItems, growthItems };
  }, [treeMapData]);

  // Charger les données du TreeMap
  useEffect(() => {
    const fetchTreeMapData = async () => {
      if (
        !filters.distributors.length &&
        !filters.brands.length &&
        !filters.universes.length &&
        !filters.categories.length &&
        !filters.families.length &&
        !filters.specificities.length &&
        !filters.ean13Products.length
      ) {
        // Pas de filtres appliqués
        setTreeMapData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/segmentation/getTreeMapData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            filters,
            valueType 
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        console.log('data :', data);

        setTreeMapData(data.treeMapData || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des données TreeMap:", err);
        setError("Impossible de charger les données de segmentation");
      } finally {
        setLoading(false);
      }
    };

    fetchTreeMapData();
  }, [filters, valueType, refreshKey]);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

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

  // Rendu du top performer item
  const renderTopPerformerItem = (item: TreeMapDataItem, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-teal-100 hover:border-teal-300 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 text-white flex items-center justify-center shadow-sm">
        {index + 1}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
        <div className="flex items-center mt-1">
          <p className="text-xs text-gray-600">
            {valueType === "revenue" ? "CA: " : 
             valueType === "margin" ? "Marge: " : "Quantité: "}
            <span className="font-medium">
              {valueType === "quantity" 
                ? Math.round(item.value).toLocaleString() 
                : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.value)}
            </span>
          </p>
          {item.metadata?.evolution !== undefined && (
            <p className={`ml-2 text-xs font-medium ${
              item.metadata.evolution >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {item.metadata.evolution > 0 ? "+" : ""}
              {item.metadata.evolution.toFixed(1)}%
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-8 px-6 max-w-8xl mx-auto"
    >
      {/* En-tête */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <SectionTitle
          title="Analyse par Segmentation"
          description="Visualisation hiérarchique des données de vente par segments"
          emoji="📊"
          color="text-teal-600"
          align="left"
          withLine={true}
        />
        
        <div className="flex items-center gap-4">
          <PeriodSelector
            currentDateRange={filters.dateRange}
            comparisonDateRange={filters.comparisonDateRange}
            bgColor="bg-gradient-to-r from-teal-500 to-blue-500"
            hoverColor="hover:from-teal-600 hover:to-blue-600"
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            className="p-3 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-teal-600 hover:border-teal-200 transition-all"
            title="Rafraîchir les données"
          >
            <HiArrowPath className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Message d'instruction si aucun filtre n'est appliqué */}
      {!loading && !error && treeMapData.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="p-8 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl shadow-sm mb-8 max-w-2xl mx-auto text-center"
        >
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-4">
            <HiMagnifyingGlass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Sélectionnez un filtre</h3>
          <p className="text-blue-600">
            Pour visualiser les données de segmentation, veuillez sélectionner au moins un laboratoire, 
            une marque ou une catégorie dans les filtres.
          </p>
        </motion.div>
      )}

      {/* TreeMap principal */}
      <motion.div variants={itemVariants} className="mb-12">
        <TreeMapChart
          data={treeMapData}
          isLoading={loading}
          error={error}
          className="h-[650px]"
        />
      </motion.div>

      {/* Séparateur décoratif */}
      {treeMapData.length > 0 && !loading && !error && (
        <Separator from="teal-400" via="blue-400" to="purple-400" withDot={true} />
      )}

      {/* Top Performers & Statistiques */}
      {treeMapData.length > 0 && !loading && !error && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Top Segments */}
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center">
              <div className="p-2 rounded-full bg-teal-50 text-teal-500 mr-3">
                <HiSparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Top Segments</h3>
            </div>
            
            <div className="p-6 space-y-3">
              {topPerformers.universeItems.map((item, index) => renderTopPerformerItem(item, index))}
              
              {topPerformers.universeItems.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center p-4">
                  Aucune donnée disponible pour les segments.
                </p>
              )}
            </div>
          </div>
          
          {/* Top Croissance */}
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center">
              <div className="p-2 rounded-full bg-green-50 text-green-500 mr-3">
                <HiSparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Top Croissance</h3>
            </div>
            
            <div className="p-6 space-y-3">
              {topPerformers.growthItems.map((item, index) => renderTopPerformerItem(item, index))}
              
              {topPerformers.growthItems.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center p-4">
                  Aucune donnée disponible pour la croissance.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SegmentationTreeMapPage;