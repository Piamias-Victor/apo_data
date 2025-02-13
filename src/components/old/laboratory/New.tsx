import React, { useEffect, useState } from "react";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";

// ✅ Fonction pour formater les nombres en K / M
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

// Interface pour les gammes et les produits
interface SalesData {
  code_13_ref: string;
  name: string;
  total_revenue: number;
  total_purchase_amount: number;
  total_margin: number;
  total_quantity_sold: number;
}

interface RangeSummary {
  range_name: string;
  total_revenue: number;
  total_purchase_amount: number;
  total_margin: number;
  total_quantity_sold: number;
  products: SalesData[];
}

const SalesByRange: React.FC = () => {
  const { filters } = useFilterContext();
  const [ranges, setRanges] = useState<RangeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hideDetails, setHideDetails] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    const fetchSalesByRange = async () => {
      setLoading(true);
      setError(null);

      console.log("📡 Envoi des filtres à l'API :", filters);

      try {
        const response = await fetch("/api/sell-out/getSalesData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Impossible de récupérer les données");

        const data = await response.json();
        console.log("📦 Données reçues de l'API :", data);
        setRanges(data.ranges || []);
      } catch (err) {
        setError("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesByRange();
  }, [filters]);

  const requestSort = (key: string) => {
    if (sortConfig?.key === key) {
      if (sortConfig.direction === 'ascending') {
        setSortConfig({ key, direction: 'descending' });
      } else if (sortConfig.direction === 'descending') {
        setSortConfig(null); // Désactive le tri (revient aux gammes originales)
        setRanges([...ranges]); // Réaffiche les gammes originales
      } else {
        setSortConfig({ key, direction: 'ascending' });
      }
    } else {
      setSortConfig({ key, direction: 'ascending' });
    }
  };

  // Aplatir les produits avec leur gamme
  const flattenedProducts = ranges.flatMap((range) =>
    (range.products || []).map((product) => ({
      ...product,
      range_name: range.range_name,
    }))
  );

  // Trier les produits aplatis
  const sortedProducts = React.useMemo(() => {
    if (!sortConfig) return [...ranges.flatMap(range => (range.products || []).map(product => ({ ...product, range_name: range.range_name })))];
  
    return [...flattenedProducts].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [flattenedProducts, sortConfig]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 🔎 Barre de recherche + Case cacher les détails */}
      <div className="flex justify-between items-center">
        <div className="relative max-w-lg">
          <div className="p-3 border border-gray-300 flex items-center bg-gray-100 rounded-lg shadow-sm">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Rechercher une gamme..."
              className="bg-transparent outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ Case à cocher pour masquer les détails */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hideDetails"
            checked={hideDetails}
            onChange={() => setHideDetails(!hideDetails)}
            className="w-4 h-4 text-blue-600 bg-gray-200 border-gray-300 rounded"
          />
          <label htmlFor="hideDetails" className="text-sm text-gray-700">
            Masquer les détails
          </label>
        </div>
      </div>

      {/* 📌 Loader */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-40">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <FaSyncAlt className="text-blue-500 text-4xl animate-spin" />
          </motion.div>
          <span className="text-gray-500 mt-2">Chargement en cours...</span>
        </div>
      )}

      {/* ❌ Erreur */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* ✅ Tableau des gammes et produits */}
      {!loading && !error && ranges.length > 0 && (
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr className="text-gray-600">
                <th className="py-3 px-4 text-left cursor-pointer" onClick={() => requestSort('code_13_ref')}>
                  Réf {sortConfig?.key === 'code_13_ref' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-left cursor-pointer" onClick={() => requestSort('name')}>
                  Nom {sortConfig?.key === 'name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-left cursor-pointer" onClick={() => requestSort('total_revenue')}>
                  CA {sortConfig?.key === 'total_revenue' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-left cursor-pointer" onClick={() => requestSort('total_purchase_amount')}>
                  Achat HT {sortConfig?.key === 'total_purchase_amount' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-left cursor-pointer" onClick={() => requestSort('total_margin')}>
                  Marge {sortConfig?.key === 'total_margin' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-left cursor-pointer" onClick={() => requestSort('total_quantity_sold')}>
                  Qté Vendue {sortConfig?.key === 'total_quantity_sold' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {!sortConfig
                ? ranges
                    .filter((range) =>
                      range.range_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((range, rangeIndex) => (
                      <React.Fragment key={range.range_name}>
                        {/* 🟢 Ligne de la gamme en gras et colorée */}
                        <tr className="bg-blue-100 font-bold text-blue-900 border-t border-gray-300">
                          <td className="py-3 px-4" colSpan={2}>
                            {range.range_name}
                          </td>
                          <td className="py-3 px-4">{formatLargeNumber(range.total_revenue)}</td>
                          <td className="py-3 px-4">{formatLargeNumber(range.total_purchase_amount)}</td>
                          <td className="py-3 px-4">{formatLargeNumber(range.total_margin)}</td>
                          <td className="py-3 px-4">{formatLargeNumber(range.total_quantity_sold, false)}</td>
                        </tr>

                        {/* 🔹 Lignes des produits sous chaque gamme, affichées uniquement si hideDetails est FALSE */}
                        {!hideDetails &&
                          range.products.map((product, productIndex) => (
                            <tr
                              key={product.code_13_ref}
                              className={`${(rangeIndex + productIndex) % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                            >
                              <td className="py-3 px-4">{product.code_13_ref}</td>
                              <td className="py-3 px-4">{product.name}</td>
                              <td className="py-3 px-4 font-semibold text-blue-500">{formatLargeNumber(product.total_revenue)}</td>
                              <td className="py-3 px-4">{formatLargeNumber(product.total_purchase_amount)}</td>
                              <td className="py-3 px-4 text-green-600 font-semibold">{formatLargeNumber(product.total_margin)}</td>
                              <td className="py-3 px-4">{formatLargeNumber(product.total_quantity_sold, false)}</td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))
                : sortedProducts
                    .filter((product) =>
                      product.range_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((product, index) => (
                      <tr
                        key={product.code_13_ref}
                        className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                      >
                        <td className="py-3 px-4">{product.code_13_ref}</td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4 font-semibold text-blue-500">{formatLargeNumber(product.total_revenue)}</td>
                        <td className="py-3 px-4">{formatLargeNumber(product.total_purchase_amount)}</td>
                        <td className="py-3 px-4 text-green-600 font-semibold">{formatLargeNumber(product.total_margin)}</td>
                        <td className="py-3 px-4">{formatLargeNumber(product.total_quantity_sold, false)}</td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesByRange;