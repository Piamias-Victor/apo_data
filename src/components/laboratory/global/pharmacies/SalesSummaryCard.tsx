import React, { useEffect, useState } from "react";
import { FaCrown } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import { DataBlockProps } from "../DataBlock";

// 📌 Définition des types
interface SalesData {
  pharmacy_id: string;
  pharmacy_name: string;
  revenue: number;
  margin: number;
  type: "current" | "comparison";
  revenueEvolution?: number;
  marginEvolution?: number;
}

const TopPharmaciesCard: React.FC = () => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/sell-out/getSalesByPharmacy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();
        const data: SalesData[] = result.salesData || [];

        // 🔹 Séparer les périodes
        const currentSales = data.filter((entry) => entry.type === "current");
        const comparisonSales = data.filter((entry) => entry.type === "comparison");

        // 🔹 Associer les comparaisons et calculer l'évolution
        const salesWithEvolution: SalesData[] = currentSales.map((current) => {
          const comparison = comparisonSales.find((c) => c.pharmacy_id === current.pharmacy_id);
          return {
            ...current,
            revenueEvolution: comparison ? calculateEvolution(comparison.revenue, current.revenue) : null,
            marginEvolution: comparison ? calculateEvolution(comparison.margin, current.margin) : null,
          };
        });

        setSalesData(salesWithEvolution);
      } catch (error) {
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // 📌 Fonction pour calculer l'évolution en %
  const calculateEvolution = (oldValue: number, newValue: number): number => {
    if (!oldValue || oldValue === 0) return newValue ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  // 📊 Trier les pharmacies par CA et Marge
  const topRevenuePharmacies = [...salesData].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
  const topMarginPharmacies = [...salesData].sort((a, b) => b.margin - a.margin).slice(0, 3);

  // ✅ Correction : Prendre le TOP 3 des meilleures progressions en CA
  const topEvolutionPharmacies = salesData
    .filter((pharmacy) => pharmacy.revenueEvolution !== null) // Exclure les valeurs nulles
    .sort((a, b) => (b.revenueEvolution ?? 0) - (a.revenueEvolution ?? 0)) // Trier par % de progression en CA
    .slice(0, 3); // Prendre les 3 meilleures progressions

  // 🔹 Formatage des dates
  const formatDate = (date: Date | null) =>
    date ? format(date, "dd/MM/yy", { locale: fr }) : "--/--/--";

  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* 📊 Titre & Dates */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaCrown className="text-pink-500" /> Pharmacies Leaders
        </h2>

        {/* 🔹 Bloc des périodes */}
        <div className="flex justify-center md:justify-start gap-8 bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg text-white shadow-sm relative z-10">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-6 relative z-10">
          {/* 🏆 TOP 3 CA */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 border-b border-gray-300 pb-2 text-pink-600">🏆 Top 3 CA</h3>
            {topRevenuePharmacies.map((pharmacy, index) => (
              <>
                <DataBlock key={pharmacy.pharmacy_id} title={`${pharmacy.pharmacy_name}`} value={pharmacy.revenue} isCurrency />
                <div className="mt-2"/>
              </>

            ))}
          </div>

          {/* 💰 TOP 3 Marge */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 border-b border-gray-300 pb-2 text-pink-600">💰 Top 3 Marge</h3>
            {topMarginPharmacies.map((pharmacy, index) => (
              <>
                <DataBlock key={pharmacy.pharmacy_id} title={`${pharmacy.pharmacy_name}`} value={pharmacy.margin} isCurrency />
                <div className="mt-2"/>
              </>
            ))}
          </div>

          {/* 🔥 Top 3 Progressions en CA */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 border-b border-gray-300 pb-2 text-pink-600">🔥 Top 3 Progressions (CA)</h3>
            {topEvolutionPharmacies.map((pharmacy, index) => (
              <>
                <DataBlock key={pharmacy.pharmacy_id} title={`${pharmacy.pharmacy_name}`} value={pharmacy.revenueEvolution ?? 0} isPercentage />
                <div className="mt-2"/>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopPharmaciesCard;

const DataBlock: React.FC<DataBlockProps> = ({ title, value, previousValue, isCurrency = false, isPercentage = false }) => {
  let percentageChange: number | string = "N/A"; // Valeur par défaut

  const previousNumber = Number(previousValue);

  if (previousNumber !== undefined && previousValue !== null) {
    if (previousNumber === 0) {
      percentageChange = value > 0 ? "+100%" : "0%"; // Si `previousValue` est 0, on évite `Infinity%`
    } else {
      percentageChange = ((value - previousNumber) / previousNumber) * 100;
      percentageChange = Number(percentageChange.toFixed(1)); // ✅ Convertir en nombre avant d'afficher
      percentageChange = `${percentageChange}%`;
    }
  }

  return (
    <div className="text-center">
      {/* 🔹 Valeur actuelle */}
      <p className="text-xl font-bold">
        {formatLargeNumber(value, isCurrency)} {isPercentage ? "%" : ""}
      </p>
      <p className="text-sm opacity-80">{title}</p>

      {/* 🔺 Variation en pourcentage */}
      {previousValue !== undefined && previousValue !== null && (
        <div className="flex items-center justify-center mt-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
              typeof percentageChange === "string" && percentageChange.includes("-")
                ? "bg-red-400 text-white"
                : percentageChange !== "N/A" && percentageChange !== "0%"
                ? "bg-green-400 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {percentageChange}
          </span>
        </div>
      )}

    </div>
  );
};