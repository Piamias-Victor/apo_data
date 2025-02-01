import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaChartLine, FaMoneyBillWave, FaBoxOpen, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { AnimatePresence, motion } from "framer-motion";

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


  const [totalSellOut, setTotalSellOut] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalMargin, setTotalMargin] = useState(0);
  const [totalSellIn, setTotalSellIn] = useState(0);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);

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
              data.salesData.reduce((acc, cur) => acc + (parseFloat(cur.total_quantity) || 0), 0)
            );
            setGlobalRevenue(
              data.salesData.reduce((acc, cur) => acc + (parseFloat(cur.revenue) || 0), 0)
            );
            setGlobalMargin(
              data.salesData.reduce((acc, cur) => acc + (parseFloat(cur.margin) || 0), 0)
            );
            setGlobalSellIn(
              data.salesData.reduce((acc, cur) => acc + (parseFloat(cur.purchase_quantity) || 0), 0)
            );
            setGlobalPurchaseAmount(
              data.salesData.reduce((acc, cur) => acc + (parseFloat(cur.purchase_amount) || 0), 0)
            );

            // 📅 Liste des mois (de "01" à "12")
            const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

            // 🔹 Générer les valeurs prévisionnelles (priorité à 2025, sinon 2024)
            const forecastData = months.map((month) => {
                const data2025 = salesByMonth2025[month];
                const data2024 = salesByMonth2024[month];

                return data2025 || // ✅ Prendre la donnée réelle de 2025 si disponible
                    (data2024 ? { ...data2024, month: `${currentYear}-${month}` } : // 🔄 Sinon, utiliser celle de 2024 en l'adaptant à 2025
                    { month: `${currentYear}-${month}`, total_quantity: 0, revenue: 0, margin: 0, purchase_quantity: 0, purchase_amount: 0 }); // 🚨 Si aucune donnée dispo
            });

            console.log('forecastData', forecastData)

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
        <div className="max-w-8xl mx-auto p-6 space-y-10">
      {/* 📌 Card Totale Global */}
      <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">📊 Résumé Annuel (2025)</h2>
          <p className="text-sm opacity-80">Du 1er Janvier à aujourd'hui</p>
        </div>
        <div className="flex space-x-6">
          <div className="text-center">
            <FaShoppingCart className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalSellOut, false)}</p>
            <p className="text-sm">Ventes (Sell-Out)</p>
          </div>
          <div className="text-center">
            <FaChartLine className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalRevenue)}</p>
            <p className="text-sm">CA</p>
          </div>
          <div className="text-center">
            <FaMoneyBillWave className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalMargin)}</p>
            <p className="text-sm">Marge</p>
          </div>
          <div className="w-px h-18 bg-white opacity-30"></div>
          <div className="text-center">
            <FaBoxOpen className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalSellIn, false)}</p>
            <p className="text-sm">Achats (Sell-in)</p>
          </div>
          <div className="text-center">
            <FaMoneyBillWave className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalPurchaseAmount)}</p>
            <p className="text-sm">Montant d'Achat</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">🔮 Prévisions Année 2025</h2>
          <p className="text-sm opacity-80">Projection basée sur les tendances actuelles</p>
        </div>
        <div className="flex space-x-6">
          <div className="text-center">
            <FaShoppingCart className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalForecastSellOut, false)}</p>
            <p className="text-sm">Ventes (Sell-Out)</p>
          </div>
          <div className="text-center">
            <FaChartLine className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalForecastRevenue)}</p>
            <p className="text-sm">CA</p>
          </div>
          <div className="text-center">
            <FaMoneyBillWave className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalForecastMargin)}</p>
            <p className="text-sm">Marge</p>
          </div>
          <div className="w-px h-18 bg-white opacity-30"></div>
          <div className="text-center">
            <FaBoxOpen className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalForecastSellIn, false)}</p>
            <p className="text-sm">Achats (Sell-in)</p>
          </div>
          <div className="text-center">
            <FaMoneyBillWave className="text-2xl mx-auto" />
            <p className="text-xl font-bold">{formatLargeNumber(totalForecastPurchaseAmount)}</p>
            <p className="text-sm">Montant Achat</p>
          </div>
        </div>
      </div>

      {/* 📌 Card Totale Global Toutes Dates */}
<div className="p-6 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl shadow-lg flex justify-between items-center">
  <div>
    <h2 className="text-lg font-semibold">🌍 Totaux Toutes Périodes</h2>
    <p className="text-sm opacity-80">Données cumulées depuis le début</p>
  </div>
  <div className="flex space-x-6">
    <div className="text-center">
      <FaShoppingCart className="text-2xl mx-auto" />
      <p className="text-xl font-bold">{formatLargeNumber(globalSellOut, false)}</p>
      <p className="text-sm">Ventes (Sell-Out)</p>
    </div>
    <div className="text-center">
      <FaChartLine className="text-2xl mx-auto" />
      <p className="text-xl font-bold">{formatLargeNumber(globalRevenue)}</p>
      <p className="text-sm">CA</p>
    </div>
    <div className="text-center">
      <FaMoneyBillWave className="text-2xl mx-auto" />
      <p className="text-xl font-bold">{formatLargeNumber(globalMargin)}</p>
      <p className="text-sm">Marge</p>
    </div>
    <div className="w-px h-18 bg-white opacity-30"></div>
    <div className="text-center">
      <FaBoxOpen className="text-2xl mx-auto" />
      <p className="text-xl font-bold">{formatLargeNumber(globalSellIn, false)}</p>
      <p className="text-sm">Achats (Sell-in)</p>
    </div>
    <div className="text-center">
      <FaMoneyBillWave className="text-2xl mx-auto" />
      <p className="text-xl font-bold">{formatLargeNumber(globalPurchaseAmount)}</p>
      <p className="text-sm">Montant d'Achat</p>
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
                    <span className="text-sm text-gray-500">Détails</span>
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

    </>
  );
};

export default SalesDataComponent;