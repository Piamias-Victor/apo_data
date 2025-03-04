import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import TopStockBreakProducts from "./TopStockBreakProducts";
import ProductBreakTable from "./ProductBreakTable";

interface ProductStockBreakData {
  code_13_ref: string;
  product_name: string;
  stock_break_quantity: number;
  stock_break_amount: number;
  type: "current" | "comparison";
  previous?: {
    stock_break_quantity: number;
    stock_break_amount: number;
  };
}

const StockBreakDashboard: React.FC = () => {
  const { filters } = useFilterContext();
  const [products, setProducts] = useState<ProductStockBreakData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Fetch des données
  useEffect(() => {
    const fetchStockBreaks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/sell-out/getProductStockBreak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des ruptures");

        const data = await response.json();

        // Regroupement des données actuelles et comparatives
        const mergedProducts = data.stockBreakData.reduce((acc: ProductStockBreakData[], product) => {
          if (product.type === "current") {
            const comparison = data.stockBreakData.find(p => p.code_13_ref === product.code_13_ref && p.type === "comparison");
            acc.push({ ...product, previous: comparison });
          }
          return acc;
        }, []);

        setProducts(mergedProducts);
      } catch (err) {
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchStockBreaks();
  }, [filters]);

  return (
    <div className="max-w-8xl mx-auto p-8 space-y-16">
      {/* 📊 Titre principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-4xl font-extrabold text-red-600 tracking-wide flex items-center justify-center gap-3">
          <span className="text-yellow-500">🚨</span> Suivi des Ruptures
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Analyse des ruptures et produits impactés 🔍
        </p>
      </motion.div>

      {/* 🔹 Loader & Erreur */}
      {loading && <p className="text-gray-500 text-center">⏳ Chargement des données...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <>
          {/* 🚨 Top Produits en Rupture */}
          <TopStockBreakProducts products={products} />

          {/* 🎨 Séparateur stylisé */}
          <motion.div
            className="mt-12 border-t-4 border-gradient-to-r from-red-400 via-orange-400 to-yellow-400 mx-auto w-3/4"
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          ></motion.div>

          {/* 📊 Tableau détaillé des Produits en Rupture */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-red-600 tracking-wide flex items-center justify-center gap-3">
              <span className="text-blue-500">📋</span> Détail des Produits en Rupture
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Vue détaillée des stocks en rupture 📊
            </p>
          </motion.div>

          <ProductBreakTable products={products} />
        </>
      )}
    </div>
  );
};

export default StockBreakDashboard;