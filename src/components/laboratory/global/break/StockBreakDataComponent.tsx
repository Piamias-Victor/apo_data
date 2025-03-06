import React, { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/FilterContext";
import Loader from "@/components/ui/Loader";
import AnnualStockBreak2024 from "./AnnualStockBreak2024";
import AnnualStockBreak2025 from "./AnnualStockBreak2025";
import ForecastStockBreak2025 from "./ForecastStockBreak2025";
import StockBreakDataMonthly from "./StockBreakDataMonthly";

interface StockBreakData {
  month: string;
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
}

const StockBreakDataComponent: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedData =
  filters.distributors.length > 0 ||
  filters.brands.length > 0 ||
  filters.universes.length > 0 ||
  filters.categories.length > 0 ||
  filters.families.length > 0 ||
  filters.specificities.length > 0 || 
  filters.ean13Products.length > 0;;
  const [stockBreakData, setStockBreakData] = useState<StockBreakData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastPercentage, setForecastPercentage] = useState(0);

  const [completeForecast, setCompleteForecast] = useState<StockBreakData[]>([]);

  const [totalProductOrder, setTotalProductOrder] = useState(0);
  const [totalBreakProduct, setTotalBreakProduct] = useState(0);
  const [totalBreakAmount, setTotalBreakAmount] = useState(0);
  const [totalBreakRate, setTotalBreakRate] = useState(0);

  const [globalProductOrder2024, setGlobalProductOrder2024] = useState(0);
  const [globalBreakProduct2024, setGlobalBreakProduct2024] = useState(0);
  const [globalBreakAmount2024, setGlobalBreakAmount2024] = useState(0);
  const [globalBreakRate2024, setGlobalBreakRate2024] = useState(0);

  const [fullForecastProductOrder, setFullForecastProductOrder] = useState(0);
  const [fullForecastBreakProduct, setFullForecastBreakProduct] = useState(0);
  const [fullForecastBreakAmount, setFullForecastBreakAmount] = useState(0);
  const [fullForecastBreakRate, setFullForecastBreakRate] = useState(0);

  const [adjustedProductOrder2024, setAdjustedProductOrder2024] = useState(0);
  const [adjustedBreakProduct2024, setAdjustedBreakProduct2024] = useState(0);
  const [adjustedBreakAmount2024, setAdjustedBreakAmount2024] = useState(0);
  const [adjustedBreakRate2024, setAdjustedBreakRate2024] = useState(0);

  const parseNumber = (value: any): number => isNaN(parseFloat(value)) ? 0 : parseFloat(value);
  const sum = (arr: any[]) => arr.reduce((acc, val) => acc + parseNumber(val), 0);

  useEffect(() => {
    if (!hasSelectedData) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/sell-out/getStockBreakRateByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        setStockBreakData(result.stockBreakData || []);

        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // 🔹 Séparer les données 2025 et 2024 par mois
        const stockBreakByMonth2025: { [key: string]: StockBreakData } = {};
        const stockBreakByMonth2024: { [key: string]: StockBreakData } = {};

        result.stockBreakData.forEach((d: StockBreakData) => {
          const [year, month] = d.month.split("-");
          if (year === `${currentYear}`) stockBreakByMonth2025[month] = d;
          if (year === `${previousYear}`) stockBreakByMonth2024[month] = d;
        });

        // 🔹 Compléter 2025 avec 2024 pour les mois manquants
        const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

        const forecastData = months.map((month) => {
          const data2025 = stockBreakByMonth2025[month];
          const data2024 = stockBreakByMonth2024[month];

          return data2025
            ? data2025
            : data2024
            ? { ...data2024, month: `${currentYear}-${month}` }
            : { month: `${currentYear}-${month}`, total_products_ordered: 0, stock_break_products: 0, stock_break_rate: 0, stock_break_amount: 0 };
        });

        setCompleteForecast(forecastData);

        // 🔹 Calcul des totaux 2025
        const stockBreak2025 = Object.values(stockBreakByMonth2025);
        setTotalProductOrder(sum(stockBreak2025.map(d => d.total_products_ordered)));
        setTotalBreakProduct(sum(stockBreak2025.map(d => d.stock_break_products)));
        setTotalBreakAmount(sum(stockBreak2025.map(d => d.stock_break_amount)));
        setTotalBreakRate(totalProductOrder > 0 ? (totalBreakProduct / totalProductOrder) * 100 : 0);

        // 🔹 Calcul des totaux 2024
        const stockBreak2024 = Object.values(stockBreakByMonth2024);
        setGlobalProductOrder2024(sum(stockBreak2024.map(d => d.total_products_ordered)));
        setGlobalBreakProduct2024(sum(stockBreak2024.map(d => d.stock_break_products)));
        setGlobalBreakAmount2024(sum(stockBreak2024.map(d => d.stock_break_amount)));
        setGlobalBreakRate2024(globalProductOrder2024 > 0 ? (globalBreakProduct2024 / globalProductOrder2024) * 100 : 0);

        const currentMonth = new Date().getMonth() + 1; // Ex: Février = 2
        const monthsUpToCurrent = Array.from({ length: currentMonth }, (_, i) =>
          (i + 1).toString().padStart(2, "0")
        );

        const adjustedStockBreak2024 = Object.values(stockBreakByMonth2024).filter(d =>
          monthsUpToCurrent.includes(d.month.split("-")[1])
        );

        const adjustedProductOrder = sum(adjustedStockBreak2024.map(d => d.total_products_ordered));
        const adjustedBreakProduct = sum(adjustedStockBreak2024.map(d => d.stock_break_products));
        const adjustedBreakAmount = sum(adjustedStockBreak2024.map(d => d.stock_break_amount));
        const adjustedBreakRate = adjustedProductOrder > 0 ? (adjustedBreakProduct / adjustedProductOrder) * 100 : 0;

        // 🔹 Mise à jour des valeurs ajustées
        setAdjustedProductOrder2024(adjustedProductOrder);
        setAdjustedBreakProduct2024(adjustedBreakProduct);
        setAdjustedBreakAmount2024(adjustedBreakAmount);
        setAdjustedBreakRate2024(adjustedBreakRate);
        
      } catch (err) {
        setError("Impossible de récupérer les données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, hasSelectedData]);

  useEffect(() => {
    if (!hasSelectedData || completeForecast.length === 0) return;

    const projectedGrowthFactor = 1 + forecastPercentage / 100;

    const totalForecastProductOrder = sum(completeForecast.map(d => d.total_products_ordered));
    const totalForecastBreakProduct = sum(completeForecast.map(d => d.stock_break_products));
    const totalForecastBreakAmount = sum(completeForecast.map(d => d.stock_break_amount));

    setFullForecastProductOrder(totalForecastProductOrder * projectedGrowthFactor);
    setFullForecastBreakProduct(totalForecastBreakProduct * projectedGrowthFactor);
    setFullForecastBreakAmount(totalForecastBreakAmount * projectedGrowthFactor);

    setFullForecastBreakRate(totalForecastProductOrder > 0 ? (fullForecastBreakProduct / fullForecastProductOrder) * 100 : 0);

    const newForecastBreakRate = fullForecastProductOrder > 0 
  ? (fullForecastBreakProduct / fullForecastProductOrder) * 100 
  : 0;

setFullForecastBreakRate(newForecastBreakRate);
  }, [forecastPercentage, completeForecast, hasSelectedData]);

  useEffect(() => {
    if (!hasSelectedData) return;
  
    // 🟢 Vérification avant le calcul
    if (totalProductOrder > 0) {
      const newBreakRate2025 = (totalBreakProduct / totalProductOrder) * 100;
      setTotalBreakRate(newBreakRate2025);
    }
  
    if (globalProductOrder2024 > 0) {
      const newBreakRate2024 = (globalBreakProduct2024 / globalProductOrder2024) * 100;
      setGlobalBreakRate2024(newBreakRate2024);
    }
  
    if (fullForecastProductOrder > 0) {
      const newForecastBreakRate = (fullForecastBreakProduct / fullForecastProductOrder) * 100;
      setFullForecastBreakRate(newForecastBreakRate);
    }
  
  }, [totalProductOrder, totalBreakProduct, globalProductOrder2024, globalBreakProduct2024, fullForecastProductOrder, fullForecastBreakProduct]);

  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!stockBreakData || stockBreakData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      <AnnualStockBreak2025/>

      <ForecastStockBreak2025
        forecastBreakProduct={fullForecastBreakProduct}
        forecastBreakRate={fullForecastBreakRate}
        forecastBreakAmount={fullForecastBreakAmount}
        forecastProductOrder={fullForecastProductOrder}
        forecastPercentage={forecastPercentage}
        setForecastPercentage={setForecastPercentage}
        globalBreakProduct2024={globalBreakProduct2024}
        globalBreakRate2024={globalBreakRate2024}
        globalBreakAmount2024={globalBreakAmount2024}
        globalProductOrder2024={globalProductOrder2024}
      />

      <StockBreakDataMonthly stockBreakData={stockBreakData} loading={loading} error={error} />
    </div>
  );
};

export default StockBreakDataComponent;