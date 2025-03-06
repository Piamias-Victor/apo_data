import { useFilterContext } from "@/contexts/FilterContext";
import React, { useEffect, useState } from "react";

interface SegmentationRevenueData {
  universe: string;
  category: string;
  sub_category: string;
  brand_lab: string;
  lab_distributor: string;
  range_name: string;
  specificity: string;
  family: string;
  sub_family: string;
  revenue: number;
  margin: number;
}

const Test: React.FC = () => {
  const [segmentationData, setSegmentationData] = useState<SegmentationRevenueData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilterContext();

  useEffect(() => {
    const fetchSegmentationData = async () => {
      setLoading(true);
      setError(null);
    
      try {
        const response = await fetch("/api/segmentation/getLabRevenuePosition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });
    
        if (!response.ok) throw new Error("Erreur lors de la récupération des données");

        const data = await response.json();
        
        // 🛠️ Conversion des strings en numbers
        const formattedData = data.segmentationData.map((item: any) => ({
          ...item,
          revenue: parseFloat(item.revenue) || 0,
          margin: parseFloat(item.margin) || 0
        }));

        setSegmentationData(formattedData);
      } catch (err) {
        setError("Impossible de récupérer les données.");
        console.error("❌ Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentationData();
  }, [filters]);

  if (loading) return <p className="text-gray-500 text-center">⏳ Chargement des données...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!segmentationData || segmentationData.length === 0)
    return <p className="text-gray-500 text-center">Aucune donnée disponible.</p>;

  // 🏗️ Fonction d'agrégation des données par segmentation
  const aggregateByKey = (key: keyof SegmentationRevenueData) => {
    return segmentationData.reduce((acc, data) => {
      const value = data[key] || "N/A";
      if (!acc[value]) {
        acc[value] = { revenue: 0, margin: 0 };
      }
      acc[value].revenue += data.revenue;
      acc[value].margin += data.margin;
      return acc;
    }, {} as Record<string, { revenue: number; margin: number }>);
  };

  // 📊 Agrégation des données pour chaque segmentation
  const revenueByUniverse = aggregateByKey("universe");
  const revenueByCategory = aggregateByKey("category");
  const revenueBySubCategory = aggregateByKey("sub_category");
  const revenueByFamily = aggregateByKey("family");
  const revenueBySubFamily = aggregateByKey("sub_family");
  const revenueByRange = aggregateByKey("range_name");
  const revenueBySpecificity = aggregateByKey("specificity");

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Segmentation - Chiffre d'Affaires & Marge</h2>

      {/* 🔹 Affichage des résultats par segmentation */}
      <div className="space-y-4">
        {[
          { title: "🌍 Chiffre d'affaires par Univers", data: revenueByUniverse },
          { title: "📦 Chiffre d'affaires par Catégorie", data: revenueByCategory },
          { title: "📌 Chiffre d'affaires par Sous-Catégorie", data: revenueBySubCategory },
          { title: "👨‍👩‍👧 Chiffre d'affaires par Famille", data: revenueByFamily },
          { title: "👶 Chiffre d'affaires par Sous-Famille", data: revenueBySubFamily },
          { title: "🔹 Chiffre d'affaires par Gamme", data: revenueByRange },
          { title: "🛠️ Chiffre d'affaires par Spécificité", data: revenueBySpecificity },
        ].map(({ title, data }, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-md shadow">
            <h3 className="text-md font-medium text-gray-700">{title}</h3>
            <ul className="text-sm text-gray-600 mt-2">
              {Object.entries(data).map(([key, values]) => (
                <li key={key} className="flex justify-between border-b py-1">
                  <span className="font-medium">{key}</span>
                  <span>💰 {values.revenue.toLocaleString()} €</span>
                  <span>💵 {values.margin.toLocaleString()} €</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Test;