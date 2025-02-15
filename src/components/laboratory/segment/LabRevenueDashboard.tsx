import React, { useEffect, useState } from "react";
import LabRevenueCard from "./LabRevenueCard";
import Loader from "@/components/ui/Loader";
import { useFilterContext } from "@/contexts/FilterContext";
import SearchInput from "@/components/ui/inputs/SearchInput";

const LabRevenueDashboard: React.FC = () => {
  const [data, setData] = useState<{ segment: string; type: string; revenue: number; globalrevenue: number; margin: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // 🔍 État pour la recherche
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilterContext(); // ✅ Récupère les filtres

  useEffect(() => {
    const fetchLabRevenue = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const response = await fetch("/api/segmentation/getLabRevenuePosition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });
  
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
  
        const result = await response.json();

        // ✅ Vérification et conversion des valeurs en nombre
        const formattedData = result.labRevenuePosition.map((item: any) => ({
          segment: item.segment,
          type: item.type, 
          revenue: item.revenue ? parseFloat(item.revenue) : 0, 
          globalrevenue: item.globalrevenue ? parseFloat(item.globalrevenue) : 0,
          margin: item.margin ? parseFloat(item.margin) : 0, // 🔹 Ajout de la marge
          globalmargin: item.globalmargin ? parseFloat(item.globalmargin) : 0,
        }));
  
        setData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
  
    fetchLabRevenue();
  }, [filters]);

  // ✅ **Tri par type (universe → Catégorie → Famille)**
  const groupedData: Record<string, { segment: string; revenue: number; globalrevenue: number; margin: number, globalmargin: number }[]> = {
    universe: [],
    category: [],
    family: [],
  };

  data.forEach((item) => {
    if (groupedData[item.type]) {
      groupedData[item.type].push(item);
    }
  });

  // ✅ **Filtrage des segments en fonction de la recherche**
  const filteredData: typeof groupedData = {
    universe: groupedData.universe.filter((item) =>
      item.segment.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    category: groupedData.category.filter((item) =>
      item.segment.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    family: groupedData.family.filter((item) =>
      item.segment.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  const sectionTitles: Record<string, string> = {
    universe: "🌍 Analyse par universe",
    category: "📂 Analyse par Catégorie",
    family: "🏷️ Analyse par Famille",
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* 🟠 Gestion du chargement et des erreurs */}
      {loading && <Loader message="Chargement des données du laboratoire..." />}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="text-gray-500 text-center">Aucune donnée disponible pour ce laboratoire.</p>
      )}

      {/* 🔍 Barre de recherche */}
      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un segment..." />

      {/* 📊 Affichage structuré par type */}
      {Object.entries(filteredData).map(([type, items]) =>
        items.length > 0 ? (
          <div key={type} className="mb-8">
            {/* 🔹 Titre de section */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2">
              {sectionTitles[type]}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item, index) => (
                <LabRevenueCard
                  key={index}
                  segment={item.segment}
                  revenue={item.revenue}
                  globalrevenue={item.globalrevenue}
                  margin={item.margin}          // ✅ Ajout de la marge du labo
                  globalmargin={item.globalmargin} // ✅ Ajout de la marge globale
                  type={type}
                />
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default LabRevenueDashboard;