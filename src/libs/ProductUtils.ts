import { ProductSalesData } from "@/types/types";

/**
 * Calcule le taux de marge d'un produit (Marge / CA × 100)
 * @param product Données du produit
 * @returns Taux de marge en pourcentage (entre 0 et théoriquement l'infini)
 */
export const calculateRentabilityIndex = (
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
 * Met à jour les indices de rentabilité dans un tableau de produits
 * @param products Tableau de produits
 * @returns Tableau de produits avec l'indice de rentabilité calculé
 */
export const updateProductRentabilityIndices = (
  products: ProductSalesData[]
): ProductSalesData[] => {
  // Calcul de la marge totale  
  // Attribution de l'indice de rentabilité à chaque produit
  return products.map(product => ({
    ...product,
    indice_rentabilite: calculateRentabilityIndex(product)
  }));
};