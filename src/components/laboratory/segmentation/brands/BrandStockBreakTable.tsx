import Loader from "@/components/ui/Loader";
import { useFilterContext } from "@/contexts/FilterContext";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { useState, useEffect, useMemo } from "react";
import { FaChevronRight, FaSort } from "react-icons/fa";
import StockBreakDataComponent from "../../global/break/StockBreakDataComponent";
import { motion } from "framer-motion";
import React from "react";
import ProductBreakChart from "../../break/ProductBreakChart";


interface BrandStockBreak {
  brand_lab: string;
  total_quantity_sold: number;
  total_orders: number;
  total_quantity_ordered: number;
  total_stock_break_quantity: number;
  total_stock_break_amount: number;
  stock_break_rate: number; // ✅ Ajout du taux de rupture (%)
}

const BrandStockBreakTable: React.FC = () => {
  const { filters } = useFilterContext();
  const [ruptures, setRuptures] = useState<BrandStockBreak[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof BrandStockBreak | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [brandBreakData, setBrandBreakData] = useState<{ 
    [key: string]: { 
      month: string; 
      total_quantity_sold: number; 
      total_quantity_ordered: number; 
      total_stock_break_quantity: number; 
      total_stock_break_amount: number; 
    }[] 
  }>({});
  
  const hasSelectedData =
    filters.distributors.length > 0 ||
    filters.brands.length > 0 ||
    filters.universes.length > 0 ||
    filters.categories.length > 0 ||
    filters.families.length > 0 ||
    filters.specificities.length > 0;

  // 📌 Traduction des colonnes
  const columnHeaders: { [key in keyof BrandStockBreak]: string } = {
    brand_lab: "Marque",
    total_quantity_sold: "Quantité Vendue",
    total_orders: "Commandes",
    total_quantity_ordered: "Quantité Commandée",
    total_stock_break_quantity: "Rupture (Qté)",
    total_stock_break_amount: "Rupture (€)",
    stock_break_rate: "% Rupture", // ✅ Ajout pour affichage dans l'en-tête
  };

  // 🚀 **Appel API pour récupérer les ruptures par marque**
  useEffect(() => {
    const fetchBrandBreaks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/segmentation/getBrandsBreakData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });
  
        if (!response.ok) throw new Error("Erreur lors de la récupération des ruptures");
  
        const data = await response.json();
  
        // 🔹 Regroupement des ruptures par marque
        const aggregatedData = data.ruptures.reduce((acc: Record<string, BrandStockBreak>, rupture: BrandStockBreak) => {
          const brand = rupture.brand_lab;

          if (!acc[brand]) {
            acc[brand] = {
              brand_lab: brand,
              total_quantity_sold: Number(rupture.total_quantity_sold) || 0,
              total_orders: Number(rupture.total_orders) || 0,
              total_quantity_ordered: Number(rupture.total_quantity_ordered) || 0,
              total_stock_break_quantity: Number(rupture.total_stock_break_quantity) || 0,
              total_stock_break_amount: Number(rupture.total_stock_break_amount) || 0,
            };
          } else {
            acc[brand].total_quantity_sold += Number(rupture.total_quantity_sold) || 0;
            acc[brand].total_orders += Number(rupture.total_orders) || 0;
            acc[brand].total_quantity_ordered += Number(rupture.total_quantity_ordered) || 0;
            acc[brand].total_stock_break_quantity += Number(rupture.total_stock_break_quantity) || 0;
            acc[brand].total_stock_break_amount += Number(rupture.total_stock_break_amount) || 0;
          }

          return acc;
        }, {});
  
        // 🔹 Stockage des données pour le graphique des ruptures
        const breakDataByBrand = data.ruptures.reduce((acc: any, item: any) => {
          if (!item.brand_lab || !item.monthly_breaks) return acc; // 🚨 Ignore les données invalides
      
          if (!acc[item.brand_lab]) acc[item.brand_lab] = [];
      
          item.monthly_breaks.forEach((monthData: any) => {
              acc[item.brand_lab].push({
                  month: monthData.month || "Inconnu", // ✅ Assure-toi que `month` a une valeur
                  total_quantity_sold: Number(monthData.total_quantity_sold) || 0,
                  total_quantity_ordered: Number(monthData.total_quantity_ordered) || 0,
                  total_stock_break_quantity: Number(monthData.total_stock_break_quantity) || 0,
                  total_stock_break_amount: Number(monthData.total_stock_break_amount) || 0,
              });
          });
      
          return acc;
      }, {});

          console.log('breakDataByBrand :', breakDataByBrand)
  
        setRuptures(Object.values(aggregatedData).map(rupture => ({
            ...rupture,
            total_quantity_sold: Number(rupture.total_quantity_sold) || 0,
            total_orders: Number(rupture.total_orders) || 0,
            total_quantity_ordered: Number(rupture.total_quantity_ordered) || 0,
            total_stock_break_quantity: Number(rupture.total_stock_break_quantity) || 0,
            total_stock_break_amount: Number(rupture.total_stock_break_amount) || 0,
            stock_break_rate: rupture.total_quantity_ordered > 0 
              ? (100 * rupture.total_stock_break_quantity / rupture.total_quantity_ordered) 
              : 0, // ✅ Calcul du taux de rupture en %
          })));
        setBrandBreakData(breakDataByBrand); // ✅ Stocke les données pour les graphiques
  
      } catch (err) {
        setError("Impossible de charger les ruptures");
      } finally {
        setLoading(false);
      }
    };
  
    fetchBrandBreaks();
  }, [filters]);

  // 🔽🔼 Fonction de tri
  const toggleSort = (column: keyof BrandStockBreak) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // 🔍 **Filtrage et tri des marques**
  const filteredRuptures = useMemo(() => {
    let sorted = ruptures.filter(
      (p) => p.brand_lab.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn) {
      sorted = sorted.sort((a, b) => {
        let valA = a[sortColumn] as number | string;
        let valB = b[sortColumn] as number | string;

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (sortColumn === "stock_break_rate") { // ✅ Cas spécifique pour le taux de rupture
            return sortOrder === "asc" ? valA - valB : valB - valA;
        }

        return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }

    return sorted;
  }, [searchQuery, sortColumn, sortOrder, ruptures]);

  // 📌 **Toggle détails de la marque**
  const toggleDetails = (brand: string) => {
    setExpandedBrand(expandedBrand === brand ? null : brand);
  };

  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;

  return (
    <div className="max-w-8xl mx-auto p-8 space-y-16">
      <StockBreakDataComponent />

      <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-teal-300">
        {/* 🔍 Barre de recherche */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="🔍 Rechercher par Marque..."
            className="w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading && <Loader message="Chargement des ruptures..." />}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-teal-100 text-teal-900">
                {Object.keys(columnHeaders).map((col) => (
                  <th key={col} className="p-3 cursor-pointer" onClick={() => toggleSort(col as keyof BrandStockBreak)}>
                    {columnHeaders[col as keyof BrandStockBreak]} <FaSort className="inline-block ml-1" />
                  </th>
                ))}
                <th className="p-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuptures.map((rupture) => (
                <React.Fragment key={rupture.brand_lab}>
                    <tr key={rupture.brand_lab} className="border-b hover:bg-teal-50">
                    <td className="p-3 text-center">{rupture.brand_lab}</td>
                    <td className="p-3 text-center">{formatLargeNumber(rupture.total_quantity_sold, false)}</td>
                        <td className="p-3 text-center">{formatLargeNumber(rupture.total_orders, false)}</td>
                        <td className="p-3 text-center">{formatLargeNumber(rupture.total_quantity_ordered, false)}</td>
                        <td className="p-3 text-center">{formatLargeNumber(rupture.total_stock_break_quantity, false)}</td>
                        <td className="p-3 text-center text-red-600 font-bold">{formatLargeNumber(rupture.total_stock_break_amount)}</td>
                        <td className="p-3 text-center font-bold">{formatLargeNumber(rupture.stock_break_rate, false)}%</td>
                        <td className="p-3 text-center">
                        <motion.button
                            animate={{ rotate: expandedBrand === rupture.brand_lab ? 90 : 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => toggleDetails(rupture.brand_lab)}
                            className="p-2 rounded-full bg-teal-600 flex items-center justify-center"
                        >
                            <FaChevronRight className="text-white text-lg" />
                        </motion.button>
                        </td>
                    </tr>
                    {expandedBrand === rupture.brand_lab && (
                        
                    <tr className="bg-gray-100">
                        <td colSpan={8} className="p-4">
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="bg-white shadow-md rounded-lg p-4 border border-gray-300"
                        >
                            <h3 className="text-lg font-bold text-teal-700">📊 Détails des Ruptures</h3>
                            {console.log("✅ Données propres pour ProductBreakChart :", brandBreakData[rupture.brand_lab])}
                            {/* 📊 Intégration du graphique */}
                            {brandBreakData[rupture.brand_lab] && brandBreakData[rupture.brand_lab].length > 0 ? (
                            <ProductBreakChart breakData={brandBreakData[rupture.brand_lab]} />
                            ) : (
                            <p className="text-gray-500 text-center">Aucune donnée disponible.</p>
                            )}
                        </motion.div>
                        </td>
                    </tr>
                    )}
                </React.Fragment>     
              ))}
              
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BrandStockBreakTable;