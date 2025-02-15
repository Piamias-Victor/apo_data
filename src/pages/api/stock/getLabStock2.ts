import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface MonthlyStockData {
  month: string;
  totalStockQuantity: number;
  totalStockValue: number;
  totalSalesQuantity: number;
  totalSalesRevenue: number;
  stockMonthsQuantity: number | null;
  stockValuePercentage: number | null;
}

/**
 * API pour récupérer l'analyse du stock global par mois
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ stockData: MonthlyStockData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters || (!filters.distributors.length && !filters.brands.length)) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const query = `
WITH months AS (
    -- 🔹 Génère les 12 derniers mois
    SELECT TO_CHAR(generate_series, 'YYYY-MM') AS month
    FROM generate_series(
        date_trunc('month', NOW()) - INTERVAL '11 months',
        date_trunc('month', NOW()),
        INTERVAL '1 month'
    )
),

filtered_products AS (
    -- 🔹 Filtrage des produits en fonction des critères
    SELECT dgp.code_13_ref, dgp.tva_percentage
    FROM data_globalproduct dgp
   WHERE 
    ($1::text[] IS NULL OR dgp.lab_distributor = ANY($1::text[]))
    AND ($2::text[] IS NULL OR dgp.range_name = ANY($2::text[]))
    AND ($3::text[] IS NULL OR dgp.universe = ANY($3::text[]))
    AND ($4::text[] IS NULL OR dgp.category = ANY($4::text[]))
    AND ($5::text[] IS NULL OR dgp.sub_category = ANY($5::text[]))
    AND ($6::text[] IS NULL OR dgp.brand_lab = ANY($6::text[]))
    AND ($7::text[] IS NULL OR dgp.family = ANY($7::text[]))
    AND ($8::text[] IS NULL OR dgp.sub_family = ANY($8::text[]))
    AND ($9::text[] IS NULL OR dgp.specificity = ANY($9::text[]))
),

monthly_stock AS (
    -- 🔹 Moyenne du stock par produit/pharmacie/mois
    SELECT 
        TO_CHAR(dis.date, 'YYYY-MM') AS month,
        dip.pharmacy_id,
        dip.code_13_ref_id,
        AVG(dis.stock) AS avg_stock,  -- ✅ Moyenne du stock
        AVG(dis.stock * dis.weighted_average_price) AS avg_stock_value
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id  -- ✅ Jointure directe sur UUID
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE dis.date >= NOW() - INTERVAL '12 months'
    AND ($10 IS NULL OR dip.pharmacy_id = ANY($10::uuid[])) -- ✅ Correction ici
    GROUP BY month, dip.pharmacy_id, dip.code_13_ref_id
),

monthly_sales AS (
    SELECT 
        TO_CHAR(ds.date, 'YYYY-MM') AS month,
        SUM(ds.quantity) AS total_sales_quantity,
        SUM(ds.quantity * fp.tva_percentage) AS total_sales_revenue,
        SUM(
            (fp.tva_percentage - (fp.tva_percentage * (1 + (fp.tva_percentage / 100)))) 
            * ds.quantity
        ) AS margin
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id  -- ✅ Jointure intermédiaire pour matcher les types
    JOIN data_internalproduct dip ON dis.product_id = dip.id  -- ✅ Jointure correcte UUID → UUID
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date >= NOW() - INTERVAL '12 months'
    AND ($10 IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY month
)

-- 🔹 Jointure des résultats sur la liste complète des mois
SELECT 
    m.month,
    COALESCE(SUM(ms.avg_stock), 0) AS totalStockQuantity,
    COALESCE(SUM(ms.avg_stock_value), 0) AS totalStockValue,
    COALESCE(SUM(mse.total_sales_quantity), 0) AS totalSalesQuantity,  -- ✅ Correction ici
    COALESCE(SUM(mse.total_sales_revenue), 0) AS totalSalesRevenue,    -- ✅ Correction ici
    COALESCE(SUM(mse.margin), 0) AS totalMargin,  -- ✅ Ajout de la marge pour contrôle
    COALESCE(SUM(ms.avg_stock) / NULLIF(SUM(mse.total_sales_quantity) / 12, 0), 0) AS stockMonthsQuantity,
    COALESCE((SUM(ms.avg_stock_value) / NULLIF(SUM(mse.total_sales_revenue), 0)) * 100, 0) AS stockValuePercentage
FROM months m
LEFT JOIN monthly_stock ms ON m.month = ms.month
LEFT JOIN monthly_sales mse ON m.month = mse.month
GROUP BY m.month  -- ✅ Ajout du GROUP BY
ORDER BY m.month ASC;
    `;

    const { rows } = await pool.query(query, [
      filters.distributors.length > 0 ? filters.distributors : [] as string[],
      filters.ranges.length > 0 ? filters.ranges : [] as string[],
      filters.universes.length > 0 ? filters.universes : [] as string[],
      filters.categories.length > 0 ? filters.categories : [] as string[],
      filters.subCategories.length > 0 ? filters.subCategories : [] as string[],
      filters.brands.length > 0 ? filters.brands : [] as string[],
      filters.families.length > 0 ? filters.families : [] as string[],
      filters.subFamilies.length > 0 ? filters.subFamilies : [] as string[],
      filters.specificities.length > 0 ? filters.specificities : [] as string[],
      filters.pharmacies.length > 0 ? filters.pharmacies.map(id => id) : [] as string[], // ✅ Toujours un tableau UUID[]
    ]);

    return res.status(200).json({ stockData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}