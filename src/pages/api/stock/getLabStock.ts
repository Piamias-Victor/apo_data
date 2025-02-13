import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface pour structurer la réponse
interface StockReportData {
  totalStockQuantity: number;
  totalStockValue: number;
  totalSalesQuantity: number;
  totalSalesRevenue: number;
  stockMonthsQuantity: number | null;
  stockMonthsValue: number | null;
  stockValuePercentage: number | null;
  stockQuantityEvolution: number | null;
  stockValueEvolution: number | null;
  stockMonthsQuantityEvolution: number | null;
  stockMonthsValueEvolution: number | null;
  stockValuePercentageEvolution: number | null;
}

/**
 * API pour récupérer le rapport du stock global d'un laboratoire
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ stockData: StockReportData } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters || (!filters.pharmacies.length && !filters.distributors.length && !filters.brands.length)) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

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
    ),

    -- 🔹 Stock moyen sur les 12 derniers mois
    average_stock AS (
        SELECT 
            dis.product_id,
            AVG(dis.stock) AS avg_stock,
            AVG(dis.weighted_average_price) AS avg_price
        FROM data_inventorysnapshot dis
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE dis.date >= NOW() - INTERVAL '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
        GROUP BY dis.product_id
    ),

    -- 🔹 Stock moyen sur les 12 mois précédents
    previous_stock AS (
        SELECT 
            dis.product_id,
            AVG(dis.stock) AS prev_avg_stock,
            AVG(dis.weighted_average_price) AS prev_avg_price
        FROM data_inventorysnapshot dis
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE dis.date BETWEEN NOW() - INTERVAL '24 months' AND NOW() - INTERVAL '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
        GROUP BY dis.product_id
    ),

    -- 🔹 Total des ventes sur les 12 derniers mois
    sales_data AS (
        SELECT 
            dis.product_id,
            SUM(ds.quantity) AS total_sales_quantity,
            SUM(ds.quantity * dis.price_with_tax) AS total_sales_revenue
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE ds.date >= NOW() - INTERVAL '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
        GROUP BY dis.product_id
    ),

    -- 🔹 Total des ventes sur les 12 mois précédents
    previous_sales AS (
        SELECT 
            dis.product_id,
            SUM(ds.quantity) AS prev_total_sales_quantity,
            SUM(ds.quantity * dis.price_with_tax) AS prev_total_sales_revenue
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE ds.date BETWEEN NOW() - INTERVAL '24 months' AND NOW() - INTERVAL '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
        GROUP BY dis.product_id
    )

    -- 🔹 Calcul final
    SELECT 
        -- Valeurs actuelles
        COALESCE(SUM(ast.avg_stock), 0) AS totalStockQuantity,
        COALESCE(SUM(ast.avg_stock * ast.avg_price), 0) AS totalStockValue,
        COALESCE(SUM(sd.total_sales_quantity), 0) AS totalSalesQuantity,
        COALESCE(SUM(sd.total_sales_revenue), 0) AS totalSalesRevenue,

        -- 📦 Mois de stock en quantité
        COALESCE(SUM(ast.avg_stock) / NULLIF(SUM(sd.total_sales_quantity) / 12, 0), 0) AS stockMonthsQuantity,

        -- 📊 Pourcentage de la valeur du stock sur le CA total
        COALESCE((SUM(ast.avg_stock * ast.avg_price) / NULLIF(SUM(sd.total_sales_revenue), 0)) * 100, 0) AS stockValuePercentage,

        -- 📈 Evolution en pourcentage
        ((COALESCE(SUM(ast.avg_stock), 0) - COALESCE(SUM(pst.prev_avg_stock), 0)) / NULLIF(COALESCE(SUM(pst.prev_avg_stock), 0), 0)) * 100 AS stockQuantityEvolution,
        ((COALESCE(SUM(ast.avg_stock * ast.avg_price), 0) - COALESCE(SUM(pst.prev_avg_stock * pst.prev_avg_price), 0)) / NULLIF(COALESCE(SUM(pst.prev_avg_stock * pst.prev_avg_price), 0), 0)) * 100 AS stockValueEvolution,
        ((COALESCE(SUM(ast.avg_stock) / NULLIF(SUM(sd.total_sales_quantity) / 12, 0), 0) - COALESCE(SUM(pst.prev_avg_stock) / NULLIF(SUM(ps.prev_total_sales_quantity) / 12, 0), 0)) / NULLIF(COALESCE(SUM(pst.prev_avg_stock) / NULLIF(SUM(ps.prev_total_sales_quantity) / 12, 0), 0), 0)) * 100 AS stockMonthsQuantityEvolution,
        ((COALESCE(SUM(ast.avg_stock * ast.avg_price) / NULLIF(SUM(sd.total_sales_revenue) / 12, 0), 0) - COALESCE(SUM(pst.prev_avg_stock * pst.prev_avg_price) / NULLIF(SUM(ps.prev_total_sales_revenue) / 12, 0), 0)) / NULLIF(COALESCE(SUM(pst.prev_avg_stock * pst.prev_avg_price) / NULLIF(SUM(ps.prev_total_sales_revenue) / 12, 0), 0), 0)) * 100 AS stockMonthsValueEvolution

    FROM average_stock ast
    LEFT JOIN previous_stock pst ON ast.product_id = pst.product_id
    LEFT JOIN sales_data sd ON ast.product_id = sd.product_id
    LEFT JOIN previous_sales ps ON sd.product_id = ps.product_id;
    `;

    const { rows } = await pool.query(query, [
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
    ]);
    
    return res.status(200).json({ stockData: rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
}