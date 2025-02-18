import React, { useState, useEffect } from "react";

interface Lab {
  laboratoire: string;
  part_de_marche: number;
}

const TopLabs: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopLabs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/segmentation/getTopLabsBySegment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ segment: "MEDICATION FAMILIALE ALLOPATHIE CONSEIL", type: "universe" }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des données");

        const data = await response.json();
        setLabs(data.labs);
      } catch (err) {
        setError("Impossible de charger les laboratoires");
      } finally {
        setLoading(false);
      }
    };

    fetchTopLabs();
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-teal-700 mb-4">🏆 Top 3 Laboratoires</h2>

      {loading && <p className="text-teal-500">Chargement en cours...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && labs.length > 0 && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-teal-100 text-teal-900">
              <th className="p-3">Laboratoire</th>
              <th className="p-3">Part de Marché (%)</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab, index) => (
              <tr key={index} className="border-b text-center">
                <td className="p-3">{lab.laboratoire}</td>
                <td className="p-3 font-semibold">{lab.part_de_marche}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TopLabs;