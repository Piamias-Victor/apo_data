import Loader from "@/components/common/feedback/Loader";
import SectionTitle from "@/components/common/sections/SectionTitle";
import Separator from "@/components/common/sections/Separator";
import { useState, useEffect } from "react";
import ProductBreakTable from "./ProductBreakTable";
import TopStockBreakProducts from "./TopStockBreakProducts";
import { useFilterContext } from "@/contexts/FilterContext";



interface ProductStockBreakData {
  code_13_ref: string;
  product_name: string;
  stock_break_products: number; // ❌ Quantité en Rupture
  stock_break_amount: number;   // 💰 Montant des Ruptures (€)
  type: "current" | "comparison";
  previous?: {
    stock_break_products: number;
    stock_break_amount: number;
  };
}

/**
 * Dashboard principal pour l'analyse des ruptures de stock
 */
const StockBreakDashboard: React.FC = () => {
  const { filters } = useFilterContext();
  const [products, setProducts] = useState<ProductStockBreakData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockBreaks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/stock/getProductStockBreak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des ruptures");

        const data = await response.json();

        // Regroupement des données actuelles et comparatives
        const mergedProducts = data.stockBreakData.reduce((acc: ProductStockBreakData[], product: any) => {
          if (product.type === "current") {
            const comparison = data.stockBreakData.find(
              (p: any) => p.code_13_ref === product.code_13_ref && p.type === "comparison"
            );
            acc.push({ 
              ...product, 
              previous: comparison || undefined 
            });
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

  // États de chargement et d'erreur
  if (loading) return <Loader message="Chargement des données de rupture..." />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="max-w-8xl mx-auto p-8 space-y-16">
      {/* Titre principal */}
      <SectionTitle 
        title="Suivi des Ruptures"
        description="Analyse des ruptures et produits impactés 🔍"
        emoji="🚨"
        color="text-red-600"
      />

      {/* Top Produits en Rupture */}
      <TopStockBreakProducts products={products} />

      {/* Séparateur */}
      <Separator from="red-400" via="orange-400" to="yellow-400" />

      {/* Titre secondaire */}
      <SectionTitle 
        title="Détail des Produits en Rupture"
        description="Vue détaillée des stocks en rupture 📊"
        emoji="📋"
        color="text-red-600"
        emojiColor="text-blue-500"
      />

      {/* Tableau détaillé */}
      <ProductBreakTable products={products} />

      {/* Analyse par pharmacie */}
      {/* <StockBreakDataByPharmacy /> */}
    </div>
  );
};

export default StockBreakDashboard;