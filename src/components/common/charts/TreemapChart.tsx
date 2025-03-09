import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { formatLargeNumber } from "@/libs/formatUtils";
import { motion } from 'framer-motion';

interface TreeMapDataItem {
  id: string;
  name: string;
  parent: string;
  value: number;
  secondaryValue?: number;
  secondary_value?: string; // API peut retourner ce format
  level: "universe" | "category" | "subcategory" | "family" | "subfamily" | "product";
  metadata?: {
    evolution?: number;
    margin_rate?: number;
    quantity?: number;
  };
}

interface TreeMapChartProps {
  data: TreeMapDataItem[];
  isLoading: boolean;
  error: string | null;
  className?: string;
  valueType?: "revenue" | "margin" | "quantity";
  onNodeClick?: (node: any) => void;
  onValueTypeChange?: (type: "revenue" | "margin" | "quantity") => void;
}

const TreeMapChart: React.FC<TreeMapChartProps> = ({ 
  data, 
  isLoading, 
  error, 
  className = "",
  valueType = "revenue",
  onNodeClick,
  onValueTypeChange
}) => {
  // État local pour le drill-down si pas géré par le parent
  const [activeLevel, setActiveLevel] = React.useState<string>("");
  const [drilldownHistory, setDrilldownHistory] = React.useState<string[]>([]);

  // Filtrer les données en fonction du niveau actif
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (!activeLevel) {
      // Premier niveau seulement (universe)
      return data.filter(item => item.parent === "");
    }
    
    // Niveau avec le parent spécifié
    return data.filter(item => item.parent === activeLevel);
  }, [data, activeLevel]);

  // Ajouter des couleurs aux données en fonction de l'évolution
  const processedData = useMemo(() => {
    return filteredData.map((item) => {
      // Déterminer la couleur basée sur l'évolution
      let color = "#4db6ac"; // couleur par défaut
      
      if (item.metadata?.evolution !== undefined) {
        if (item.metadata.evolution >= 10) color = "#00897b"; // vert foncé (très positif)
        else if (item.metadata.evolution >= 0) color = "#4db6ac"; // vert clair (positif)
        else if (item.metadata.evolution >= -10) color = "#e57373"; // rouge clair (légèrement négatif)
        else color = "#e53935"; // rouge foncé (très négatif)
      }
      
      // Détermine la valeur à afficher selon le type sélectionné
      let displayValue: number;
      if (valueType === "revenue") {
        displayValue = item.value;
      } else if (valueType === "margin") {
        displayValue = item.secondaryValue || parseFloat(item.secondary_value || '0');
      } else { // quantity
        displayValue = item.metadata?.quantity || 0;
      }
      
      return {
        ...item,
        // S'assurer que la valeur est positive et numérique pour le TreeMap
        value: Math.max(0, displayValue),
        displayValue,
        fill: color
      };
    });
  }, [filteredData, valueType]);

  // Gérer le clic sur un nœud pour le drill-down
  const handleNodeClick = (node: any) => {
    if (!node || !node.id) return;
    
    if (onNodeClick) {
      // Si le parent gère la navigation
      onNodeClick(node);
    } else {
      // Gestion locale du drill-down
      setDrilldownHistory(prev => [...prev, activeLevel]);
      setActiveLevel(node.id);
    }
  };

  // Revenir au niveau précédent
  const handleBackClick = () => {
    if (drilldownHistory.length > 0) {
      const prevLevel = drilldownHistory[drilldownHistory.length - 1];
      setActiveLevel(prevLevel);
      setDrilldownHistory(prev => prev.slice(0, -1));
    } else {
      setActiveLevel("");
    }
  };

  // Réinitialiser la visualisation
  const handleResetClick = () => {
    setActiveLevel("");
    setDrilldownHistory([]);
  };

  // Composant personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
        <p className="font-bold text-gray-800 mb-1">{item.name}</p>
        <div className="space-y-1">
          <p className="flex justify-between">
            <span className="text-gray-600">
              {valueType === "revenue" ? "CA:" : 
               valueType === "margin" ? "Marge:" : 
               "Quantité:"}
            </span>
            <span className="font-medium text-gray-800">
              {formatLargeNumber(item.displayValue, valueType !== "quantity")}
            </span>
          </p>
          
          {item.metadata?.evolution !== undefined && (
            <p className="flex justify-between">
              <span className="text-gray-600">Évolution:</span>
              <span className={`font-medium ${
                item.metadata.evolution >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {item.metadata.evolution > 0 ? "+" : ""}
                {item.metadata.evolution.toFixed(1)}%
              </span>
            </p>
          )}
          
          {item.metadata?.margin_rate !== undefined && (
            <p className="flex justify-between">
              <span className="text-gray-600">Taux de marge:</span>
              <span className="font-medium text-gray-800">
                {item.metadata.margin_rate.toFixed(1)}%
              </span>
            </p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-t-teal-500 border-teal-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="text-red-500 p-4 border border-red-200 rounded-lg bg-red-50/50 backdrop-blur-sm">
          <p className="font-semibold">Erreur:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0 || processedData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-600 mb-2">Aucune donnée disponible</p>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Veuillez sélectionner d'autres filtres ou vérifier les données de segmentation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-sm p-6 ${className}`}
    >
      {/* Barre d'outils */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg text-gray-800">Segmentation hiérarchique</h3>
          
          {/* Navigation */}
          <div className="flex items-center text-sm mt-1">
            {drilldownHistory.length > 0 && (
              <button 
                onClick={handleBackClick}
                className="mr-2 text-teal-600 hover:text-teal-800 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
              </button>
            )}
            
            {activeLevel && (
              <button 
                onClick={handleResetClick}
                className="text-teal-600 hover:text-teal-800 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réinitialiser
              </button>
            )}
          </div>
        </div>
        
        {/* Contrôles de visualisation */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onValueTypeChange ? onValueTypeChange("revenue") : null}
            className={`px-4 py-2 text-sm rounded-lg shadow-sm transition-colors border ${
              valueType === "revenue"
                ? "bg-teal-500 text-white border-teal-600"
                : "bg-white text-gray-600 hover:bg-teal-50 border-gray-200"
            }`}
          >
            CA
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onValueTypeChange ? onValueTypeChange("margin") : null}
            className={`px-4 py-2 text-sm rounded-lg shadow-sm transition-colors border ${
              valueType === "margin"
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-white text-gray-600 hover:bg-blue-50 border-gray-200"
            }`}
          >
            Marge
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onValueTypeChange ? onValueTypeChange("quantity") : null}
            className={`px-4 py-2 text-sm rounded-lg shadow-sm transition-colors border ${
              valueType === "quantity"
                ? "bg-purple-500 text-white border-purple-600"
                : "bg-white text-gray-600 hover:bg-purple-50 border-gray-200"
            }`}
          >
            Quantité
          </motion.button>
        </div>
      </div>

      {/* Treemap */}
      <div className="w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm" style={{ height: 'calc(100% - 100px)', minHeight: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={processedData}
            dataKey="value"
            stroke="#fff"
            fill="#8884d8"
            onClick={handleNodeClick}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
            content={({ x, y, width, height, payload }) => {
              if (!payload || !x || !y || width < 5 || height < 5) {
                return null;
              }
              
              // Calculer la taille du texte en fonction de l'espace disponible
              const fontSize = Math.min(Math.max(width / 10, 8), 14);
              const showText = width > 40 && height > 30;
              
              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill: payload.fill || "#8884d8",
                      stroke: "#fff",
                      strokeWidth: 1,
                      cursor: "pointer"
                    }}
                  />
                  {showText && (
                    <>
                      <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fff"
                        fontSize={fontSize}
                        fontWeight="bold"
                        style={{
                          textShadow: "0px 0px 3px rgba(0,0,0,0.7)",
                          pointerEvents: "none",
                          textTransform: "uppercase"
                        }}
                      >
                        {payload.name}
                      </text>
                      {width > 70 && height > 60 && payload.metadata?.evolution !== undefined && (
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + fontSize + 4}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#fff"
                          fontSize={fontSize * 0.8}
                          style={{
                            textShadow: "0px 0px 3px rgba(0,0,0,0.7)",
                            pointerEvents: "none"
                          }}
                        >
                          {payload.metadata.evolution > 0 ? "+" : ""}
                          {payload.metadata.evolution.toFixed(1)}%
                        </text>
                      )}
                    </>
                  )}
                </g>
              );
            }}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      
      {/* Légende */}
      <div className="mt-4 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-teal-600 mr-2 rounded"></div>
            <span className="text-xs text-gray-600">Forte croissance (+10% et plus)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-teal-400 mr-2 rounded"></div>
            <span className="text-xs text-gray-600">Croissance (0% à +10%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 mr-2 rounded"></div>
            <span className="text-xs text-gray-600">Léger déclin (0% à -10%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 mr-2 rounded"></div>
            <span className="text-xs text-gray-600">Fort déclin (-10% et moins)</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 md:mt-0">
          {processedData.length} segment(s) • Cliquez pour explorer plus en détail
        </div>
      </div>
    </motion.div>
  );
};

export default TreeMapChart;