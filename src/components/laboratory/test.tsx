import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaChartLine, FaMoneyBillWave, FaBoxOpen, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { AnimatePresence, motion } from "framer-motion";
import StockBreakRate from "./StockBreakRate";
import LabStockComponent from "./LabStockComponent";
import LabMetricsComponent from "./LabMetricsComponent";

interface SalesData {
  month: string;
  total_quantity: number;
  revenue?: number;
  margin?: number;
  purchase_quantity?: number;
  purchase_amount?: number;
}

// Fonction pour formater les nombres en Euro
// Fonction pour formater les nombres en Euro
const formatLargeNumber = (value: any, isCurrency: boolean = true): string => {
    const num = parseFloat(value) || 0; // Convertir en nombre et éviter NaN

    // Fonction pour calculer l'évolution en pourcentage

    let formattedValue = "";
  
    if (num >= 1_000_000) {
      formattedValue = `${(num / 1_000_000).toFixed(2).replace(".", ",")} M`;
    } else if (num >= 1_000) {
      formattedValue = `${(num / 1_000).toFixed(2).replace(".", ",")} K`;
    } else {
      formattedValue = num.toFixed(2).replace(".", ",");
    }
  
    return isCurrency ? `${formattedValue} €` : formattedValue;
  };

const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return "N/A"; // Éviter division par zéro
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

const SalesDataComponent: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0 ;
  
  const [globalSellOut, setGlobalSellOut] = useState(0);
  const [globalRevenue, setGlobalRevenue] = useState(0);
  const [globalMargin, setGlobalMargin] = useState(0);
  const [globalSellIn, setGlobalSellIn] = useState(0);
  const [globalPurchaseAmount, setGlobalPurchaseAmount] = useState(0);

  const [totalForecastSellOut, setTotalForecastSellOut] = useState(0);
  const [totalForecastRevenue, setTotalForecastRevenue] = useState(0);
  const [totalForecastMargin, setTotalForecastMargin] = useState(0);
  const [totalForecastSellIn, setTotalForecastSellIn] = useState(0);
  const [totalForecastPurchaseAmount, setTotalForecastPurchaseAmount] = useState(0);

  const [forecastPercentage, setForecastPercentage] = useState(0);

  const [totalSellOut, setTotalSellOut] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalMargin, setTotalMargin] = useState(0);
  const [totalSellIn, setTotalSellIn] = useState(0);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);

  const [adjustedSellOut2024, setAdjustedSellOut2024] = useState(0);
  const [adjustedRevenue2024, setAdjustedRevenue2024] = useState(0);
  const [adjustedMargin2024, setAdjustedMargin2024] = useState(0);
  const [adjustedSellIn2024, setAdjustedSellIn2024] = useState(0);
  const [adjustedPurchaseAmount2024, setAdjustedPurchaseAmount2024] = useState(0);

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
    };

    useEffect(() => {
        if (!hasSelectedLabs) return;
      
        const fetchSalesData = async () => {
          setLoading(true);
          setError(null);
      
          try {
            const response = await fetch("/api/sell-out/getSalesByMonth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filters }),
            });
      
            if (!response.ok) throw new Error("Échec du fetch des données");
      
            const data = await response.json();
            setSalesData(data.salesData);
      
            const currentYear = new Date().getFullYear();
            const filteredSales = data.salesData.filter((d: SalesData) =>
              d.month.startsWith(`${currentYear}-`)
            );

            const previousYear = currentYear - 1; // Ex: 2024

            // 🔹 Stocker les valeurs mensuelles de 2025 et 2024
            const salesByMonth2025: { [key: string]: SalesData } = {};
            const salesByMonth2024: { [key: string]: SalesData } = {};

            data.salesData.forEach((d: SalesData) => {
                const [year, month] = d.month.split("-");
                if (year === `${currentYear}`) salesByMonth2025[month] = d;
                if (year === `${previousYear}`) salesByMonth2024[month] = d;
            });

            const filteredGlobalSales = data.salesData.filter((d: SalesData) =>
              d.month.startsWith(`${previousYear}-`)
            );
            
            // 🟢 ✅ Convertir en nombres avant l'addition
            setTotalSellOut(
              filteredSales.reduce((acc, cur) => acc + (parseFloat(cur.total_quantity) || 0), 0)
            );
            setTotalRevenue(
              filteredSales.reduce((acc, cur) => acc + (parseFloat(cur.revenue) || 0), 0)
            );
            setTotalMargin(
              filteredSales.reduce((acc, cur) => acc + (parseFloat(cur.margin) || 0), 0)
            );
            setTotalSellIn(
              filteredSales.reduce((acc, cur) => acc + (parseFloat(cur.purchase_quantity) || 0), 0)
            );
            setTotalPurchaseAmount(
              filteredSales.reduce((acc, cur) => acc + (parseFloat(cur.purchase_amount) || 0), 0)
            );
      
            // 🔵 ✅ Totaux toutes dates confondues
            setGlobalSellOut(
              filteredGlobalSales.reduce((acc, cur) => acc + (parseFloat(cur.total_quantity) || 0), 0)
            );
            setGlobalRevenue(
              filteredGlobalSales.reduce((acc, cur) => acc + (parseFloat(cur.revenue) || 0), 0)
            );
            setGlobalMargin(
              filteredGlobalSales.reduce((acc, cur) => acc + (parseFloat(cur.margin) || 0), 0)
            );
            setGlobalSellIn(
              filteredGlobalSales.reduce((acc, cur) => acc + (parseFloat(cur.purchase_quantity) || 0), 0)
            );
            setGlobalPurchaseAmount(
              filteredGlobalSales.reduce((acc, cur) => acc + (parseFloat(cur.purchase_amount) || 0), 0)
            );
    

            // 📅 Liste des mois (de "01" à "12")
            const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

            // 🔹 Générer les valeurs prévisionnelles (priorité à 2025, sinon 2024)
            const forecastData = months.map((month, index) => {
              const data2025 = salesByMonth2025[month];
              const data2024 = salesByMonth2024[month];

              // 🔍 Vérifier si le mois suivant est rempli (donc le mois actuel est "complet")
              const nextMonth = months[index + 1]; // Mois suivant
              const nextMonthData = salesByMonth2025[nextMonth]; // Données du mois suivant

              const isNextMonthFilled = nextMonthData && (nextMonthData.total_quantity || 0) > 0 && (nextMonthData.revenue || 0) > 0;

              return isNextMonthFilled ? data2025 // ✅ Si le mois suivant est rempli, prendre 2025
                  : (data2024 ? { ...data2024, month: `${currentYear}-${month}` } // 🔄 Sinon, prendre 2024
                  : { month: `${currentYear}-${month}`, total_quantity: 0, revenue: 0, margin: 0, purchase_quantity: 0, purchase_amount: 0 });
            });

            // 🔵 Correction du calcul en s'assurant que toutes les valeurs sont bien des nombres
            setTotalForecastSellOut(
                forecastData.reduce((acc, cur) => acc + (parseFloat(cur.total_quantity) || 0), 0)
            );
            setTotalForecastRevenue(
                forecastData.reduce((acc, cur) => acc + (parseFloat(cur.revenue) || 0), 0)
            );
            setTotalForecastMargin(
                forecastData.reduce((acc, cur) => acc + (parseFloat(cur.margin) || 0), 0)
            );
            setTotalForecastSellIn(
                forecastData.reduce((acc, cur) => acc + (parseFloat(cur.purchase_quantity) || 0), 0)
            );
            setTotalForecastPurchaseAmount(
                forecastData.reduce((acc, cur) => acc + (parseFloat(cur.purchase_amount) || 0), 0)
            );

            const currentMonth = new Date().getMonth() + 1; // Récupère le mois actuel (1 = janvier, 12 = décembre)

            // Filtrer les données de 2024 pour n'inclure que les mois disponibles en 2025
            const monthsUpToCurrent = Array.from({ length: currentMonth }, (_, i) => (i + 1).toString().padStart(2, "0"));

            const filteredSales2024 = monthsUpToCurrent.map(month => salesByMonth2024[month] || { total_quantity: 0, revenue: 0, margin: 0, purchase_quantity: 0, purchase_amount: 0 });

            setAdjustedSellOut2024(
              filteredSales2024.reduce((acc, cur) => acc + (parseFloat(cur.total_quantity) || 0), 0)
            );
            setAdjustedRevenue2024(
              filteredSales2024.reduce((acc, cur) => acc + (parseFloat(cur.revenue) || 0), 0)
            );
            setAdjustedMargin2024(
              filteredSales2024.reduce((acc, cur) => acc + (parseFloat(cur.margin) || 0), 0)
            );
            setAdjustedSellIn2024(
              filteredSales2024.reduce((acc, cur) => acc + (parseFloat(cur.purchase_quantity) || 0), 0)
            );
            setAdjustedPurchaseAmount2024(
              filteredSales2024.reduce((acc, cur) => acc + (parseFloat(cur.purchase_amount) || 0), 0)
            );

      
          } catch (err) {
            setError("Impossible de récupérer les données");
          } finally {
            setLoading(false);
          }
        };
      
        fetchSalesData();
      }, [filters]);

  if (!hasSelectedLabs) {
    return <p className="text-gray-500 text-center mt-4">Sélectionnez un laboratoire pour voir les données.</p>;
  }
  

  return (
    <>
    {loading && (
        <div className="flex flex-col gap-4 items-center justify-start min-h-screen mt-12">
            <div className="border-t-4 border-teal-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <span className="text-teal-700">Chargement en cours...</span>
        </div>
        )}
        <h2 className="text-xl font-bold text-gray-700 text-center pt-6">📊 Sell-in / Sell-out</h2>
        <p className="text-gray-500 text-center mb-6">Données sur les ventes et achats</p>
        <div className="max-w-8xl mx-auto p-6 space-y-10">
          
      {/* 📌 Card Totale Global */}
      <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl shadow-lg border border-white">
  {/* 📊 Titre */}
  <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
    <h2 className="text-lg font-semibold">📊 Résumé Annuel (2025)</h2>
    <p className="text-sm opacity-80">Du 1er Janvier à aujourd'hui</p>
  </div>

  {/* 🟢 Contenu avec deux colonnes */}
  <div className="grid grid-cols-2 gap-8">
    {/* 🔵 SELL-OUT */}
    <div className="border-r border-white pr-6">
      <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
        <FaShoppingCart className="mr-2" /> Sell-Out
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalSellOut, false)}</p>
          <p className="text-sm opacity-80">Volume</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalSellOut - adjustedSellOut2024) / adjustedSellOut2024) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalSellOut - adjustedSellOut2024) / adjustedSellOut2024) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
            
              
              {adjustedSellOut2024 !== 0 ? `${(((totalSellOut - adjustedSellOut2024) / adjustedSellOut2024) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalRevenue)}</p>
          <p className="text-sm opacity-80">CA</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalRevenue - adjustedRevenue2024) / adjustedRevenue2024) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalRevenue - adjustedRevenue2024) / adjustedRevenue2024) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
              
              
              {adjustedRevenue2024 !== 0 ? `${(((totalRevenue - adjustedRevenue2024) / adjustedRevenue2024) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalMargin)}</p>
          <p className="text-sm opacity-80">Marge</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalMargin - adjustedMargin2024) / adjustedMargin2024) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalMargin - adjustedMargin2024) / adjustedMargin2024) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
             
              
              {adjustedMargin2024 !== 0 ? `${(((totalMargin - adjustedMargin2024) / adjustedMargin2024) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* 🟠 SELL-IN */}
    <div className="pl-6">
      <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
        <FaBoxOpen className="mr-2" /> Sell-In
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalSellIn, false)}</p>
          <p className="text-sm opacity-80">Volume</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalSellIn - adjustedSellIn2024) / adjustedSellIn2024) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalSellIn - adjustedSellIn2024) / adjustedSellIn2024) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
             
              
              {adjustedSellIn2024 !== 0 ? `${(((totalSellIn - adjustedSellIn2024) / adjustedSellIn2024) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalPurchaseAmount)}</p>
          <p className="text-sm opacity-80">Montant</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalPurchaseAmount - adjustedPurchaseAmount2024) / adjustedPurchaseAmount2024) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalPurchaseAmount - adjustedPurchaseAmount2024) / adjustedPurchaseAmount2024) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
              {adjustedPurchaseAmount2024 !== 0 ? `${(((totalPurchaseAmount - adjustedPurchaseAmount2024) / adjustedPurchaseAmount2024) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div className="p-6 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white rounded-xl shadow-lg border border-white">
  {/* 🔮 Titre + Input aligné à droite */}
  <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
    <div>
      <h2 className="text-lg font-semibold">🔮 Prévisions Année 2025</h2>
    </div>
    
    {/* 📉 Input pour le pourcentage d'évolution */}
    <div className="flex items-center space-x-2">
      <label htmlFor="forecast" className="text-sm opacity-90 whitespace-nowrap">📈 Évolution (%)</label>
      <input
        id="forecast"
        type="number"
        className="p-2 border border-white rounded-md text-gray-700 text-center w-20 focus:outline-none"
        placeholder="0"
        value={forecastPercentage}
        onChange={(e) => setForecastPercentage(parseFloat(e.target.value) || 0)}
      />
    </div>
  </div>

  {/* 🟢 Contenu avec deux colonnes */}
  <div className="grid grid-cols-2 gap-8">
    {/* 🔵 SELL-OUT */}
    <div className="border-r border-white pr-6">
      <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
        <FaShoppingCart className="mr-2" /> Sell-Out
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalForecastSellOut * (1 + forecastPercentage / 100), false)}</p>
          <p className="text-sm opacity-80">Volume</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalForecastSellOut * (1 + forecastPercentage / 100) - globalSellOut) / globalSellOut) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalForecastSellOut * (1 + forecastPercentage / 100) - globalSellOut) / globalSellOut) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
             
              {globalSellOut !== 0 ? `${(((totalForecastSellOut * (1 + forecastPercentage / 100) - globalSellOut) / globalSellOut) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalForecastRevenue * (1 + forecastPercentage / 100))}</p>
          <p className="text-sm opacity-80">CA</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalForecastRevenue * (1 + forecastPercentage / 100) - globalRevenue) / globalRevenue) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalForecastRevenue * (1 + forecastPercentage / 100) - globalRevenue) / globalRevenue) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
             
              {globalSellOut !== 0 ? `${(((totalForecastRevenue * (1 + forecastPercentage / 100) - globalRevenue) / globalRevenue) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalForecastMargin * (1 + forecastPercentage / 100))}</p>
          <p className="text-sm opacity-80">Marge</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalForecastMargin * (1 + forecastPercentage / 100) - globalMargin) / globalMargin) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalForecastMargin * (1 + forecastPercentage / 100) - globalMargin) / globalMargin) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
              
              {globalMargin !== 0 ? `${(((totalForecastMargin * (1 + forecastPercentage / 100) - globalMargin) / globalMargin) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* 🟠 SELL-IN */}
    <div className="pl-6">
      <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
        <FaBoxOpen className="mr-2" /> Sell-In
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalForecastSellIn * (1 + forecastPercentage / 100), false)}</p>
          <p className="text-sm opacity-80">Volume</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalForecastSellIn * (1 + forecastPercentage / 100) - globalSellIn) / globalSellIn) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalForecastSellIn * (1 + forecastPercentage / 100) - globalSellIn) / globalSellIn) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
              
              
              {globalSellIn !== 0 ? `${(((totalForecastSellIn * (1 + forecastPercentage / 100) - globalSellIn) / globalSellIn) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(totalForecastPurchaseAmount * (1 + forecastPercentage / 100))}</p>
          <p className="text-sm opacity-80">Montant</p>
          <div className="flex items-center justify-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
              ${((totalForecastPurchaseAmount * (1 + forecastPercentage / 100) - globalPurchaseAmount) / globalPurchaseAmount) * 100 > 0 ? "bg-green-400 text-white" : 
                ((totalForecastPurchaseAmount * (1 + forecastPercentage / 100) - globalPurchaseAmount) / globalPurchaseAmount) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
              
             
              
              {globalPurchaseAmount !== 0 ? `${(((totalForecastPurchaseAmount * (1 + forecastPercentage / 100) - globalPurchaseAmount) / globalPurchaseAmount) * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      {/* 📌 Card Totale Global Toutes Dates */}
      <div className="p-6 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl shadow-lg border border-white">
  {/* 🌍 Titre */}
  <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
    <h2 className="text-lg font-semibold">📊 Résumé Annuel (2024)</h2>
    <p className="text-sm opacity-80">Du 1er Janvier 2024 au 31 Décembre 2024</p>
  </div>

  {/* 🟢 Contenu avec deux colonnes */}
  <div className="grid grid-cols-2 gap-8">
    {/* 🔵 SELL-OUT */}
    <div className="border-r border-white pr-6">
      <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
        <FaShoppingCart className="mr-2" /> Sell-Out
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(globalSellOut, false)}</p>
          <p className="text-sm opacity-80">Volume</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(globalRevenue)}</p>
          <p className="text-sm opacity-80">CA</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(globalMargin)}</p>
          <p className="text-sm opacity-80">Marge</p>
        </div>
      </div>
    </div>

    {/* 🟠 SELL-IN */}
    <div className="pl-6">
      <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
        <FaBoxOpen className="mr-2" /> Sell-In
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(globalSellIn, false)}</p>
          <p className="text-sm opacity-80">Volume</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{formatLargeNumber(globalPurchaseAmount)}</p>
          <p className="text-sm opacity-80">Montant</p>
        </div>
      </div>
    </div>
  </div>
</div>

      
      {/* 📌 Cards détaillées par mois */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 relative">
        {/* 📌 Bouton en haut à droite */}
        <button
            onClick={toggleCollapse}
            className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md hover:bg-teal-600 transition flex items-center"
        >
            {isCollapsed ? "Afficher détails" : "Masquer détails"}
            {isCollapsed ? <FaChevronDown className="ml-2" /> : <FaChevronUp className="ml-2" />}
        </button>

        {/* 📌 Titre */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📅 Détails Mensuels</h2>

        {/* 📌 Contenu animé */}
        <AnimatePresence>
            {!isCollapsed && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {loading && <p className="text-gray-500 text-center">Chargement des données...</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}

                {!loading && !error && salesData.length > 0 && salesData.map((data, index) => (
                <div key={index} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-700 flex justify-between items-center">
                    {data.month} 
                    <span className="text-sm text-gray-500">📅 Détails</span>
                    </h3>
                    <div className="flex justify-between mt-4">
                    {/* 📌 Colonne Sell-Out */}
                    <div className="text-left">
                        <p className="text-sm text-gray-500">Sell-Out</p>
                        <div className="flex items-center space-x-2">
                        <FaShoppingCart className="text-blue-500" />
                        <p className="text-lg font-semibold">{formatLargeNumber(data.total_quantity , false)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                        <FaChartLine className="text-green-500" />
                        <p className="text-lg font-semibold">{data.revenue ? formatLargeNumber(data.revenue) : "N/A"}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                        <FaMoneyBillWave className="text-yellow-500" />
                        <p className="text-lg font-semibold">{data.margin ? formatLargeNumber(data.margin) : "N/A"}</p>
                        </div>
                    </div>

                    {/* 📌 Colonne Sell-In */}
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Sell-In</p>
                        <div className="flex items-center space-x-2">
                        <FaBoxOpen className="text-purple-500" />
                        <p className="text-lg font-semibold">{data.purchase_quantity ? formatLargeNumber(data.purchase_quantity , false) : "N/A"}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                        <FaMoneyBillWave className="text-red-500" />
                        <p className="text-lg font-semibold">{data.purchase_amount ? formatLargeNumber(data.purchase_amount) : "N/A"}</p>
                        </div>
                    </div>
                    </div>
                </div>
                ))}

                {!loading && !error && salesData.length === 0 && (
                <p className="text-gray-500 text-center col-span-2">Aucune donnée disponible.</p>
                )}
            </motion.div>
            )}
        </AnimatePresence>
        </div>
    </div>
    {/* 🔹 Séparateur et Titre pour la section Stock Break Rate */}
    <div className="mt-10 mb-6 border-t-4 border-gray-300"></div>
    <h2 className="text-xl font-bold text-gray-700 text-center pt-6">📉 Analyse des Ruptures de Stock</h2>
    <p className="text-gray-500 text-center mb-6">Données sur les ruptures de stock et leur impact</p>
    <StockBreakRate/>

    <div className="mt-10 mb-6 border-t-4 border-gray-300"></div>
    <h2 className="text-xl font-bold text-gray-700 text-center pt-6">📦 Analyse du Stock</h2>
    <p className="text-gray-500 text-center mb-10">Données sur le stock et leur impact</p>
    <LabStockComponent/>

    <div className="mt-10 mb-6 border-t-4 border-gray-300"></div>
    <h2 className="text-xl font-bold text-gray-700 text-center pt-6">📊 Analyse des Indicateurs Financiers</h2>
    <p className="text-gray-500 text-center mb-10">Données sur les ventes, marges et performances</p>
    <LabMetricsComponent />

    </>
  );
};

export default SalesDataComponent;