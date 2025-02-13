import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaExchangeAlt } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";

// 📌 Interface des données
interface SalesData {
  code_13_ref: string;
  name: string;
  tva_percentage: number;
  total_revenue: number;
  total_purchase_amount: number;
  total_margin: number;
  total_quantity_sold: number;
  avg_selling_price: number;
  avg_purchase_price: number;
  avg_margin: number;
  min_selling_price: number;
  max_selling_price: number;
  range_name: string;
  evolution_total_revenue: number;
  evolution_total_margin: number;
  evolution_avg_selling_price: number;
  evolution_avg_margin: number;
}

interface RangeSummary {
  range_name: string;
  total_revenue: number;
  total_purchase_amount: number;
  total_margin: number;
  total_quantity_sold: number;
  products: SalesData[];
}

// 📌 Fonction de formatage des nombres
const formatLargeNumber = (value: any, isCurrency: boolean = true): string => {
    if (!value || isNaN(Number(value))) return "N/A"; 
    
    const num = Number(value);
    let formattedValue = num.toFixed(2).replace(".", ",");
  
    if (num >= 1_000_000) {
      formattedValue = `${(num / 1_000_000).toFixed(2).replace(".", ",")} M`;
    } else if (num >= 1_000) {
      formattedValue = `${(num / 1_000).toFixed(2).replace(".", ",")} K`;
    }
  
    return isCurrency ? `${formattedValue} €` : formattedValue;
  };

// 📌 Fonction d'affichage des évolutions en %
const formatEvolution = (value: number | null) => {
  if (value === null || isNaN(value)) return "N/A";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${value > 0 ? "bg-green-400 text-white" : value < 0 ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"}`}>
      {value.toFixed(1)}%
    </span>
  );
};

const SalesTable: React.FC = () => {
  const { filters } = useFilterContext();
  const [ranges, setRanges] = useState<RangeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [isUnitView, setIsUnitView] = useState<boolean>(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/sell-out/getSalesData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des données");

        const data = await response.json();
        setRanges(data.ranges || []);
      } catch (err) {
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [filters]);

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">📊 Ventes par Gamme et Produits</h2>
        <button
          onClick={() => setIsUnitView(!isUnitView)}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
        >
          <FaExchangeAlt className="mr-2" />
          {isUnitView ? "Afficher Totaux" : "Afficher Unitaire"}
        </button>
      </div>

      {/* Affichage du chargement ou des erreurs */}
      {loading && <p className="text-gray-500 text-center">Chargement des données...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && ranges.length === 0 && <p className="text-gray-500 text-center">Aucune donnée disponible.</p>}

      {/* Table des ventes */}
      {!loading && !error && ranges.length > 0 && (
        <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Gamme / Produit</th>
              <th className="border border-gray-300 px-4 py-2">Qté Vendue</th>
              <th className="border border-gray-300 px-4 py-2">Prix Vente</th>
              <th className="border border-gray-300 px-4 py-2">Prix Achat</th>
              <th className="border border-gray-300 px-4 py-2">Marge</th>
              <th className="border border-gray-300 px-4 py-2">% Marge</th>
              <th className="border border-gray-300 px-4 py-2">Détails</th>
            </tr>
          </thead>
          <tbody>
            {ranges.map((range, rangeIndex) => (
              <React.Fragment key={rangeIndex}>
                {/* Ligne de gamme */}
                <tr className="bg-blue-100 font-semibold">
                  <td className="border border-gray-300 px-4 py-2">{range.range_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatLargeNumber(range.total_quantity_sold, false)}</td>
                  <td className="border border-gray-300 px-4 py-2">{isUnitView ? "-" : formatLargeNumber(range.total_revenue)}</td>
                  <td className="border border-gray-300 px-4 py-2">{isUnitView ? "-" : formatLargeNumber(range.total_purchase_amount)}</td>
                  <td className="border border-gray-300 px-4 py-2">{isUnitView ? "-" : formatLargeNumber(range.total_margin)}</td>
                  <td className="border border-gray-300 px-4 py-2">{isUnitView ? "-" : `${((range.total_margin / range.total_revenue) * 100).toFixed(1)}%`}</td>
                  <td className="border border-gray-300 px-4 py-2"></td>
                </tr>

                {/* Lignes des produits */}
                {range.products.map((product) => (
                  <tr key={product.code_13_ref} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{formatLargeNumber(product.total_quantity_sold, false)}</td>
                    <td className="border border-gray-300 px-4 py-2">{isUnitView ? formatLargeNumber(product.avg_selling_price) : formatLargeNumber(product.total_revenue)}</td>
                    <td className="border border-gray-300 px-4 py-2">{isUnitView ? formatLargeNumber(product.avg_purchase_price) : formatLargeNumber(product.total_purchase_amount)}</td>
                    <td className="border border-gray-300 px-4 py-2">{isUnitView ? formatLargeNumber(product.avg_margin) : formatLargeNumber(product.total_margin)}</td>
                    <td className="border border-gray-300 px-4 py-2">{((product.avg_margin / product.avg_selling_price) * 100).toFixed(1)}%</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button onClick={() => setShowDetails(prev => ({ ...prev, [product.code_13_ref]: !prev[product.code_13_ref] }))}>
                        {showDetails[product.code_13_ref] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SalesTable;