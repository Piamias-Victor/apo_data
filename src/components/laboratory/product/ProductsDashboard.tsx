import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useFilterContext } from "@/contexts/FilterContext";
import TopProductsCard from "./TopProductsCard";
import ProductTable from "./ProductTable";
import SalesDataTest from "../global/pharmacies/SalesPharmaciesComponent";

interface ProductSalesData {
  code_13_ref: string;
  product_name: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  avg_selling_price: number;
  avg_purchase_price: number;
  avg_margin: number;
  type: "current" | "comparison";
  previous?: {
    total_quantity: number;
    revenue: number;
    margin: number;
    purchase_quantity: number;
    purchase_amount: number;
    avg_selling_price: number;
    avg_purchase_price: number;
    avg_margin: number;
  };
}

const ProductsDashboard: React.FC = () => {
  const { filters } = useFilterContext();
  const [products, setProducts] = useState<ProductSalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Fetch des données
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/segmentation/getLabProducts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des produits");

        const data = await response.json();

        // Regroupement des données actuelles et comparatives
        const mergedProducts = data.products.reduce((acc: ProductSalesData[], product) => {
          if (product.type === "current") {
            const comparison = data.products.find(p => p.code_13_ref === product.code_13_ref && p.type === "comparison");
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

    fetchProducts();
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
        <h2 className="text-4xl font-extrabold text-teal-600 tracking-wide flex items-center justify-center gap-3">
          <span className="text-yellow-500">📊</span> Performances des Produits
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Analyse des ventes, marges et évolutions des produits 📈
        </p>
      </motion.div>

      {/* 🔹 Loader & Erreur */}
      {loading && <p className="text-gray-500 text-center">⏳ Chargement des données...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <>
          {/* 🏆 Top Produits */}
          <TopProductsCard products={products} />

          {/* 🎨 Séparateur stylisé */}
          <motion.div
            className="mt-12 border-t-4 border-gradient-to-r from-indigo-400 via-blue-400 to-teal-400 mx-auto w-3/4"
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          ></motion.div>

          {/* 📊 Tableau des Produits */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-blue-600 tracking-wide flex items-center justify-center gap-3">
              <span className="text-green-500">📋</span> Détail des Ventes Produits
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Vue détaillée des performances par produit 📊
            </p>
          </motion.div>

          <ProductTable />

          <SalesDataTest/>
        </>
      )}
    </div>
  );
};

export default ProductsDashboard;