import { useState, useEffect, useCallback } from 'react';
import { ProductSalesData } from './useProductsData';

interface UseProductDataProps {
  filters: any;
}

/**
 * Calcule le taux de marge d'un produit (Marge / CA × 100)
 * @param product Données du produit
 * @returns Taux de marge en pourcentage
 */
const calculateRentabilityIndex = (
  product: ProductSalesData
): number => {
  // Convertir explicitement en nombres
  const margin = parseFloat(String(product.margin)) || 0;
  const revenue = parseFloat(String(product.revenue)) || 0;
  
  // Si le chiffre d'affaires est nul ou négatif, on ne peut pas calculer de taux
  if (revenue <= 0) {
    return 0;
  }

  // Calcul du taux de marge en pourcentage: (Marge / CA) × 100
  const tauxMarge = (margin / revenue) * 100;
  
  // Limiter à 2 décimales
  return Math.round(tauxMarge * 100) / 100;
};

/**
 * Hook personnalisé pour gérer les données des produits
 */
export function useProductData({ filters }: UseProductDataProps) {
  // États
  const [products, setProducts] = useState<ProductSalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof ProductSalesData>("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [salesStockData, setSalesStockData] = useState<Record<string, ProductSalesStockData[]>>({});
  const [loadingStockData, setLoadingStockData] = useState<Record<string, boolean>>({});

  // Récupération des données
  const fetchProducts = useCallback(async () => {
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

      // Extraire d'abord les produits actuels
      const currentProducts = data.products.filter(
        (product: ProductSalesData) => product.type === "current"
      );
      
      // Associer les données actuelles et comparatives avec l'indice calculé
      const productsWithRentability = currentProducts.map((product: ProductSalesData) => {
        const comparison = data.products.find(
          (p: ProductSalesData) => p.code_13_ref === product.code_13_ref && p.type === "comparison"
        );
        
        // Calcul du taux de marge en pourcentage
        const indice = calculateRentabilityIndex(product);
        
        // Calcul du taux de marge du produit précédent (si disponible)
        let previousIndice = 0;
        if (comparison) {
          previousIndice = calculateRentabilityIndex(comparison);
        }
        
        // Mettre à jour l'indice dans l'objet comparison si présent
        const updatedComparison = comparison 
          ? { ...comparison, indice_rentabilite: previousIndice }
          : undefined;
        
        return { 
          ...product, 
          previous: updatedComparison,
          indice_rentabilite: indice
        };
      });

      // Logs pour débogage
      console.log("Exemple de produit avec taux de marge:", 
        productsWithRentability.length > 0 ? {
          product_name: productsWithRentability[0].product_name,
          revenue: parseFloat(String(productsWithRentability[0].revenue)),
          margin: parseFloat(String(productsWithRentability[0].margin)),
          taux_marge: productsWithRentability[0].indice_rentabilite
        } : "Aucun produit"
      );

      setProducts(productsWithRentability);
    } catch (err) {
      setError("Impossible de récupérer les données.");
      console.error("Erreur API:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Récupération des détails d'un produit
  const fetchProductSalesAndStock = async (code_13_ref: string) => {
    if (salesStockData[code_13_ref] || loadingStockData[code_13_ref]) return;
    
    setLoadingStockData(prev => ({ ...prev, [code_13_ref]: true }));
    
    try {
      const response = await fetch("/api/sale/getProductSalesAndStock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_13_ref, pharmacies: filters.pharmacies }),
      });
    
      if (!response.ok) throw new Error("Erreur lors de la récupération des données de ventes/stocks.");
    
      const data = await response.json();
      setSalesStockData(prev => ({ ...prev, [code_13_ref]: data.salesStockData }));
    } catch (error) {
      console.error("❌ Erreur API :", error);
    } finally {
      setLoadingStockData(prev => ({ ...prev, [code_13_ref]: false }));
    }
  };

  // Tri des produits
  const getSortedProducts = useCallback(() => {
    if (!sortColumn) return [...products];

    const numericColumns = [
      "total_quantity", "revenue", "margin", 
      "purchase_quantity", "purchase_amount", 
      "avg_selling_price", "avg_purchase_price", "avg_margin",
      "indice_rentabilite", "part_ca_labo", "part_marge_labo"
    ];

    return [...products].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (valA == null) valA = sortColumn === "product_name" ? "" as any : -Infinity as any;
      if (valB == null) valB = sortColumn === "product_name" ? "" as any : -Infinity as any;

      const isNumeric = numericColumns.includes(sortColumn as string);

      if (isNumeric) {
        // Convertir en nombres pour le tri
        const numA = parseFloat(String(valA)) || 0;
        const numB = parseFloat(String(valB)) || 0;
        return sortOrder === "asc" ? numA - numB : numB - numA;
      } else {
        return sortOrder === "asc" 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      }
    });
  }, [products, sortColumn, sortOrder]);

  // Gestion du tri
  const handleSort = (column: keyof ProductSalesData) => {
    setSortOrder(prev => (sortColumn === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortColumn(column);
  };

  // Recherche de produits
  const searchProducts = useCallback((query: string) => {
    if (!query) return getSortedProducts();
    
    const lowercaseQuery = query.toLowerCase();
    
    return getSortedProducts().filter(product =>
      product.product_name.toLowerCase().includes(lowercaseQuery) ||
      product.code_13_ref.includes(lowercaseQuery)
    );
  }, [getSortedProducts]);

  // Chargement initial des produits
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    loading,
    error,
    sortedProducts: getSortedProducts(),
    sortColumn,
    sortOrder,
    handleSort,
    searchProducts,
    salesStockData,
    loadingStockData,
    fetchProductSalesAndStock
  };
}