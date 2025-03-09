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
  HiExclamationTriangle
} from "react-icons/hi2";

interface StockBreakData {
  month: string;
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
}

interface StockBreakDataMonthlyProps {
  stockBreakData: StockBreakData[];
  loading: boolean;
  error: string | null;
}

/**
 * Composant affichant les données de ruptures mensuelles sous forme de tableau interactif
 */
const StockBreakDataMonthly: React.FC<StockBreakDataMonthlyProps> = ({ stockBreakData, loading, error }) => {
  // États pour le tri et le filtrage
  const [sortColumn, setSortColumn] = useState<keyof StockBreakData>("stock_break_amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showTrends, setShowTrends] = useState<boolean>(true);
  const [highlightWorstMonth, setHighlightWorstMonth] = useState<boolean>(true);

  // Configuration des colonnes
  const tableColumns = [
    { key: "month" as keyof StockBreakData, label: "Mois" },
    { key: "total_products_ordered" as keyof StockBreakData, label: "Produits Commandés" },
    { key: "stock_break_products" as keyof StockBreakData, label: "Produits en Rupture" },
    { key: "stock_break_rate" as keyof StockBreakData, label: "Taux de Rupture (%)" },
    { key: "stock_break_amount" as keyof StockBreakData, label: "Montant des Ruptures (€)" },
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
  const toggleSort = (column: keyof StockBreakData) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  // Recherche par mois
  const filteredData = useMemo(() => {
    return stockBreakData.filter(data => 
      formatMonthDisplay(data.month).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockBreakData, searchTerm]);

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

  // Métriques pour identifier les pires mois (ceux avec le plus de ruptures)
  const metrics = useMemo(() => {
    if (!stockBreakData.length) return { worst: {} };
    
    const worstBreakRate = Math.max(...stockBreakData.map(d => d.stock_break_rate || 0));
    const worstBreakAmount = Math.max(...stockBreakData.map(d => d.stock_break_amount || 0));
    const worstBreakProducts = Math.max(...stockBreakData.map(d => d.stock_break_products || 0));

    return {
      worst: { 
        rate: worstBreakRate, 
        amount: worstBreakAmount,
        products: worstBreakProducts
      }
    };
  }, [stockBreakData]);

  // Calcul des tendances mensuelles
  const calculateTrend = (current: number, index: number, data: StockBreakData[], key: keyof StockBreakData) => {
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
          <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full"></div>
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
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  ? "bg-red-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <HiArrowPath className={showTrends ? "text-white" : "text-gray-500"} />
              {showTrends ? "Masquer tendances" : "Afficher tendances"}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setHighlightWorstMonth(!highlightWorstMonth)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                highlightWorstMonth 
                  ? "bg-orange-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <HiExclamationTriangle className={highlightWorstMonth ? "text-white" : "text-gray-500"} />
              {highlightWorstMonth ? "Masquer surlignages" : "Surligner pires mois"}
            </motion.button>
          </div>
        </div>
        
        {/* Tableau des données */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
          <table className="w-full border-collapse">
            <SortableTableHeader<StockBreakData>
              columns={tableColumns}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSort={toggleSort}
              headerBgColor="bg-gradient-to-r from-red-500 to-orange-500"
              headerHoverColor="hover:from-red-600 hover:to-orange-600"
            />

            <tbody>
              {sortedData.map((data, index) => {
                // Déterminer si ce mois est le pire en termes de ruptures
                const isWorstRate = Math.abs(data.stock_break_rate - metrics.worst.rate) < 0.01; // Utilisation d'une comparaison approximative pour éviter les problèmes de précision
                const isWorstAmount = Math.abs(data.stock_break_amount - metrics.worst.amount) < 0.01;
                const isWorstProducts = Math.abs(data.stock_break_products - metrics.worst.products) < 0.01;
                const isHighlighted = highlightWorstMonth && (isWorstRate || isWorstAmount || isWorstProducts);
                
                // Formater le nom du mois pour affichage
                const formattedMonth = formatMonthDisplay(data.month);
                const [monthName, yearNumber] = formattedMonth.split(' ');
                const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                
                return (
                  <tr 
                    key={index} 
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      isHighlighted ? "bg-red-50/70" : index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    {/* Colonne mois */}
                    <td className="py-4 px-6 font-medium">
                      <div className="flex items-center">
                        <HiCalendarDays className={`mr-2 ${isHighlighted ? "text-red-500" : "text-gray-400"}`} />
                        <span className="whitespace-nowrap">{capitalizedMonth} {yearNumber}</span>
                        {isHighlighted && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                            {isWorstRate 
                              ? "Pire taux" 
                              : isWorstAmount 
                                ? "Montant max" 
                                : "Nb ruptures max"}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Produits Commandés */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <div className="font-medium">
                          {formatLargeNumber(data.total_products_ordered, false)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={calculateTrend(data.total_products_ordered, index, sortedData, 'total_products_ordered')} 
                            inversed={false}
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Produits en Rupture */}
                    <td className={`py-4 px-6 text-center ${isWorstProducts && highlightWorstMonth ? "font-semibold" : ""}`}>
                      <div className="flex flex-col items-center">
                        <div className={isWorstProducts && highlightWorstMonth ? "text-red-700" : ""}>
                          {formatLargeNumber(data.stock_break_products, false)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={calculateTrend(data.stock_break_products, index, sortedData, 'stock_break_products')} 
                            inversed={true}
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Taux de Rupture */}
                    <td className={`py-4 px-6 text-center ${isWorstRate && highlightWorstMonth ? "font-semibold" : ""}`}>
                      <div className="flex flex-col items-center">
                        <div className={isWorstRate && highlightWorstMonth ? "text-red-700" : ""}>
                          {data.stock_break_rate}%
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={calculateTrend(data.stock_break_rate, index, sortedData, 'stock_break_rate')} 
                            inversed={true}
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Montant des Ruptures */}
                    <td className={`py-4 px-6 text-center ${isWorstAmount && highlightWorstMonth ? "font-semibold" : ""}`}>
                      <div className="flex flex-col items-center">
                        <div className={isWorstAmount && highlightWorstMonth ? "text-red-700" : ""}>
                          {formatLargeNumber(data.stock_break_amount, true)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={calculateTrend(data.stock_break_amount, index, sortedData, 'stock_break_amount')} 
                            inversed={true}
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
      title="Analyse des Ruptures Mensuelles" 
      icon={<HiExclamationTriangle className="w-5 h-5" />}
      buttonColorClass="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
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
 * Pour les ruptures, une tendance positive = mauvais, négative = bon (d'où le paramètre inversed)
 */
const RenderTrendBadge: React.FC<{ trend: number | null, inversed: boolean }> = ({ trend, inversed }) => {
  if (trend === null) return null;
  
  // Pour les ruptures, une hausse est négative et une baisse est positive
  const isPositive = inversed ? trend < 0 : trend > 0;
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
            {inversed ? "" : "+"}
            {Math.abs(trend).toFixed(1)}%
          </>
        ) : isNeutral ? (
          <>
            <span>⟷</span>
            0%
          </>
        ) : (
          <>
            <HiArrowTrendingDown className="w-3 h-3" />
            {!inversed ? "" : "+"}
            {Math.abs(trend).toFixed(1)}%
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default StockBreakDataMonthly;