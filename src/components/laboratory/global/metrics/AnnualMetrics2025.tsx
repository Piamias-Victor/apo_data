import React, { useEffect, useState } from "react";
import { FaTag, FaStore, FaChartLine } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatLargeNumber } from "@/libs/utils/formatUtils";
import DataBlock from "../DataBlock";

// Interface des données récupérées
interface LabMetrics {
  avgSellPrice: number;
  avgSellPriceEvolution: number | null;
  avgWeightedBuyPrice: number;
  avgWeightedBuyPriceEvolution: number | null;
  avgMargin: number;
  avgMarginEvolution: number | null;
  avgMarginPercentage: number;
  avgMarginPercentageEvolution: number | null;
  avgStockValue: number;
  avgStockValueEvolution: number | null;
  numReferencesSold: number;
  numReferencesSoldEvolution: number | null;
  numPharmaciesSold: number;
  numPharmaciesSoldEvolution: number | null;
  type: "current" | "comparison";
}

const AnnualMetrics2025: React.FC = () => {
  const { filters } = useFilterContext();
  const { dateRange, comparisonDateRange } = filters;

  // 🟢 Stocker les données API
  const [metrics, setMetrics] = useState<LabMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Appel API pour récupérer les métriques
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/getLabMetrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur API");

        const result = await response.json();

        // Conversion des valeurs string en number
        const formattedMetrics = result.metrics.map((item: any) => ({
          avgSellPrice: parseFloat(item.avgsellprice),
          avgSellPriceEvolution: item.avgsellpriceevolution ? parseFloat(item.avgsellpriceevolution) : null,
          avgWeightedBuyPrice: parseFloat(item.avgweightedbuyprice),
          avgWeightedBuyPriceEvolution: item.avgweightedbuypriceevolution ? parseFloat(item.avgweightedbuypriceevolution) : null,
          avgMargin: parseFloat(item.avgmargin),
          avgMarginEvolution: item.avgmarginevolution ? parseFloat(item.avgmarginevolution) : null,
          avgMarginPercentage: parseFloat(item.avgmarginpercentage),
          avgMarginPercentageEvolution: item.avgmarginpercentageevolution ? parseFloat(item.avgmarginpercentageevolution) : null,
          avgStockValue: parseFloat(item.avgstockvalue),
          avgStockValueEvolution: item.avgstockvalueevolution ? parseFloat(item.avgstockvalueevolution) : null,
          numReferencesSold: parseInt(item.numreferencessold, 10),
          numReferencesSoldEvolution: item.numreferencessoldevolution ? parseInt(item.numreferencessoldevolution, 10) : null,
          numPharmaciesSold: parseInt(item.numpharmaciessold, 10),
          numPharmaciesSoldEvolution: item.numpharmaciessoldevolution ? parseInt(item.numpharmaciessoldevolution, 10) : null,
          type: item.type,
        }));

        setMetrics(formattedMetrics);
      } catch (err) {
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]); // ⏳ Rafraîchissement à chaque changement de filtre

  // 🔵 Extraire les données des périodes
  const currentPeriod = metrics.find((data) => data.type === "current");
  const comparisonPeriod = metrics.find((data) => data.type === "comparison");

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
        <h2 className="text-lg font-semibold">📊 Résumé Annuel (2025)</h2>

        {/* 🔹 Bloc des périodes */}
        <div className="flex text-right px-3 py-2 rounded-lg bg-white bg-opacity-20 gap-8">
          <div className="flex flex-col gap-1 text-left">
            <p className="text-xs uppercase text-gray-200 font-semibold tracking-wide">Période</p>
            <p className="text-sm font-medium">{formattedStartDate} → {formattedEndDate}</p>
          </div>
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
        <div>
          <h3 className="text-md font-semibold mb-3 flex items-center border-b border-white pb-2">
            <FaChartLine className="mr-2" /> Indicateurs Clés
          </h3>

          {/* 🌟 Affichage des métriques */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <DataBlock title="Prix Vente Moyen" value={currentPeriod?.avgSellPrice || 0} previousValue={comparisonPeriod?.avgSellPrice || 0} isCurrency />
            <DataBlock title="Prix Achat Moyen" value={currentPeriod?.avgWeightedBuyPrice || 0} previousValue={comparisonPeriod?.avgWeightedBuyPrice || 0} isCurrency />
            <DataBlock title="Marge Moyenne" value={currentPeriod?.avgMargin || 0} previousValue={comparisonPeriod?.avgMargin || 0} isCurrency />
            <DataBlock title="Marge %" value={currentPeriod?.avgMarginPercentage || 0} previousValue={comparisonPeriod?.avgMarginPercentage || 0} isPercentage />
            <DataBlock title="Réfs Vendues" value={currentPeriod?.numReferencesSold || 0} previousValue={comparisonPeriod?.numReferencesSold || 0} />
            <DataBlock title="Pharmacies" value={currentPeriod?.numPharmaciesSold || 0} previousValue={comparisonPeriod?.numPharmaciesSold || 0} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualMetrics2025;