import React, { useEffect, useState } from "react";

interface SegmentationRevenue {
  universe: string | null;
  category: string | null;
  sub_category: string | null;
  family: string | null;
  sub_family: string | null;
  specificity: string | null;
  revenue: number;
  global_revenue: number;
}

const SegmentationDebugComponent: React.FC = () => {
  const [data, setData] = useState<SegmentationRevenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/sell-out/getSegmentationRevenue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filters: {
              distributors: ['SVR'], // Mets ici tes valeurs de test si besoin
              brands: [],
              universes: [],
              categories: [],
              subCategories: [],
              families: [],
              subFamilies: [],
              specificities: [],
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const result = await response.json();
        setData(result.segmentationRevenue);
      } catch (err) {
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Chargement des données...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">🛠 Debug - Données API</h2>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Segment</th>
            <th className="border p-2">CA (Labo)</th>
            <th className="border p-2">CA (Global)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border">
              <td className="border p-2">
                {item.universe || "-"} > {item.category || "-"} > {item.sub_category || "-"} > {item.family || "-"} > {item.sub_family || "-"} > {item.specificity || "-"}
              </td>
              <td className="border p-2 text-teal-600 font-bold">{item.revenue.toLocaleString()} €</td>
              <td className="border p-2 text-blue-600 font-bold">{item.global_revenue.toLocaleString()} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SegmentationDebugComponent;