import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DataBlock from "../DataBlock";

// Interface des données API
interface SalesData {
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  type: "current" | "comparison";
}

const AnnualSummary2025: React.FC = () => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // 🟢 Stocker les données API
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Fonction de récupération des données
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sell-out/getSalesData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      });

      if (!response.ok) throw new Error("Erreur API");

      const result = await response.json();
      setSalesData(result.salesData || []);
    } catch (err) {
      setError("Impossible de récupérer les données.");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Rafraîchir à chaque changement de filtre
  useEffect(() => {
    fetchData();
  }, [filters]);

  // 🔵 Extraire les données des périodes
  const currentPeriod = salesData.find((data) => data.type === "current");
  const comparisonPeriod = salesData.find((data) => data.type === "comparison");

  // 🔹 Formatage des dates
  const formatDate = (date: Date | null) =>
    date ? format(date, "dd/MM/yy", { locale: fr }) : "--/--/--";

  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* 📊 Titre & Dates */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📊 Résumé Périodique
        </h2>

        {/* 🔹 Bloc des périodes */}
        <div className="flex justify-center md:justify-start gap-8 bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg text-white shadow-sm relative z-10">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-6 relative z-10">
          {/* 🔵 SELL-OUT */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-teal-600">
              <FaShoppingCart className="mr-2" /> Sell-Out
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <DataBlock title="Volume" value={currentPeriod?.total_quantity || 0} previousValue={comparisonPeriod?.total_quantity || 0} />
              <DataBlock title="CA" value={currentPeriod?.revenue || 0} previousValue={comparisonPeriod?.revenue || 0} isCurrency />
              <DataBlock title="Marge" value={currentPeriod?.margin || 0} previousValue={comparisonPeriod?.margin || 0} isCurrency />
            </div>
          </div>

          {/* 🟠 SELL-IN */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-teal-600">
              <FaBoxOpen className="mr-2" /> Sell-In
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <DataBlock title="Volume" value={currentPeriod?.purchase_quantity || 0} previousValue={comparisonPeriod?.purchase_quantity || 0} />
              <DataBlock title="Montant" value={currentPeriod?.purchase_amount || 0} previousValue={comparisonPeriod?.purchase_amount || 0} isCurrency />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualSummary2025;