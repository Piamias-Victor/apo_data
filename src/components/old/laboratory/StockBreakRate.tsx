import React, { useEffect, useState } from "react";
import { FaExclamationTriangle, FaEuroSign, FaBoxes, FaChartLine, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

// Interface des données retournées par l'API
interface StockBreakRateData {
  month: string;
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
}

// Fonction pour formater les nombres
const formatLargeNumber = (value: any, isCurrency: boolean = false): string => {
  const num = parseFloat(value) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2).replace(".", ",")} M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2).replace(".", ",")} K`;
  return isCurrency ? `${num.toFixed(2).replace(".", ",")} €` : num.toFixed(2).replace(".", ",");
};

// Fonction pour calculer l'évolution en pourcentage
const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return "N/A"; // Éviter division par zéro
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
};

const StockBreakRateComponent: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0;

  const [stockBreakData, setStockBreakData] = useState<StockBreakRateData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const [globalProductOrder, setGlobalProductOrder] = useState(0);
  const [globalBreakProduct, setGlobalBreakProduct] = useState(0);
  const [globalBreakRate, setGlobalBreakRate] = useState(0);
  const [globalBreakAmount, setGlobalBreakAmount] = useState(0);

  const [totalProductOrder, setTotalProductOrder] = useState(0);
  const [totalBreakProduct, setTotalBreakProduct] = useState(0);
  const [totalBreakRate, setTotalBreakRate] = useState(0);
  const [totalBreakAmount, setTotalBreakAmount] = useState(0);

  const [totalForecastProductOrder, setTotalForecastProductOrder] = useState(0);
  const [totalForecastBreakProduct, setTotalForecastBreakProduct] = useState(0);
  const [totalForecastBreakRate, setTotalForecastBreakRate] = useState(0);
  const [totalForecastBreakAmount, setTotalForecastBreakAmount] = useState(0);

  const [adjustedBreakProduct2024, setAdjustedBreakProduct2024] = useState(0);
  const [adjustedBreakRate2024, setAdjustedBreakRate2024] = useState(0);
  const [adjustedBreakAmount2024, setAdjustedBreakAmount2024] = useState(0);
  const [adjustedProductOrder2024, setAdjustedProductOrder2024] = useState(0);

  const [stockBreakForecastPercentage, setStockBreakForecastPercentage] = useState(0);

  useEffect(() => {
    if (!hasSelectedLabs) return;
  
    const fetchStockBreakRate = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const response = await fetch("/api/sell-out/getStockBreakRate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });
  
        if (!response.ok) throw new Error("Échec du fetch des données");
  
        const data = await response.json();
        setStockBreakData(data.stockBreakData);
  
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
  
        // 🔹 Séparer les données par année
        const stockBreakByMonth2025: { [key: string]: StockBreakRateData } = {};
        const stockBreakByMonth2024: { [key: string]: StockBreakRateData } = {};
  
        data.stockBreakData.forEach((d: StockBreakRateData) => {
          const [year, month] = d.month.split("-");
          if (year === `${currentYear}`) stockBreakByMonth2025[month] = d;
          if (year === `${previousYear}`) stockBreakByMonth2024[month] = d;
        });
  
        // 🔹 Filtrer les données pour l'année en cours (2025)
        const stockBreak2025 = data.stockBreakData.filter((d: StockBreakRateData) =>
          d.month.startsWith(`${currentYear}-`)
        );
  
        // 📅 Liste des mois (de "01" à "12")
              // 📅 Liste des mois (de "01" à "12")
        const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

        // 📌 Récupérer le mois actuel (1 = janvier, 12 = décembre)
        const currentMonth = new Date().getMonth(); // ⚠️ getMonth() est en base 0, donc +1

        const completedMonths2025 = months.filter(
          (month) => parseInt(month) <= currentMonth && stockBreakByMonth2025[month]
        );

        const filteredBreaks2024 = completedMonths2025.map((month) =>
          stockBreakByMonth2024[month] || { 
            total_products_ordered: 0, 
            stock_break_products: 0, 
            stock_break_rate: 0, 
            stock_break_amount: 0 
          }
        );

        const sumProductOrder2024 = filteredBreaks2024.reduce((acc, cur) => acc + (parseFloat(cur.total_products_ordered) || 0), 0);
        const sumBreakProduct2024 = filteredBreaks2024.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_products) || 0), 0);
        const sumBreakAmount2024 = filteredBreaks2024.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_amount) || 0), 0);
        const sumBreakRate2024 = sumProductOrder2024 ? (sumBreakProduct2024 / sumProductOrder2024) * 100 : 0;
  
        setAdjustedProductOrder2024(sumProductOrder2024);
        setAdjustedBreakProduct2024(sumBreakProduct2024);
        setAdjustedBreakAmount2024(sumBreakAmount2024);
        setAdjustedBreakRate2024(sumBreakRate2024);

        // 🔹 Générer le forecast en prenant 2025 jusqu’au mois actuel, sinon 2024
        const forecastData = months.map((month) => {
          const data2025 = stockBreakByMonth2025[month];
          const data2024 = stockBreakByMonth2024[month];

          return parseInt(month) <= currentMonth // ✅ Si le mois est <= mois actuel, prendre 2025
            ? data2025 || { month: `${currentYear}-${month}`, total_products_ordered: 0, stock_break_products: 0, stock_break_rate: 0, stock_break_amount: 0 }
            : data2024 // 🔄 Après le mois actuel, prendre 2024
              ? { ...data2024, month: `${currentYear}-${month}` }
              : { month: `${currentYear}-${month}`, total_products_ordered: 0, stock_break_products: 0, stock_break_rate: 0, stock_break_amount: 0 };
        });

        const stockBreak2024 = data.stockBreakData.filter((d: StockBreakRateData) =>
          d.month.startsWith(`${previousYear}-`)
        );
  
        // 🔵 ✅ Totaux pour 2024 uniquement (sans impact du forecast)
        setGlobalProductOrder(
          stockBreak2024.reduce((acc, cur) => acc + (parseFloat(cur.total_products_ordered) || 0), 0)
        );
        setGlobalBreakProduct(
          stockBreak2024.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_products) || 0), 0)
        );
        setGlobalBreakAmount(
          stockBreak2024.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_amount) || 0), 0)
        );
        setGlobalBreakRate(
          stockBreak2024.length > 0 ? (globalBreakProduct / globalProductOrder) * 100 : 0
        );
  
        // 🔵 ✅ Totaux pour 2025 uniquement
        setTotalProductOrder(
          stockBreak2025.reduce((acc, cur) => acc + (parseFloat(cur.total_products_ordered) || 0), 0)
        );
        setTotalBreakProduct(
          stockBreak2025.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_products) || 0), 0)
        );
        setTotalBreakAmount(
          stockBreak2025.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_amount) || 0), 0)
        );
        setTotalBreakRate((prev) => (prev = totalProductOrder ? (totalBreakProduct / totalProductOrder) * 100 : 0));
  
        // 🔵 ✅ Totaux prévisionnels pour 2025
        setTotalForecastProductOrder(
          forecastData.reduce((acc, cur) => acc + (parseFloat(cur.total_products_ordered) || 0), 0)
        );
        setTotalForecastBreakProduct(
          forecastData.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_products) || 0), 0)
        );
        setTotalForecastBreakAmount(
          forecastData.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_amount) || 0), 0)
        );
        setTotalForecastBreakRate((prev) => (prev = totalForecastProductOrder ? (totalForecastBreakProduct / totalForecastProductOrder) * 100 : 0));
  
      } catch (err) {
        setError("Impossible de récupérer les données");
      } finally {
        setLoading(false);
      }
    };
  
    fetchStockBreakRate();
  }, [filters, totalProductOrder]); // Déclenché à chaque changement des filtres

  if (!hasSelectedLabs) {
    return <p className="text-gray-500 text-center mt-4">Sélectionnez un laboratoire pour voir les données.</p>;
  }

  // 🔹 Calculs des totaux avec conversion en nombre
  // const totalOrdered = stockBreakData.reduce((acc, cur) => acc + (parseFloat(cur.total_products_ordered) || 0), 0);
  // const totalBreaks = stockBreakData.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_products) || 0), 0);
  // const totalBreakAmount = stockBreakData.reduce((acc, cur) => acc + (parseFloat(cur.stock_break_amount) || 0), 0);
  // const globalBreakRate = totalOrdered ? (totalBreaks / totalOrdered) * 100 : 0;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      {/* 📌 Loader */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-40">
          <div className="border-t-4 border-teal-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
          <span className="text-teal-600 mt-2">Chargement des données...</span>
        </div>
      )}

      {/* ❌ Erreur */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* 📌 Cartes globales */}
      {!loading && !error && stockBreakData.length > 0 && (
        <>
          {/* 📌 Carte taux de rupture */}
          <div className="p-6 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg shadow-lg border border-white">
  {/* 📊 Titre */}
  <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
    <h2 className="text-lg font-semibold">📊 Résumé Annuel (2025)</h2>
    <p className="text-sm opacity-80">Du 1er Janvier à aujourd'hui</p>
  </div>

  {/* 🟢 Contenu en grille */}
  <div className="grid grid-cols-4 gap-6">
    {/* 🔹 Produits commandés */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(totalProductOrder, false)}</p>
      <p className="text-sm opacity-80">Produits commandés</p>
      <div className="flex items-center justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
          ${((totalProductOrder - adjustedProductOrder2024) / adjustedProductOrder2024) * 100 > 0 ? "bg-green-400 text-white" : 
            ((totalProductOrder - adjustedProductOrder2024) / adjustedProductOrder2024) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
          {adjustedProductOrder2024 !== 0 ? `${(((totalProductOrder - adjustedProductOrder2024) / adjustedProductOrder2024) * 100).toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>

    {/* 🔹 Produits en rupture */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(totalBreakProduct, false)}</p>
      <p className="text-sm opacity-80">Produits en rupture</p>
      <div className="flex items-center justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
          ${((totalBreakProduct - adjustedBreakProduct2024) / adjustedBreakProduct2024) * 100 > 0 ? "bg-green-400 text-white" : 
            ((totalBreakProduct - adjustedBreakProduct2024) / adjustedBreakProduct2024) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
          {adjustedBreakProduct2024 !== 0 ? `${(((totalBreakProduct - adjustedBreakProduct2024) / adjustedBreakProduct2024) * 100).toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>

    {/* 🔹 Taux de rupture */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(totalBreakRate, false)}%</p>
      <p className="text-sm opacity-80">Taux de rupture</p>
      <div className="flex items-center justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
          ${((totalBreakRate - adjustedBreakRate2024) / adjustedBreakRate2024) * 100 > 0 ? "bg-green-400 text-white" : 
            ((totalBreakRate - adjustedBreakRate2024) / adjustedBreakRate2024) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
          {adjustedBreakRate2024 !== 0 ? `${(((totalBreakRate - adjustedBreakRate2024) / adjustedBreakRate2024) * 100).toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>

    {/* 🔹 Montant rupture */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(totalBreakAmount, true)}</p>
      <p className="text-sm opacity-80">Montant rupture</p>
      <div className="flex items-center justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
          ${((totalBreakAmount - adjustedBreakAmount2024) / adjustedBreakAmount2024) * 100 > 0 ? "bg-green-400 text-white" : 
            ((totalBreakAmount - adjustedBreakAmount2024) / adjustedBreakAmount2024) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
          {adjustedBreakAmount2024 !== 0 ? `${(((totalBreakAmount - adjustedBreakAmount2024) / adjustedBreakAmount2024) * 100).toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>
  </div>
</div>

<div className="p-6 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-lg shadow-lg border border-white">
  {/* 🔮 Titre */}
  <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
    <h2 className="text-lg font-semibold">🔮 Prévisions Année 2025</h2>
    <div className="flex items-center space-x-2">
      <label htmlFor="stockBreakForecast" className="text-sm opacity-90 whitespace-nowrap">📈 Évolution (%)</label>
      <input
        id="stockBreakForecast"
        type="number"
        className="p-2 border border-white rounded-md text-gray-700 text-center w-20 focus:outline-none"
        placeholder="0"
        value={stockBreakForecastPercentage}
        onChange={(e) => setStockBreakForecastPercentage(parseFloat(e.target.value) || 0)}
      />
    </div>
  </div>

  {/* 📊 Contenu en grille */}
  <div className="grid grid-cols-4 gap-6">
    {/* 🔹 Produits commandés */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(totalForecastProductOrder * (1 + stockBreakForecastPercentage / 100), false)}</p>
      <p className="text-sm opacity-80">Produits commandés</p>
      <div className="flex items-center justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
          ${((totalForecastProductOrder * (1 + stockBreakForecastPercentage / 100) - globalProductOrder) / globalProductOrder) * 100 > 0 ? "bg-green-400 text-white" : 
            ((totalForecastProductOrder * (1 + stockBreakForecastPercentage / 100) - globalProductOrder) / globalProductOrder) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
          {globalProductOrder !== 0 ? `${(((totalForecastProductOrder * (1 + stockBreakForecastPercentage / 100) - globalProductOrder) / globalProductOrder) * 100).toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>

    {/* 🔹 Produits en rupture */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(totalForecastBreakProduct * (1 + stockBreakForecastPercentage / 100), false)}</p>
      <p className="text-sm opacity-80">Produits en rupture</p>
      <div className="flex items-center justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
          ${((totalForecastBreakProduct * (1 + stockBreakForecastPercentage / 100) - globalBreakProduct) / globalBreakProduct) * 100 > 0 ? "bg-green-400 text-white" : 
            ((totalForecastBreakProduct * (1 + stockBreakForecastPercentage / 100) - globalBreakProduct) / globalBreakProduct) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
          {globalBreakProduct !== 0 ? `${(((totalForecastBreakProduct * (1 + stockBreakForecastPercentage / 100) - globalBreakProduct) / globalBreakProduct) * 100).toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>

    {/* 🔹 Taux de rupture */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(totalForecastBreakRate * (1 + stockBreakForecastPercentage / 100), false)}%</p>
      <p className="text-sm opacity-80">Taux de rupture</p>
      <div className="flex items-center justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
          ${((totalForecastBreakRate * (1 + stockBreakForecastPercentage / 100) - globalBreakRate) / globalBreakRate) * 100 > 0 ? "bg-green-400 text-white" : 
            ((totalForecastBreakRate * (1 + stockBreakForecastPercentage / 100) - globalBreakRate) / globalBreakRate) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
          {globalBreakRate !== 0 ? `${(((totalForecastBreakRate * (1 + stockBreakForecastPercentage / 100) - globalBreakRate) / globalBreakRate) * 100).toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>

    {/* 🔹 Montant rupture */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(totalForecastBreakAmount * (1 + stockBreakForecastPercentage / 100), true)}</p>
      <p className="text-sm opacity-80">Montant rupture</p>
      <div className="flex items-center justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
          ${((totalForecastBreakAmount * (1 + stockBreakForecastPercentage / 100) - globalBreakAmount) / globalBreakAmount) * 100 > 0 ? "bg-green-400 text-white" : 
            ((totalForecastBreakAmount * (1 + stockBreakForecastPercentage / 100) - globalBreakAmount) / globalBreakAmount) * 100 < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
          {globalBreakAmount !== 0 ? `${(((totalForecastBreakAmount * (1 + stockBreakForecastPercentage / 100) - globalBreakAmount) / globalBreakAmount) * 100).toFixed(1)}%` : "N/A"}
        </span>
      </div>
    </div>
  </div>
</div>


<div className="p-6 bg-gradient-to-r from-rose-500 to-rose-700 text-white rounded-lg shadow-lg border border-white">
  {/* 📊 Titre */}
  <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
    <h2 className="text-lg font-semibold">📊 Résumé Annuel (2024)</h2>
    <p className="text-sm opacity-80">Du 1er Janvier 2024 au 31 Décembre 2024</p>
  </div>

  {/* 📊 Contenu en grille */}
  <div className="grid grid-cols-4 gap-6">
    {/* 🔹 Produits commandés */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(globalProductOrder, false)}</p>
      <p className="text-sm opacity-80">Produits commandés</p>
    </div>

    {/* 🔹 Produits en rupture */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(globalBreakProduct, false)}</p>
      <p className="text-sm opacity-80">Produits en rupture</p>
    </div>

    {/* 🔹 Taux de rupture */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(globalBreakRate, false)}%</p>
      <p className="text-sm opacity-80">Taux de rupture</p>
    </div>

    {/* 🔹 Montant rupture */}
    <div className="text-center">
      <p className="text-xl font-bold">{formatLargeNumber(globalBreakAmount, true)}</p>
      <p className="text-sm opacity-80">Montant rupture</p>
    </div>
  </div>
</div>

          {/* 📌 Liste détaillée */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 relative">
            {/* 📌 Bouton d'affichage */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md hover:bg-red-600 transition flex items-center"
            >
              {showDetails ? "Masquer détails" : "Afficher détails"}
              {showDetails ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </button>

            <h2 className="text-lg font-semibold text-gray-700 mb-4">📅 Détails Mensuels</h2>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {stockBreakData.map((data, index) => (
                    <div key={index} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-300">
                      <h3 className="text-lg font-semibold text-gray-700 flex justify-between">
                        {data.month} <span className="text-sm text-gray-500">📅 Détails</span>
                      </h3>
                      <div className="flex justify-between mt-4">
                        <div className="text-left">
                          <p className="text-sm text-gray-500">🚚 Produits commandés</p>
                          <p className="text-lg font-semibold">{formatLargeNumber(data.total_products_ordered, false)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">💯 Taux de rupture</p>
                          <p className="text-lg font-semibold">{formatLargeNumber(data.stock_break_rate, false)} %</p>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="text-left">
                          <p className="text-sm text-gray-500">🚨 Produits en Rupture</p>
                          <p className="text-lg font-semibold">{formatLargeNumber(data.stock_break_products, false)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">💰 Montant</p>
                          <p className="text-lg font-semibold">{formatLargeNumber(data.stock_break_amount, true)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};

export default StockBreakRateComponent;