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
  const formatDate = (date: Date | null) =>
    date ? format(date, "dd/MM/yy", { locale: fr }) : "--/--/--";

  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* 📊 Titre & Dates */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📊 Taux de Rupture (2025)
        </h2>

        {/* 🔹 Bloc des périodes */}
        <div className="flex justify-center md:justify-start gap-8 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white shadow-sm relative z-10">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase">Période</span>
            <span className="text-sm font-medium">{formatDate(dateRange[0])} → {formatDate(dateRange[1])}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase">Comparaison</span>
            <span className="text-sm font-medium">{formatDate(comparisonDateRange[0])} → {formatDate(comparisonDateRange[1])}</span>
          </div>
        </div>
      </div>

      {/* 🟢 Affichage du statut de chargement / erreur */}
      {loading ? (
        <p className="text-center text-gray-800 mt-6">⏳ Chargement des données...</p>
      ) : error ? (
        <p className="text-center text-red-500 mt-6">{error}</p>
      ) : (
        <div className="grid grid-cols-4 gap-6 mt-6 relative z-10">
          {/* 🔴 Produits commandés */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-red-600">
              📦 Produits Commandés
            </h3>
            <DataBlock 
              title="Total" 
              value={currentPeriod?.total_products_ordered || 0} 
              previousValue={comparisonPeriod?.total_products_ordered || 0} 
            />
          </div>

          {/* 🚨 Produits en rupture */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-red-600">
              ❌ Produits en Rupture
            </h3>
            <DataBlock 
              title="Total" 
              value={currentPeriod?.stock_break_products || 0} 
              previousValue={comparisonPeriod?.stock_break_products || 0} 
            />
          </div>

          {/* 📉 Taux de Rupture */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-red-600">
              📊 Taux de Rupture
            </h3>
            <DataBlock 
              title="Taux %" 
              value={currentPeriod?.stock_break_rate || 0} 
              previousValue={comparisonPeriod?.stock_break_rate || 0} 
              isPercentage 
            />
          </div>

          {/* 💰 Montant des Ruptures */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-red-600">
              💰 Montant Rupture (€)
            </h3>
            <DataBlock 
              title="Montant" 
              value={currentPeriod?.stock_break_amount || 0} 
              previousValue={comparisonPeriod?.stock_break_amount || 0} 
              isCurrency 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualStockBreak2025;