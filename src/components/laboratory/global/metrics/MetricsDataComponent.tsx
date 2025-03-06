import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/FilterContext";
import Loader from "@/components/ui/Loader";
import AnnualMetrics2025 from "./AnnualMetrics2025";
import MetricsDataMonthly from "./MetricsDataMonthly";
import AnnualMetrics2024 from "./AnnualMetrics2024";

interface PriceMarginData {
  month: string;
  avg_sale_price: number;
  prev_avg_sale_price: number;
  avg_purchase_price: number;
  prev_avg_purchase_price: number;
  avg_margin: number;
  prev_avg_margin: number;
  avg_margin_percentage: number;
  prev_avg_margin_percentage: number;
  unique_products_sold: number;
  prev_unique_products_sold: number;
  unique_selling_pharmacies: number;
  prev_unique_selling_pharmacies: number;
}

const MetricsDataComponent: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedData =
  filters.distributors.length > 0 ||
  filters.brands.length > 0 ||
  filters.universes.length > 0 ||
  filters.categories.length > 0 ||
  filters.families.length > 0 ||
  filters.specificities.length > 0 || 
  filters.ean13Products.length > 0;

  const [metricsData, setMetricsData] = useState<PriceMarginData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [avgSalePrice, setAvgSalePrice] = useState(0);
  const [prevAvgSalePrice, setPrevAvgSalePrice] = useState(0);
  const [avgPurchasePrice, setAvgPurchasePrice] = useState(0);
  const [prevAvgPurchasePrice, setPrevAvgPurchasePrice] = useState(0);
  const [avgMargin, setAvgMargin] = useState(0);
  const [prevAvgMargin, setPrevAvgMargin] = useState(0);
  const [avgMarginPercentage, setAvgMarginPercentage] = useState(0);
  const [prevAvgMarginPercentage, setPrevAvgMarginPercentage] = useState(0);
  const [uniqueProductsSold, setUniqueProductsSold] = useState(0);
  const [prevUniqueProductsSold, setPrevUniqueProductsSold] = useState(0);
  const [uniqueSellingPharmacies, setUniqueSellingPharmacies] = useState(0);
  const [prevUniqueSellingPharmacies, setPrevUniqueSellingPharmacies] = useState(0);

  const [globalAvgSalePrice2024, setGlobalAvgSalePrice2024] = useState(0);
    const [globalAvgPurchasePrice2024, setGlobalAvgPurchasePrice2024] = useState(0);
    const [globalAvgMargin2024, setGlobalAvgMargin2024] = useState(0);
    const [globalAvgMarginPercentage2024, setGlobalAvgMarginPercentage2024] = useState(0);
    const [globalUniqueProductsSold2024, setGlobalUniqueProductsSold2024] = useState(0);
    const [globalUniqueSellingPharmacies2024, setGlobalUniqueSellingPharmacies2024] = useState(0);

  useEffect(() => {
    if (!hasSelectedData) return;

    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/getMetricsByMonth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        setMetricsData(result.priceMarginData || []);

        // 🟢 Récupérer l'année actuelle et l'année précédente
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // 🔹 Filtrer les données pour l'année en cours (2025)
        const metrics2025 = result.priceMarginData.filter((d: PriceMarginData) =>
          d.month.startsWith(`${currentYear}-`)
        );

        // 🔹 Filtrer les données pour l'année précédente (2024)
        const metrics2024 = result.priceMarginData.filter((d: PriceMarginData) =>
          d.month.startsWith(`${previousYear}-`)
        );

        // ✅ Récupérer les valeurs actuelles et précédentes
        if (metrics2025.length > 0) {
          const latestMetrics = metrics2025[metrics2025.length - 1];
          setAvgSalePrice(latestMetrics.avg_sale_price);
          setAvgPurchasePrice(latestMetrics.avg_purchase_price);
          setAvgMargin(latestMetrics.avg_margin);
          setAvgMarginPercentage(latestMetrics.avg_margin_percentage);
          setUniqueProductsSold(latestMetrics.unique_products_sold);
          setUniqueSellingPharmacies(latestMetrics.unique_selling_pharmacies);
        }

        if (metrics2024.length > 0) {
            const totalAvgSalePrice2024 = metrics2024.reduce((acc, cur) => acc + parseFloat(String(cur.avg_sale_price ?? "0")), 0);
            const totalAvgPurchasePrice2024 = metrics2024.reduce((acc, cur) => acc + parseFloat(String(cur.avg_purchase_price ?? "0")), 0);
            const totalAvgMargin2024 = metrics2024.reduce((acc, cur) => acc + parseFloat(String(cur.avg_margin ?? "0")), 0);
            const totalAvgMarginPercentage2024 = metrics2024.reduce((acc, cur) => acc + parseFloat(String(cur.avg_margin_percentage ?? "0")), 0);
            
            // 🟢 ⚠️ CHANGEMENT ICI : on calcule la moyenne pour les Réfs Vendues et les Pharmacies
            const avgUniqueProductsSold2024 = metrics2024.reduce((acc, cur) => acc + parseFloat(String(cur.unique_products_sold ?? "0")), 0) / metrics2024.length;
            const avgUniqueSellingPharmacies2024 = metrics2024.reduce((acc, cur) => acc + parseFloat(String(cur.unique_selling_pharmacies ?? "0")), 0) / metrics2024.length;
          
            // ⚠️ Vérification : éviter la division par 0
            const count = metrics2024.length > 0 ? metrics2024.length : 1;
          
            setGlobalAvgSalePrice2024(totalAvgSalePrice2024 / count);
            setGlobalAvgPurchasePrice2024(totalAvgPurchasePrice2024 / count);
            setGlobalAvgMargin2024(totalAvgMargin2024 / count);
            setGlobalAvgMarginPercentage2024(totalAvgMarginPercentage2024 / count);
            setGlobalUniqueProductsSold2024(avgUniqueProductsSold2024); // ✅ Moyenne au lieu de la somme
            setGlobalUniqueSellingPharmacies2024(avgUniqueSellingPharmacies2024); // ✅ Moyenne au lieu de la somme
          } else {
            // ⚠️ Valeurs par défaut si aucun data en 2024
            setGlobalAvgSalePrice2024(0);
            setGlobalAvgPurchasePrice2024(0);
            setGlobalAvgMargin2024(0);
            setGlobalAvgMarginPercentage2024(0);
            setGlobalUniqueProductsSold2024(0);
            setGlobalUniqueSellingPharmacies2024(0);
          }
      } catch (err) {
        setError("Impossible de récupérer les données");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [filters, hasSelectedData]);

  if (!hasSelectedData) return <p className="text-center">Sélectionnez un laboratoire.</p>;
  if (loading) return <Loader message="Chargement des métriques..." />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!metricsData || metricsData.length === 0) return <p className="text-center">Aucune donnée disponible.</p>;

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-10">
      <AnnualMetrics2025/>

        <MetricsDataMonthly metricsData={metricsData} loading={loading} error={error} />
    </div>
  );
};

export default MetricsDataComponent;