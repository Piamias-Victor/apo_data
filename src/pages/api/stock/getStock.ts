import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface StockSalesData {
  total_avg_stock: number;
  total_quantity: number;
  total_stock_value: number;
  total_revenue: number;
  type: "current" | "comparison";
}

/**
 * API pour récupérer les données de stock et de ventes en fonction des périodes sélectionnées.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ stockSalesData: StockSalesData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters || !filters.dateRange || !filters.comparisonDateRange) {
      return res.status(400).json({ error: "Filtres ou périodes invalides" });
    }

    const { dateRange, comparisonDateRange } = filters;

    const query = `
WITH filtered_products AS (
    SELECT dgp.code_13_ref
    FROM data_globalproduct dgp
    WHERE 
        ($1::text[] IS NULL OR dgp.lab_distributor = ANY($1))
        AND ($2::text[] IS NULL OR dgp.range_name = ANY($2))
        AND ($3::text[] IS NULL OR dgp.universe = ANY($3))
        AND ($4::text[] IS NULL OR dgp.category = ANY($4))
        AND ($5::text[] IS NULL OR dgp.sub_category = ANY($5))
        AND ($6::text[] IS NULL OR dgp.brand_lab = ANY($6))
        AND ($7::text[] IS NULL OR dgp.family = ANY($7))
        AND ($8::text[] IS NULL OR dgp.sub_family = ANY($8))
        AND ($9::text[] IS NULL OR dgp.specificity = ANY($9))
)

, latest_inventory_snapshot AS (
    -- Récupère le dernier inventory snapshot disponible par produit et pharmacie
    SELECT DISTINCT ON (dis.product_id, dip.pharmacy_id) 
        dis.product_id,
        dip.pharmacy_id,
        dis.weighted_average_price
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    ORDER BY dis.product_id, dip.pharmacy_id, dis.date DESC
)

, stock_data AS (
    -- 🔵 Calcul du stock moyen et valeur du stock pour la période actuelle
    SELECT 
        SUM(dis.stock) AS total_avg_stock,
        SUM(dis.stock * lis.weighted_average_price) AS total_stock_value,
        'current' AS type
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    LEFT JOIN latest_inventory_snapshot lis ON lis.product_id = dis.product_id AND lis.pharmacy_id = dip.pharmacy_id
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
        AND dis.date BETWEEN $11 AND $12
    
    UNION ALL

    -- 🔴 Calcul du stock moyen et valeur du stock pour la période de comparaison
    SELECT 
        SUM(dis.stock) AS total_avg_stock,
        SUM(dis.stock * lis.weighted_average_price) AS total_stock_value,
        'comparison' AS type
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    LEFT JOIN latest_inventory_snapshot lis ON lis.product_id = dis.product_id AND lis.pharmacy_id = dip.pharmacy_id
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
        AND dis.date BETWEEN $13 AND $14
)

, sales_data AS (
    -- 📊 Calcul des ventes pour la période actuelle
    SELECT 
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS total_revenue,
        'current' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
        AND ds.date BETWEEN $11 AND $12

    UNION ALL

    -- 📊 Calcul des ventes pour la période de comparaison
    SELECT 
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS total_revenue,
        'comparison' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
        AND ds.date BETWEEN $13 AND $14
)

SELECT 
    COALESCE(SUM(sd.total_avg_stock), 0) AS total_avg_stock,  
    COALESCE(SUM(sd.total_stock_value), 0) AS total_stock_value,
    COALESCE(SUM(sales.total_quantity), 0) AS total_quantity,
    COALESCE(SUM(sales.total_revenue), 0) AS total_revenue,
    sd.type
FROM stock_data sd
FULL OUTER JOIN sales_data sales ON sd.type = sales.type
GROUP BY sd.type
ORDER BY sd.type ASC;
    `;

    // Exécution de la requête SQL avec les filtres
    const { rows } = await pool.query<StockSalesData>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
      filters.pharmacies.length > 0 ? filters.pharmacies.map(id => id) : null,
      filters.dateRange[0], filters.dateRange[1], // Période principale
      filters.comparisonDateRange[0], filters.comparisonDateRange[1], // Période de comparaison
    ]);

    return res.status(200).json({ stockSalesData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des stocks et des ventes :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}