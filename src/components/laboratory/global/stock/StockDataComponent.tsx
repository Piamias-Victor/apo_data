import React, { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/FilterContext";
import Loader from "@/components/ui/Loader";
import StockSummary2025 from "./StockSummary2025";
import StockDataMonthly from "./StockDataMonthly";
import ForecastSummary2025 from "./ForecastSummary2025";

interface StockSalesData {
  month: string;
  total_avg_stock: number;
  total_stock_value: number;
  total_quantity: number;
  total_revenue: number;
}

const StockDataComponent: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedData =
  filters.distributors.length > 0 ||
  filters.brands.length > 0 ||
  filters.universes.length > 0 ||
  filters.categories.length > 0 ||
  filters.families.length > 0 ||
  filters.specificities.length > 0 || 
  filters.ean13Products.length > 0;

  const [stockSalesData, setStockSalesData] = useState<StockSalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalAvgStock, setTotalAvgStock] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [monthsOfStock, setMonthsOfStock] = useState(0);
  const [stockValuePercentage, setStockValuePercentage] = useState(0);

  const [adjustedAvgStock2024, setAdjustedAvgStock2024] = useState(0);
  const [adjustedStockValue2024, setAdjustedStockValue2024] = useState(0);
  const [adjustedMonthsOfStock2024, setAdjustedMonthsOfStock2024] = useState(0);
  const [adjustedStockValuePercentage2024, setAdjustedStockValuePercentage2024] = useState(0);

  const [forecastPercentage, setForecastPercentage] = useState(0);

  const [fullForecastAvgStock, setFullForecastAvgStock] = useState(0);
  const [fullForecastStockValue, setFullForecastStockValue] = useState(0);
  const [fullForecastMonthsOfStock, setFullForecastMonthsOfStock] = useState(0);
  const [fullForecastStockValuePercentage, setFullForecastStockValuePercentage] = useState(0);

  const [globalAvgStock2024, setGlobalAvgStock2024] = useState(0);
  const [globalStockValue2024, setGlobalStockValue2024] = useState(0);
  const [globalMonthsOfStock2024, setGlobalMonthsOfStock2024] = useState(0);
  const [globalStockValuePercentage2024, setGlobalStockValuePercentage2024] = useState(0);

  useEffect(() => {
    if (!hasSelectedData) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/stock/getStockByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        setStockSalesData(result.stockSalesData || []);

        // 🟢 Récupérer l'année actuelle
        const currentYear = new Date().getFullYear();

        const previousYear = currentYear - 1;

        // 🔹 Filtrer les données pour l'année en cours (2025)
        const stock2025 = result.stockSalesData.filter((d: StockSalesData) =>
          d.month.startsWith(`${currentYear}-`)
        );

        const stock2024 = result.stockSalesData.filter((d: StockSalesData) =>
          d.month.startsWith(`${previousYear}-`)
        );

        const totalAvgStock2025 = stock2025.length > 0
        ? stock2025.reduce((acc: number, cur: StockSalesData) => acc + parseFloat(String(cur.total_avg_stock ?? "0")), 0) / stock2025.length
        : 0;
      
      const totalStockValue2025 = stock2025.length > 0
        ? stock2025.reduce((acc: number, cur: StockSalesData) => acc + parseFloat(String(cur.total_stock_value ?? "0")), 0) / stock2025.length
        : 0;

        const totalRevenue2025 = stock2025.reduce(
          (acc: number, cur: StockSalesData) => acc + parseFloat(String(cur.total_revenue ?? "0")),
          0
        );

        // 🔢 Calcul du Nombre de Mois de Stock
        const monthsOfStock2025 = totalRevenue2025 > 0 ? totalStockValue2025 / (totalRevenue2025 / 12) : 0;

        // 🔢 Calcul du % Valeur Stock / CA
        const stockPercentage2025 = totalRevenue2025 > 0 ? (totalStockValue2025 / totalRevenue2025) * 100 : 0;

        // 🔢 Calcul des valeurs ajustées 2024 (jusqu'au mois actuel)
        const currentMonth = new Date().getMonth() + 1;
        const adjustedStock2024 = stock2024.filter((d) => parseInt(d.month.split("-")[1]) <= currentMonth);

        // ✅ Calcul des valeurs globales pour 2024 (toute l'année)
const totalGlobalAvgStock2024 = stock2024.reduce(
  (acc: number, cur: StockSalesData) => acc + parseFloat(String(cur.total_avg_stock ?? "0")),
  0
) / (stock2024.length || 1);

const totalGlobalStockValue2024 = stock2024.reduce(
  (acc: number, cur: StockSalesData) => acc + parseFloat(String(cur.total_stock_value ?? "0")),
  0
);

const totalGlobalRevenue2024 = stock2024.reduce(
  (acc: number, cur: StockSalesData) => acc + parseFloat(String(cur.total_revenue ?? "0")),
  0
);

const totalGlobalMonthsOfStock2024 = totalGlobalRevenue2024 > 0 ? totalGlobalStockValue2024 / (totalGlobalRevenue2024 / 12) : 0;
const totalGlobalStockValuePercentage2024 = totalGlobalRevenue2024 > 0 ? (totalGlobalStockValue2024 / totalGlobalRevenue2024) * 100 : 0;

// ✅ Mise à jour des variables d'état
setGlobalAvgStock2024(totalGlobalAvgStock2024);
setGlobalStockValue2024(totalGlobalStockValue2024);
setGlobalMonthsOfStock2024(totalGlobalMonthsOfStock2024);
setGlobalStockValuePercentage2024(totalGlobalStockValuePercentage2024);
        
        
        const adjustedAvgStock = adjustedStock2024.reduce(
          (acc: number, cur: StockSalesData) => acc + parseFloat(String(cur.total_avg_stock ?? "0")),
          0
        );

        const adjustedStockValue = adjustedStock2024.reduce(
          (acc: number, cur: StockSalesData) => acc + parseFloat(String(cur.total_stock_value ?? "0")),
          0
        );

        const adjustedRevenue2024 = adjustedStock2024.reduce(
          (acc: number, cur: StockSalesData) => acc + parseFloat(String(cur.total_revenue ?? "0")),
          0
        );

        const adjustedMonthsOfStock = adjustedRevenue2024 > 0 ? adjustedStockValue / (adjustedRevenue2024 / 12) : 0;
        const adjustedStockPercentage = adjustedRevenue2024 > 0 ? (adjustedStockValue / adjustedRevenue2024) * 100 : 0;

        // Mise à jour des valeurs ajustées
        setAdjustedAvgStock2024(adjustedAvgStock);
        setAdjustedStockValue2024(adjustedStockValue);
        setAdjustedMonthsOfStock2024(adjustedMonthsOfStock);
        setAdjustedStockValuePercentage2024(adjustedStockPercentage);

        setTotalAvgStock(totalAvgStock2025);
        setTotalStockValue(totalStockValue2025);
        setMonthsOfStock(monthsOfStock2025);
        setStockValuePercentage(stockPercentage2025);
      } catch (err) {
        setError("Impossible de récupérer les données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, hasSelectedData]);

  useEffect(() => {
    if (!hasSelectedData || stockSalesData.length === 0) return;
  
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
  
    // 📌 Séparer les données 2025 et 2024 par mois
    const stockByMonth2025: { [key: string]: StockSalesData } = {};
    const stockByMonth2024: { [key: string]: StockSalesData } = {};
  
    stockSalesData.forEach((d: StockSalesData) => {
      const [year, month] = d.month.split("-");
      if (year === `${currentYear}`) stockByMonth2025[month] = d;
      if (year === `${previousYear}`) stockByMonth2024[month] = d;
    });
  
    // 📌 Générer les valeurs prévisionnelles en complétant avec 2024 si besoin
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  
    const completeForecast = months.map((month) => {
      const data2025 = stockByMonth2025[month];
      const data2024 = stockByMonth2024[month];
  
      return data2025
        ? data2025 // ✅ Utiliser 2025 si disponible
        : data2024
        ? { ...data2024, month: `${currentYear}-${month}` } // 🔄 Sinon utiliser 2024
        : { month: `${currentYear}-${month}`, total_avg_stock: 0, total_stock_value: 0, total_quantity: 0, total_revenue: 0 }; // 🔹 Mois vides
    });
  
    // 📌 Appliquer l'évolution (%) et mettre à jour les prévisions
    const projectedGrowthFactor = 1 + forecastPercentage / 100;
  
    const forecastAvgStock = completeForecast.length > 0
    ? completeForecast.reduce((acc, cur) => acc + parseFloat(String(cur.total_avg_stock ?? "0")), 0) / completeForecast.length
    : 0;
  
  const forecastStockValue = completeForecast.length > 0
    ? completeForecast.reduce((acc, cur) => acc + parseFloat(String(cur.total_stock_value ?? "0")), 0) / completeForecast.length
    : 0;
  
  setFullForecastAvgStock(forecastAvgStock * projectedGrowthFactor);
  setFullForecastStockValue(forecastStockValue * projectedGrowthFactor);
  
    const totalForecastRevenue = completeForecast.reduce((acc, cur) => acc + parseFloat(String(cur.total_revenue ?? "0")), 0);
  
    setFullForecastMonthsOfStock(
      totalForecastRevenue > 0 ? (fullForecastStockValue / (totalForecastRevenue / 12)) * projectedGrowthFactor : 0
    );
  
    setFullForecastStockValuePercentage(
      totalForecastRevenue > 0 ? ((fullForecastStockValue / totalForecastRevenue) * 100) * projectedGrowthFactor : 0
    );
  
  }, [stockSalesData, forecastPercentage, hasSelectedData]);


  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!stockSalesData || stockSalesData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      <StockSummary2025
        totalAvgStock={totalAvgStock}
        totalStockValue={totalStockValue}
        monthsOfStock={monthsOfStock}
        stockValuePercentage={stockValuePercentage}
        adjustedAvgStock2024={adjustedAvgStock2024}
        adjustedStockValue2024={adjustedStockValue2024}
        adjustedMonthsOfStock2024={adjustedMonthsOfStock2024}
        adjustedStockValuePercentage2024={adjustedStockValuePercentage2024}
      />

      <ForecastSummary2025
        forecastAvgStock={fullForecastAvgStock}
        forecastStockValue={fullForecastStockValue}
        forecastMonthsOfStock={fullForecastMonthsOfStock}
        forecastStockValuePercentage={fullForecastStockValuePercentage}
        forecastPercentage={forecastPercentage}
        setForecastPercentage={setForecastPercentage}
        globalAvgStock2024={adjustedAvgStock2024}
        globalStockValue2024={adjustedStockValue2024}
        globalMonthsOfStock2024={adjustedMonthsOfStock2024}
        globalStockValuePercentage2024={adjustedStockValuePercentage2024}
      />

      <StockDataMonthly stockData={stockSalesData} loading={loading} error={error} />

    </div>
  );
};

export default StockDataComponent;