import React, { useEffect, useState } from "react";
import DataBlock from "../DataBlock";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Interface des données récupérées
interface StockBreakRateData {
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
  type: "current" | "comparison";
}

const AnnualStockBreak2025: React.FC = () => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // 🟢 Stocker les données API
  const [stockBreakData, setStockBreakData] = useState<StockBreakRateData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Appel API pour récupérer les ruptures de stock
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/sell-out/getStockBreakRate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        setStockBreakData(result.stockBreakData || []);
      } catch (err) {
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]); // ⏳ Rafraîchissement à chaque changement de filtre

  // 🔵 Extraire les données des périodes
  const currentPeriod = stockBreakData.find((data) => data.type === "current");
  const comparisonPeriod = stockBreakData.find((data) => data.type === "comparison");

  // 🔹 Formatage des dates
  const formattedStartDate = dateRange[0] ? format(dateRange[0], "dd/MM/yy", { locale: fr }) : "--/--/--";
  const formattedEndDate = dateRange[1] ? format(dateRange[1], "dd/MM/yy", { locale: fr }) : "--/--/--";

  const formattedComparisonStartDate = comparisonDateRange[0]
    ? format(comparisonDateRange[0], "dd/MM/yy", { locale: fr })
    : "--/--/--";
  const formattedComparisonEndDate = comparisonDateRange[1]
    ? format(comparisonDateRange[1], "dd/MM/yy", { locale: fr })
    : "--/--/--";

  return (
    <div className="p-6 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Taux de Rupture</h2>

        {/* 🔹 Bloc des périodes */}
        <div className="flex text-right px-3 py-2 rounded-lg bg-white bg-opacity-20 gap-8">
          {/* 🔵 Période principale */}
          <div className="flex flex-col gap-1 text-left">
            <p className="text-xs uppercase text-gray-200 font-semibold tracking-wide">Période</p>
            <p className="text-sm font-medium">{formattedStartDate} → {formattedEndDate}</p>
          </div>
          {/* 🔸 Période de comparaison */}
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase text-gray-200 font-semibold tracking-wide">Comparaison</p>
            <p className="text-sm font-medium">{formattedComparisonStartDate} → {formattedComparisonEndDate}</p>
          </div>
        </div>
      </div>

      {/* 🟢 Affichage du statut de chargement / erreur */}
      {loading ? (
        <p className="text-center text-white">⏳ Chargement des données...</p>
      ) : error ? (
        <p className="text-center text-red-300">{error}</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <DataBlock
            title="Produits commandés"
            value={currentPeriod?.total_products_ordered || 0}
            previousValue={comparisonPeriod?.total_products_ordered || 0}
          />
          <DataBlock
            title="Produits en rupture"
            value={currentPeriod?.stock_break_products || 0}
            previousValue={comparisonPeriod?.stock_break_products || 0}
          />
          <DataBlock
            title="Taux de rupture"
            value={currentPeriod?.stock_break_rate || 0}
            previousValue={comparisonPeriod?.stock_break_rate || 0}
            isPercentage
          />
          <DataBlock
            title="Montant rupture"
            value={currentPeriod?.stock_break_amount || 0}
            previousValue={comparisonPeriod?.stock_break_amount || 0}
            isCurrency
          />
        </div>
      )}
    </div>
  );
};

export default AnnualStockBreak2025;