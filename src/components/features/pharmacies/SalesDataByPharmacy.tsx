import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PharmacySalesWithEvolution } from "@/hooks/api/usePharmacySalesData";
import { formatLargeNumber } from "@/libs/formatUtils";
import CollapsibleSection from "@/components/common/sections/CollapsibleSection";
import SortableTableHeader from "@/components/common/tables/SortableTableHeader";
import { 
  HiMagnifyingGlass, 
  HiArrowPath, 
  HiArrowTrendingUp, 
  HiArrowTrendingDown,
  HiUserGroup
} from "react-icons/hi2";

interface SalesDataByPharmacyProps {
  salesData: PharmacySalesWithEvolution[];
  loading: boolean;
  error: string | null;
}

const SalesDataByPharmacy: React.FC<SalesDataByPharmacyProps> = ({ 
  salesData, 
  loading, 
  error 
}) => {
  // États pour le tri et le filtrage
  const [sortColumn, setSortColumn] = useState<keyof PharmacySalesWithEvolution>("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showTrends, setShowTrends] = useState<boolean>(true);
  const [highlightBestPharmacy, setHighlightBestPharmacy] = useState<boolean>(true);

  // Configuration des colonnes
  const tableColumns = [
    { key: "pharmacy_name" as keyof PharmacySalesWithEvolution, label: "Pharmacie" },
    { key: "total_quantity" as keyof PharmacySalesWithEvolution, label: "Quantité Vendue" },
    { key: "revenue" as keyof PharmacySalesWithEvolution, label: "Chiffre d'Affaires (€)" },
    { key: "margin" as keyof PharmacySalesWithEvolution, label: "Marge (€)" },
    { key: "purchase_quantity" as keyof PharmacySalesWithEvolution, label: "Achats" },
    { key: "purchase_amount" as keyof PharmacySalesWithEvolution, label: "Montant Achats (€)" },
  ];

  // Gestion du tri des colonnes
  const toggleSort = (column: keyof PharmacySalesWithEvolution) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

// Recherche par pharmacie
const filteredData = useMemo(() => {
  return salesData.filter(data => {
    // Si le nom de la pharmacie est null ou vide, on considère que c'est "Pharmacie inconnue"
    const pharmacyName = data.pharmacy_name || "Pharmacie inconnue";
    return pharmacyName.toLowerCase().includes(searchTerm.toLowerCase());
  });
}, [salesData, searchTerm]);

  // Tri des données avec useMemo pour éviter des re-calculs inutiles
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortColumn === "pharmacy_name") {
        return sortOrder === "asc"
          ? a.pharmacy_name.localeCompare(b.pharmacy_name)
          : b.pharmacy_name.localeCompare(a.pharmacy_name);
      }
      
      // Gestion des valeurs nulles ou indéfinies
      const valA = a[sortColumn] ?? 0;
      const valB = b[sortColumn] ?? 0;
      
      return sortOrder === "asc" 
        ? Number(valA) - Number(valB) 
        : Number(valB) - Number(valA);
    });
  }, [filteredData, sortColumn, sortOrder]);

  // Métriques pour identifier les meilleures pharmacies
  const metrics = useMemo(() => {
    if (!salesData.length) return { best: {} };
    
    const bestRevenue = Math.max(...salesData.map(d => d.revenue || 0));
    const bestMargin = Math.max(...salesData.map(d => d.margin || 0));
    const bestQuantity = Math.max(...salesData.map(d => d.total_quantity || 0));

    return {
      best: { 
        revenue: bestRevenue, 
        margin: bestMargin,
        quantity: bestQuantity 
      }
    };
  }, [salesData]);

  // Rendu du contenu du tableau
  const renderTableContent = () => {
    if (loading) return (
      <div className="flex justify-center items-center p-12 bg-white/50 rounded-xl">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
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
        <p className="text-amber-600">Aucune pharmacie trouvée.</p>
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
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Rechercher une pharmacie..."
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
                  ? "bg-pink-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <HiArrowPath className={showTrends ? "text-white" : "text-gray-500"} />
              {showTrends ? "Masquer tendances" : "Afficher tendances"}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setHighlightBestPharmacy(!highlightBestPharmacy)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                highlightBestPharmacy 
                  ? "bg-rose-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <HiArrowTrendingUp className={highlightBestPharmacy ? "text-white" : "text-gray-500"} />
              {highlightBestPharmacy ? "Masquer surlignages" : "Surligner meilleures pharmacies"}
            </motion.button>
          </div>
        </div>
        
        {/* Tableau des données */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
          <table className="w-full border-collapse">
            <SortableTableHeader<PharmacySalesWithEvolution>
              columns={tableColumns}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSort={toggleSort}
              headerBgColor="bg-gradient-to-r from-pink-500 to-rose-500"
              headerHoverColor="hover:from-pink-600 hover:to-rose-600"
            />

            <tbody>
              {sortedData.map((data, index) => {
                // Déterminer si cette pharmacie est la meilleure en termes de CA, marge ou quantité
                const isBestRevenue = Math.abs(data.revenue - metrics.best.revenue) < 0.01;
                const isBestMargin = Math.abs(data.margin - metrics.best.margin) < 0.01;
                const isBestQuantity = Math.abs(data.total_quantity - metrics.best.quantity) < 0.01;
                const isHighlighted = highlightBestPharmacy && (isBestRevenue || isBestMargin || isBestQuantity);
                
                return (
                  <tr 
                    key={data.pharmacy_id || index} 
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      isHighlighted ? "bg-pink-50/70" : index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    {/* Colonne pharmacie */}
                    <td className="py-4 px-6 font-medium">
                      <div className="flex items-center">
                        <HiUserGroup className={`mr-2 ${isHighlighted ? "text-pink-500" : "text-gray-400"}`} />
                        <span className="whitespace-nowrap">
                          {data.pharmacy_name || "Pharmacie inconnue"}
                        </span>
                        {isHighlighted && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-pink-100 text-pink-700 rounded-full font-medium">
                            {isBestRevenue ? "Meilleur CA" : isBestMargin ? "Meilleure marge" : "Plus de ventes"}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Quantité */}
                    <td className={`py-4 px-6 text-center ${isBestQuantity && highlightBestPharmacy ? "font-semibold" : ""}`}>
                      <div className="flex flex-col items-center">
                        <div className={isBestQuantity && highlightBestPharmacy ? "text-pink-700" : ""}>
                          {formatLargeNumber(data.total_quantity, false)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={data.evolution.total_quantity} 
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne CA */}
                    <td className={`py-4 px-6 text-center ${isBestRevenue && highlightBestPharmacy ? "font-semibold" : ""}`}>
                      <div className="flex flex-col items-center">
                        <div className={isBestRevenue && highlightBestPharmacy ? "text-pink-700" : ""}>
                          {formatLargeNumber(data.revenue, true)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={data.evolution.revenue} 
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Marge */}
                    <td className={`py-4 px-6 text-center ${isBestMargin && highlightBestPharmacy ? "font-semibold" : ""}`}>
                      <div className="flex flex-col items-center">
                        <div className={isBestMargin && highlightBestPharmacy ? "text-pink-700" : ""}>
                          {formatLargeNumber(data.margin, true)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={data.evolution.margin} 
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Quantité Achat */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <div>
                          {formatLargeNumber(data.purchase_quantity, false)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={data.evolution.purchase_quantity} 
                          />
                        )}
                      </div>
                    </td>
                    
                    {/* Colonne Montant Achat */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <div>
                          {formatLargeNumber(data.purchase_amount, true)}
                        </div>
                        {showTrends && (
                          <RenderTrendBadge 
                            trend={data.evolution.purchase_amount} 
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
      title="Ventes par Pharmacie" 
      icon={<HiUserGroup className="w-5 h-5" />}
      buttonColorClass="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
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
 * Composant pour afficher la tendance par rapport à la période précédente
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

export default SalesDataByPharmacy;