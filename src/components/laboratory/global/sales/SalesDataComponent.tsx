import React, { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/FilterContext";
import Loader from "@/components/ui/Loader";
import SalesDataMonthly from "./SalesDataMonthly";
import AnnualSummary2025 from "./AnnualSummary2025";
import AnnualSummary2024 from "./AnnualSummary2024";
import ForecastSummary2025 from "./ForecastSummary2025";

interface SalesData {
  month: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
}

const SalesDataComponent: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0;

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const [globalSellOut2024, setGlobalSellOut2024] = useState(0);
  const [globalRevenue2024, setGlobalRevenue2024] = useState(0);
  const [globalMargin2024, setGlobalMargin2024] = useState(0);
  const [globalSellIn2024, setGlobalSellIn2024] = useState(0);
  const [globalPurchaseAmount2024, setGlobalPurchaseAmount2024] = useState(0);

  const [forecastPercentage, setForecastPercentage] = useState(0);

  const [fullForecastSellOut, setFullForecastSellOut] = useState(0);
  const [fullForecastRevenue, setFullForecastRevenue] = useState(0);
  const [fullForecastMargin, setFullForecastMargin] = useState(0);
  const [fullForecastSellIn, setFullForecastSellIn] = useState(0);
  const [fullForecastPurchaseAmount, setFullForecastPurchaseAmount] = useState(0);

  useEffect(() => {
    if (!hasSelectedLabs) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/sell-out/getSalesByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        setSalesData(result.salesData || []);

        // 🟢 Récupérer l'année actuelle et l'année précédente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // 🔹 Filtrer les données pour l'année en cours (2025)
        const sales2025 = result.salesData.filter((d: SalesData) =>
          d.month.startsWith(`${currentYear}-`)
        );

        const sales2024 = result.salesData.filter((d: SalesData) =>
          d.month.startsWith(`${previousYear}-`)
        );
        
        // ✅ Vérification des conversions avant l'addition
        setTotalSellOut(
          sales2025.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.total_quantity ?? "0")), 0)
        );
        setTotalRevenue(
          sales2025.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.revenue ?? "0")), 0)
        );
        setTotalMargin(
          sales2025.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.margin ?? "0")), 0)
        );
        setTotalSellIn(
          sales2025.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.purchase_quantity ?? "0")), 0)
        );
        setTotalPurchaseAmount(
          sales2025.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.purchase_amount ?? "0")), 0)
        );
        // 🔹 Filtrer les données pour l'année précédente (2024)

        // ✅ Calculer les totaux pour 2024 (ajusté jusqu'au mois actuel)
        const currentMonth = new Date().getMonth() + 1; // Ex: Février = 2
        const monthsUpToCurrent = Array.from({ length: currentMonth }, (_, i) =>
          (i + 1).toString().padStart(2, "0")
        );
  
        const adjustedSales2024 = sales2024.filter((d: SalesData) =>
          monthsUpToCurrent.includes(d.month.split("-")[1])
        );
  
        setAdjustedSellOut2024(
          adjustedSales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.total_quantity ?? "0")), 0)
        );
        setAdjustedRevenue2024(
          adjustedSales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.revenue ?? "0")), 0)
        );
        setAdjustedMargin2024(
          adjustedSales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.margin ?? "0")), 0)
        );
        setAdjustedSellIn2024(
          adjustedSales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.purchase_quantity ?? "0")), 0)
        );
        setAdjustedPurchaseAmount2024(
          adjustedSales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.purchase_amount ?? "0")), 0)
        );

        setGlobalSellOut2024(
          sales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.total_quantity ?? "0")), 0)
        );
        setGlobalRevenue2024(
          sales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.revenue ?? "0")), 0)
        );
        setGlobalMargin2024(
          sales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.margin ?? "0")), 0)
        );
        setGlobalSellIn2024(
          sales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.purchase_quantity ?? "0")), 0)
        );
        setGlobalPurchaseAmount2024(
          sales2024.reduce((acc: number, cur: SalesData) => acc + parseFloat(String(cur.purchase_amount ?? "0")), 0)
        );

      } catch (err) {
        setError("Impossible de récupérer les données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, hasSelectedLabs]);

  useEffect(() => {
    if (!hasSelectedLabs || salesData.length === 0) return;
  
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
  
    // 📌 Séparer les données 2025 et 2024
    const salesByMonth2025: { [key: string]: SalesData } = {};
    const salesByMonth2024: { [key: string]: SalesData } = {};
  
    salesData.forEach((d: SalesData) => {
      const [year, month] = d.month.split("-");
      if (year === `${currentYear}`) salesByMonth2025[month] = d;
      if (year === `${previousYear}`) salesByMonth2024[month] = d;
    });
  
    // 📌 Générer les valeurs prévisionnelles en complétant avec 2024 si besoin
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    
    const completeForecast = months.map((month) => {
      const data2025 = salesByMonth2025[month];
      const data2024 = salesByMonth2024[month];
  
      return data2025
        ? data2025 // ✅ Utiliser 2025 si disponible
        : data2024
        ? { ...data2024, month: `${currentYear}-${month}` } // 🔄 Sinon utiliser 2024
        : { month: `${currentYear}-${month}`, total_quantity: 0, revenue: 0, margin: 0, purchase_quantity: 0, purchase_amount: 0 }; // 🔹 Mois vides
    });
  
    // 📌 Appliquer l'évolution (%) et mettre à jour les prévisions
    const projectedGrowthFactor = 1 + forecastPercentage / 100;
  
    setFullForecastSellOut(
      completeForecast.reduce((acc, cur) => acc + parseFloat(String(cur.total_quantity ?? "0")), 0) * projectedGrowthFactor
    );
    setFullForecastRevenue(
      completeForecast.reduce((acc, cur) => acc + parseFloat(String(cur.revenue ?? "0")), 0) * projectedGrowthFactor
    );
    setFullForecastMargin(
      completeForecast.reduce((acc, cur) => acc + parseFloat(String(cur.margin ?? "0")), 0) * projectedGrowthFactor
    );
    setFullForecastSellIn(
      completeForecast.reduce((acc, cur) => acc + parseFloat(String(cur.purchase_quantity ?? "0")), 0) * projectedGrowthFactor
    );
    setFullForecastPurchaseAmount(
      completeForecast.reduce((acc, cur) => acc + parseFloat(String(cur.purchase_amount ?? "0")), 0) * projectedGrowthFactor
    );
  
  }, [salesData, forecastPercentage, hasSelectedLabs]);

  if (!hasSelectedLabs) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!salesData || salesData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">

      <AnnualSummary2025
        totalSellOut={totalSellOut}
        totalRevenue={totalRevenue}
        totalMargin={totalMargin}
        totalSellIn={totalSellIn}
        totalPurchaseAmount={totalPurchaseAmount}
        adjustedSellOut2024={adjustedSellOut2024}
        adjustedRevenue2024={adjustedRevenue2024}
        adjustedMargin2024={adjustedMargin2024}
        adjustedSellIn2024={adjustedSellIn2024}
        adjustedPurchaseAmount2024={adjustedPurchaseAmount2024}
      />

      <ForecastSummary2025
        forecastSellOut={fullForecastSellOut}
        forecastRevenue={fullForecastRevenue}
        forecastMargin={fullForecastMargin}
        forecastSellIn={fullForecastSellIn}
        forecastPurchaseAmount={fullForecastPurchaseAmount}
        forecastPercentage={forecastPercentage}
        setForecastPercentage={setForecastPercentage}
        globalSellOut2024={globalSellOut2024}
        globalRevenue2024={globalRevenue2024}
        globalMargin2024={globalMargin2024}
        globalSellIn2024={globalSellIn2024}
        globalPurchaseAmount2024={globalPurchaseAmount2024}
      />

      <AnnualSummary2024
        globalSellOut={globalSellOut2024}
        globalRevenue={globalRevenue2024}
        globalMargin={globalMargin2024}
        globalSellIn={globalSellIn2024}
        globalPurchaseAmount={globalPurchaseAmount2024}
      />

      <SalesDataMonthly salesData={salesData} loading={loading} error={error} />
    </div>
  );
};

export default SalesDataComponent;