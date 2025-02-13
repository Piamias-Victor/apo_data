import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaChartLine, FaMoneyBillWave } from "react-icons/fa";
import { useFilterContext } from "@/contexts/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

interface TopProduct {
  code_13_ref: string;
  product_name: string;
  total_quantity?: number;
  revenue?: number;
  margin?: number;
  ranking_type: "quantity" | "revenue" | "margin";
}

// Fonction de formatage des nombres
const formatLargeNumber = (value: any, isCurrency: boolean = false): string => {
  const num = parseFloat(value) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2).replace(".", ",")} M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2).replace(".", ",")} K`;
  return isCurrency ? `${num.toFixed(2).replace(".", ",")} €` : num.toFixed(2).replace(".", ",");
};

// Couleurs des médailles 🥇🥈🥉
const medalColors = [
  "text-yellow-500", // 🥇 Or
  "text-gray-400", // 🥈 Argent
  "text-orange-500", // 🥉 Bronze
];

const TopProducts: React.FC = () => {
  const { filters } = useFilterContext();
  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0;

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"quantity" | "revenue" | "margin">(
    "quantity"
  );

  useEffect(() => {
    if (!hasSelectedLabs) return;

    const fetchTopProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/sell-out/getTopProducts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Échec du fetch des données");

        const data = await response.json();
        setTopProducts(data.topProducts);
      } catch (err) {
        setError("Impossible de récupérer les données");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [filters]);

  if (!hasSelectedLabs) {
    return <p className="text-gray-500 text-center mt-4">Sélectionnez un laboratoire pour voir les données.</p>;
  }

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">

      {/* 🔘 Boutons de sélection */}
      <div className="flex justify-center space-x-4">
        {["quantity", "revenue", "margin"].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedCategory === type
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSelectedCategory(type as "quantity" | "revenue" | "margin")}
          >
            {type === "quantity" && "📦 Quantité"}
            {type === "revenue" && "💰 Chiffre d'Affaires"}
            {type === "margin" && "📊 Marge"}
          </button>
        ))}
      </div>

      {/* 🌀 Loader */}
      {loading && (
        <div className="flex justify-center mt-6">
          <div className="border-t-4 border-teal-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      {/* ❌ Erreur */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* 📌 Liste des produits */}
      <AnimatePresence>
        {!loading && !error && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {topProducts
              .filter((product) => product.ranking_type === selectedCategory)
              .map((product, index) => {
                // Attribution de la couleur de médaille si index < 3, sinon couleur par défaut
                const rankingColor = index < 3 ? medalColors[index] : "text-teal-400";

                return (
                  <motion.div
                    key={index}
                    className="p-5 bg-white rounded-xl shadow-md flex items-center space-x-4 border-l-4 border-teal-500"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Icône */}
                    <div className="w-12 h-12 flex items-center justify-center bg-teal-100 rounded-full">
                      {selectedCategory === "quantity" && <FaShoppingCart className="text-teal-600 text-xl" />}
                      {selectedCategory === "revenue" && <FaChartLine className="text-green-600 text-xl" />}
                      {selectedCategory === "margin" && <FaMoneyBillWave className="text-yellow-600 text-xl" />}
                    </div>

                    {/* Contenu */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800">{product.product_name}</h3>
                      <p className="text-sm text-gray-500">
                        Code 13 Réf: <span className="font-medium">{product.code_13_ref}</span>
                      </p>

                      {/* Valeurs affichées */}
                      <div className="mt-2 space-y-1">
                        <p className={`text-gray-700 ${selectedCategory === "quantity" ? "font-bold text-teal-700" : ""}`}>
                          📦 Quantité: {formatLargeNumber(product.total_quantity, false)}
                        </p>
                        <p className={`text-gray-700 ${selectedCategory === "revenue" ? "font-bold text-green-700" : ""}`}>
                          💰 CA: {formatLargeNumber(product.revenue, true)}
                        </p>
                        <p className={`text-gray-700 ${selectedCategory === "margin" ? "font-bold text-yellow-700" : ""}`}>
                          📊 Marge: {formatLargeNumber(product.margin, true)}
                        </p>
                      </div>
                    </div>

                    {/* Classement avec couleur dynamique */}
                    <span className={`text-lg font-semibold ${rankingColor}`}>#{index + 1}</span>
                  </motion.div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopProducts;