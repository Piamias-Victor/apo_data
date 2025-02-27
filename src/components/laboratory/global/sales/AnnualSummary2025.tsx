import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

  // 📌 Appel API pour récupérer les ventes
  useEffect(() => {
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

    fetchData();
  }, [filters]); // ⏳ Rafraîchissement à chaque changement de filtre

  // 🔵 Extraire les données des périodes
  const currentPeriod = salesData.find((data) => data.type === "current");
  const comparisonPeriod = salesData.find((data) => data.type === "comparison");

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
    <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl shadow-lg border border-white">
      {/* 📊 Titre */}
      <div className="flex justify-between items-center border-b border-white pb-4 mb-4">
        <h2 className="text-lg font-semibold">📊 Résumé Périodique</h2>

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
        <div className="grid grid-cols-2 gap-8">
          {/* 🔵 SELL-OUT */}
          <div className="border-r border-white pr-6">
            <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
              <FaShoppingCart className="mr-2" /> Sell-Out
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <DataBlock
                title="Volume"
                value={currentPeriod?.total_quantity || 0}
                previousValue={comparisonPeriod?.total_quantity || 0}
              />
              <DataBlock
                title="CA"
                value={currentPeriod?.revenue || 0}
                previousValue={comparisonPeriod?.revenue || 0}
                isCurrency
              />
              <DataBlock
                title="Marge"
                value={currentPeriod?.margin || 0}
                previousValue={comparisonPeriod?.margin || 0}
                isCurrency
              />
            </div>
          </div>

          {/* 🟠 SELL-IN */}
          <div className="pl-6">
            <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
              <FaBoxOpen className="mr-2" /> Sell-In
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DataBlock
                title="Volume"
                value={currentPeriod?.purchase_quantity || 0}
                previousValue={comparisonPeriod?.purchase_quantity || 0}
              />
              <DataBlock
                title="Montant"
                value={currentPeriod?.purchase_amount || 0}
                previousValue={comparisonPeriod?.purchase_amount || 0}
                isCurrency
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DataBlockProps {
  title: string;
  value: number;
  previousValue: number;
  isCurrency?: boolean;
}

const DataBlock: React.FC<DataBlockProps> = ({ title, value, previousValue, isCurrency = false }) => {
  const percentageChange =
    previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : NaN;

  return (
    <div className="text-center">
      {/* 🔹 Valeur actuelle */}
      <p className="text-xl font-bold">{formatLargeNumber(value, isCurrency)}</p>
      <p className="text-sm opacity-80">{title}</p>

      {/* 🔺 Variation en pourcentage */}
      <div className="flex items-center justify-center mt-2">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
            percentageChange > 0
              ? "bg-green-400 text-white"
              : percentageChange < 0
              ? "bg-red-400 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          {!isNaN(percentageChange) ? `${percentageChange.toFixed(1)}%` : "N/A"}
        </span>
      </div>

      {/* 🔸 Valeur de comparaison */}
      <p className="text-sm font-semibold opacity-80 py-1">
        {formatLargeNumber(previousValue, isCurrency)}
      </p>
    </div>
  );
};

export default AnnualSummary2025;