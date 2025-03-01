import React, { useEffect, useState } from "react";
import { FaTag, FaStore, FaChartLine } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
    
        // 🔹 Transformation des données : conversion des strings en nombres
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
  const formatDate = (date: Date | null) =>
    date ? format(date, "dd/MM/yy", { locale: fr }) : "--/--/--";

  return (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 relative">
      {/* 📊 Titre & Dates */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📊 Résumé Annuel (2025)
        </h2>

        {/* 🔹 Bloc des périodes */}
        <div className="flex justify-center md:justify-start gap-8 bg-violet-500 hover:bg-violet-600 px-4 py-2 rounded-lg text-white shadow-sm relative z-10">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 relative z-10">
          {/* 🔵 INDICATEURS CLÉS */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-violet-600">
              <FaChartLine className="mr-2" /> Indicateurs Clés
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <DataBlock title="Prix Vente Moyen" value={currentPeriod?.avgSellPrice || 0} previousValue={comparisonPeriod?.avgSellPrice || 0} isCurrency />
              <DataBlock title="Prix Achat Moyen" value={currentPeriod?.avgWeightedBuyPrice || 0} previousValue={comparisonPeriod?.avgWeightedBuyPrice || 0} isCurrency />
              <DataBlock title="Marge Moyenne" value={currentPeriod?.avgMargin || 0} previousValue={comparisonPeriod?.avgMargin || 0} isCurrency />
              <DataBlock title="Marge %" value={currentPeriod?.avgMarginPercentage || 0} previousValue={comparisonPeriod?.avgMarginPercentage || 0} isPercentage />
            </div>
          </div>

          {/* 🟠 STOCK & DISTRIBUTION */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-md font-semibold mb-4 flex items-center border-b border-gray-300 pb-2 text-violet-600">
              <FaStore className="mr-2" /> Stock & Distribution
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <DataBlock title="Valeur Moyenne du Stock" value={currentPeriod?.avgStockValue || 0} previousValue={comparisonPeriod?.avgStockValue || 0} isCurrency />
              <DataBlock title="Réfs Vendues" value={currentPeriod?.numReferencesSold || 0} previousValue={comparisonPeriod?.numReferencesSold || 0} />
              <DataBlock title="Pharmacies" value={currentPeriod?.numPharmaciesSold || 0} previousValue={comparisonPeriod?.numPharmaciesSold || 0} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualMetrics2025;