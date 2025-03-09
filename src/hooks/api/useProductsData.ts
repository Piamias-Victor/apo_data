// hooks/useProductsData.ts
import { useFilterContext } from "@/contexts/FilterContext";
import { useState, useEffect } from "react";

export interface ProductSalesData {
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
}

export interface ProductWithComparison extends ProductSalesData {
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
  evolution?: number;
}

export interface SalesStockData {
  month: string;
  total_quantity_sold: number;
  avg_stock_quantity: number;
  stock_break_quantity: number;
  max_selling_price: number;
  min_selling_price: number;
}

export function useProductsData() {
  const { filters } = useFilterContext();
  const [products, setProducts] = useState<ProductWithComparison[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour calculer l'évolution en pourcentage
  const calculateEvolution = (oldValue: number, newValue: number): number => {
    if (oldValue === undefined || oldValue === null) return 0;
    if (oldValue === 0) {
      return newValue > 0 ? 100 : 0;
    }
    const change = ((newValue - oldValue) / oldValue) * 100;
    return Number.isFinite(change) ? change : 0;
  };

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
        const mergedProducts = data.products.reduce((acc: ProductWithComparison[], product: ProductSalesData) => {
          if (product.type === "current") {
            const comparison = data.products.find((p: ProductSalesData) => p.code_13_ref === product.code_13_ref && p.type === "comparison");
            
            const productWithComparison: ProductWithComparison = {
              ...product,
              previous: comparison ? {
                total_quantity: comparison.total_quantity,
                revenue: comparison.revenue,
                margin: comparison.margin,
                purchase_quantity: comparison.purchase_quantity,
                purchase_amount: comparison.purchase_amount,
                avg_selling_price: comparison.avg_selling_price,
                avg_purchase_price: comparison.avg_purchase_price,
                avg_margin: comparison.avg_margin
              } : undefined
            };

            // Calculer l'évolution du chiffre d'affaires
            if (productWithComparison.previous) {
              productWithComparison.evolution = calculateEvolution(
                productWithComparison.previous.revenue,
                productWithComparison.revenue
              );
            }
            
            acc.push(productWithComparison);
          }
          return acc;
        }, []);

        setProducts(mergedProducts);
      } catch (err) {
        setError("Impossible de récupérer les données.");
        console.error("Erreur lors de la récupération des produits:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Fonction pour obtenir les produits top performers
  const getTopProducts = () => {
    if (products.length === 0) {
      return {
        topRevenue: [],
        topMargin: [],
        topGrowth: []
      };
    }
    
    const topRevenue = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
    const topMargin = [...products].sort((a, b) => b.margin - a.margin).slice(0, 3);
    
    const topGrowth = [...products]
      .filter(product => product.previous?.revenue !== undefined && product.previous?.revenue !== 0 && product.evolution !== undefined)
      .sort((a, b) => (b.evolution || 0) - (a.evolution || 0))
      .slice(0, 3);
    
    return {
      topRevenue,
      topMargin,
      topGrowth
    };
  };

  return {
    products,
    loading,
    error,
    topProducts: getTopProducts()
  };
}