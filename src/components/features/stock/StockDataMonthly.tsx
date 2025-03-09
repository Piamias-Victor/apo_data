import CollapsibleSection from "@/components/common/sections/CollapsibleSection";
import SortableTableHeader from "@/components/common/tables/SortableTableHeader";
import { formatLargeNumber } from "@/libs/formatUtils";
import { motion, AnimatePresence } from "framer-motion";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import React, { useState, useMemo } from "react";
import { 
  HiCalendarDays, 
  HiMagnifyingGlass, 
  HiArrowPath, 
  HiArrowTrendingUp, 
  HiArrowTrendingDown,
  HiArchiveBox
} from "react-icons/hi2";

interface StockSalesData {
  month: string;
  total_avg_stock: number;
  total_stock_value: number;
  total_quantity: number;
  total_revenue: number;
}

interface StockDataMonthlyProps {
  stockData: StockSalesData[];
  loading: boolean;
  error: string | null;
}

/**
 * Composant affichant les données de stock mensuelles sous forme de tableau interactif
 */
const StockDataMonthly: React.FC<StockDataMonthlyProps> = ({ stockData, loading, error }) => {
  // États pour le tri et le filtrage
  const [sortColumn, setSortColumn] = useState<keyof StockSalesData>("total_stock_value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showTrends, setShowTrends] = useState<boolean>(true);
  const [highlightBestMonth, setHighlightBestMonth] = useState<boolean>(true);

  // Configuration des colonnes
  const tableColumns = [
    { key: "month" as keyof StockSalesData, label: "Mois" },
    { key: "total_avg_stock" as keyof StockSalesData, label: "Stock Moyen" },
    { key: "total_stock_value" as keyof StockSalesData, label: "Valeur Stock (€)" },
    { key: "total_quantity" as keyof StockSalesData, label: "Quantité Vendue" },
    { key: "total_revenue" as keyof StockSalesData, label: "Chiffre d'Affaires (€)" },
  ];

  // Formater les noms de mois
  const formatMonthDisplay = (monthStr: string): string => {
    try {
      // Transformer "2025-03" en date puis en "Mars 2025"
      const date = parse(monthStr, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy', { locale: fr });
    } catch (error) {
      // Fallback si la date ne peut pas être parsée
      return monthStr;
    }
  };

  // Gestion du tri des colonnes
  const toggleSort = (column: keyof StockSalesData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  // Recherche par mois
  const filteredData = useMemo(() => {
    return stockData.filter(data => 
      formatMonthDisplay(data.month).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockData, searchTerm]);

  // Tri des données avec useMemo pour éviter des re-calculs inutiles
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortColumn === "month") {
        return sortOrder === "asc"
          ? a.month.localeCompare(b.month)
          : b.month.localeCompare(a.month);
      }
      
      // Gestion des valeurs nulles ou indéfinies
      const valA = a[sortColumn] ?? 0;
      const valB = b[sortColumn] ?? 0;
      
      return sortOrder === "asc" 
        ? Number(valA) - Number(valB) 
        : Number(valB) - Number(valA);
    });
  }, [filteredData, sortColumn, sortOrder]);

  // Métriques pour identifier les meilleurs et pires mois
  const metrics = useMemo(() => {
    if (!stockData.length) return { best: {}, worst: {} };
    
    const bestStockValue = Math.max(...stockData.map(d => d.total_stock_value || 0));
    const bestStockAvg = Math.max(...stockData.map(d => d.total_avg_stock || 0));
    
    const worstStockValue = Math.min(...stockData.filter(d => (d.total_stock_value || 0) > 0).map(d => d.total_stock_value || 0));
    const worstStockAvg = Math.min(...stockData.filter(d => (d.total_avg_stock || 0) > 0).map(d => d.total_avg_stock || 0));

    return {
      best: { stockValue: bestStockValue, stockAvg: bestStockAvg },
      worst: { stockValue: worstStockValue, stockAvg: worstStockAvg }
    };
  }, [stockData]);

  // Calcul des tendances mensuelles
  const calculateTrend = (current: number, index: number, data: StockSalesData[], key: keyof StockSalesData) => {
    if (index === 0) return null;
    const previous = data[index - 1][key];
    if (previous === undefined || current === undefined) return null;
    
    const prevVal = Number(previous);
    const currVal = Number(current);
    
    if (prevVal === 0) return null;
    return ((currVal - prevVal) / prevVal) * 100;
  };

  // Rendu du contenu du tableau
  const renderTableContent = () => {
    if (loading) return (
      <div className="flex justify-center items-center p-12 bg-white/50 rounded-xl">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );

    if (error) return (
      <div className="p-8 bg-red-50 rounded-xl text-center border border-red-200">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    );

    if (!sortedData || sortedData.length === 0) return (
      <div className="p-8 bg-amber-50 rounded-xl text-center border border-amber-200">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-amber-600">Aucune donnée disponible.</p>
      </div>
    );

    return (
      <>
        {/* Options de filtre et d'affichage */}
        <div className="bg-white p-4 mb-5 rounded-xl shadow-sm border border-gray-200/70 flex flex-col md:flex-row gap-4 justify-between">
          
          {/* Recherche */}
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiMagnifyingGlass className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Rechercher un mois..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Toggles d'affichage */}
          <div className="flex flex-wrap gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTrends(!showTrends)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                showTrends 
                  ? "bg-indigo-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <HiArrowPath className={showTrends ? "text-white" : "text-gray-500"} />
              {showTrends ? "Masquer tendances" : "Afficher tendances"}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setHighlightBestMonth(!highlightBestMonth)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                highlightBestMonth 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <HiArchiveBox className={highlightBestMonth ? "text-white" : "text-gray-500"} />
              {highlightBestMonth ? "Masquer surlignages" : "Surligner meilleurs mois"}
            </motion.button>
          </div>
        </div>
        
        {/* Tableau des données */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
          <table className="w-full border-collapse">
            <SortableTableHeader<StockSalesData>
              columns={tableColumns}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSort={toggleSort}
              headerBgColor="bg-gradient-to-r from-indigo-500 to-blue-500"
              headerHoverColor="hover:from-indigo-600 hover:to-blue-600"
            />

            <tbody>
              {sortedData.map((data, index) => {
                // Déterminer si ce mois est le meilleur en termes de stock
                const isBestStockValue = data.total_stock_value === metrics.best.stockValue;
                const isBestStockAvg = data.total_avg_stock === metrics.best.stockAvg;
                const isHighlighted = highlightBestMonth && (isBestStockValue || isBestStockAvg);
                
                // Formater le nom du mois pour affichage
                const formattedMonth = formatMonthDisplay(data.month);
                const [monthName, yearNumber] = formattedMonth.split(' ');
                const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                
                return (
                  <tr 
                    key={index} 
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      isHighlighted ? "bg-indigo-50/70" : index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    {/* Colonne mois */}
                    <td className="py-4 px-6 font-medium">
                      <div className="flex items-center">
                        <HiCalendarDays className={`mr-2 ${isHighlighted ? "text-indigo-500" : "text-gray-400"}`} />
                        <span className="whitespace-nowrap">{capitalizedMonth} {yearNumber}</span>
                        {isHighlighted && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium">
                            {isBestStockValue ? "Valeur max" : "Stock max"}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Stock Moyen */}
                    <td className={`py-4 px-6 text-center ${isBestStockAvg && highlightBestMonth ? "font-semibold" : ""}`}>
                      <div className="flex flex-col items-center">
                        <div className={isBestStockAvg && highlightBestMonth ? "text-indigo-700" : ""}>
                          {formatLargeNumber(data.total_avg_stock, false)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={calculateTrend(data.total_avg_stock, index, sortedData, 'total_avg_stock')} 
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Valeur du Stock */}
                    <td className={`py-4 px-6 text-center ${isBestStockValue && highlightBestMonth ? "font-semibold" : ""}`}>
                      <div className="flex flex-col items-center">
                        <div className={isBestStockValue && highlightBestMonth ? "text-indigo-700" : ""}>
                          {formatLargeNumber(data.total_stock_value, true)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={calculateTrend(data.total_stock_value, index, sortedData, 'total_stock_value')} 
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Quantité Vendue */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <div>
                          {formatLargeNumber(data.total_quantity, false)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={calculateTrend(data.total_quantity, index, sortedData, 'total_quantity')} 
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Chiffre d'Affaires */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <div>
                          {formatLargeNumber(data.total_revenue, true)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={calculateTrend(data.total_revenue, index, sortedData, 'total_revenue')} 
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <CollapsibleSection 
      title="Analyse Stock Mensuel" 
      icon={<HiArchiveBox className="w-5 h-5" />}
      buttonColorClass="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
      rounded="xl"
      shadowDepth="lg"
      transparentBackground={true}
      titleSize="lg"
      defaultCollapsed={false}
    >
      {renderTableContent()}
    </CollapsibleSection>
  );
};

/**
 * Composant pour afficher la tendance par rapport au mois précédent
 */
const RenderTrendBadge: React.FC<{ trend: number | null }> = ({ trend }) => {
  if (trend === null) return null;
  
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
          isPositive 
            ? "bg-green-50 text-green-600" 
            : isNeutral 
              ? "bg-gray-50 text-gray-500"
              : "bg-red-50 text-red-600"
        }`}
      >
        {isPositive ? (
          <>
            <HiArrowTrendingUp className="w-3 h-3" />
            +{trend.toFixed(1)}%
          </>
        ) : isNeutral ? (
          <>
            <span>⟷</span>
            0%
          </>
        ) : (
          <>
            <HiArrowTrendingDown className="w-3 h-3" />
            {trend.toFixed(1)}%
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default StockDataMonthly;