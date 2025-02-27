import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface LabMetrics {
  avgSellPrice: number;
  avgSellPriceEvolution: number;
  avgWeightedBuyPrice: number;
  avgWeightedBuyPriceEvolution: number;
  avgMargin: number;
  avgMarginEvolution: number;
  avgMarginPercentage: number;
  avgMarginPercentageEvolution: number;
  avgStockValue: number;
  avgStockValueEvolution: number;
  numReferencesSold: number;
  numReferencesSoldEvolution: number;
  numPharmaciesSold: number;
  numPharmaciesSoldEvolution: number;
  type: "current" | "comparison";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ metrics: LabMetrics[] } | { error: string }>
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
),

lab_metrics_data AS (
    SELECT 
        AVG(dis.price_with_tax) AS avgSellPrice,
        AVG(dis.weighted_average_price * (1 + dip."TVA")) AS avgWeightedBuyPrice,
        AVG(dis.price_with_tax - (dis.weighted_average_price * (1 + dip."TVA"))) AS avgMargin,
        AVG(
            CASE 
                WHEN dis.price_with_tax > 0 
                THEN (dis.price_with_tax - (dis.weighted_average_price * (1 + dip."TVA"))) / dis.price_with_tax * 100
                ELSE NULL 
            END
        ) AS avgMarginPercentage,
        AVG(dis.stock * dis.weighted_average_price) AS avgStockValue,
        COUNT(DISTINCT dip.id) AS numReferencesSold,
        COUNT(DISTINCT dip.pharmacy_id) AS numPharmaciesSold,
        'current' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id -- 🔹 Correction ici
    JOIN data_internalproduct dip ON dis.product_id = dip.id -- 🔹 Correction ici
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date BETWEEN $10 AND $11
      AND ($12::uuid[] IS NULL OR dip.pharmacy_id = ANY($12::uuid[]))

    UNION ALL

    SELECT 
        AVG(dis.price_with_tax) AS avgSellPrice,
        AVG(dis.weighted_average_price * (1 + dip."TVA")) AS avgWeightedBuyPrice,
        AVG(dis.price_with_tax - (dis.weighted_average_price * (1 + dip."TVA"))) AS avgMargin,
        AVG(
            CASE 
                WHEN dis.price_with_tax > 0 
                THEN (dis.price_with_tax - (dis.weighted_average_price * (1 + dip."TVA"))) / dis.price_with_tax * 100
                ELSE NULL 
            END
        ) AS avgMarginPercentage,
        AVG(dis.stock * dis.weighted_average_price) AS avgStockValue,
        COUNT(DISTINCT dip.id) AS numReferencesSold,
        COUNT(DISTINCT dip.pharmacy_id) AS numPharmaciesSold,
        'comparison' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id -- 🔹 Correction ici
    JOIN data_internalproduct dip ON dis.product_id = dip.id -- 🔹 Correction ici
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date BETWEEN $13 AND $14
      AND ($12::uuid[] IS NULL OR dip.pharmacy_id = ANY($12::uuid[]))
)

SELECT 
    avgSellPrice,
    avgWeightedBuyPrice,
    avgMargin,
    avgMarginPercentage,
    avgStockValue,
    numReferencesSold,
    numPharmaciesSold,
    type,
    ((avgSellPrice - LAG(avgSellPrice) OVER (ORDER BY type)) / NULLIF(LAG(avgSellPrice) OVER (ORDER BY type), 0)) * 100 AS avgSellPriceEvolution,
    ((avgWeightedBuyPrice - LAG(avgWeightedBuyPrice) OVER (ORDER BY type)) / NULLIF(LAG(avgWeightedBuyPrice) OVER (ORDER BY type), 0)) * 100 AS avgWeightedBuyPriceEvolution,
    ((avgMargin - LAG(avgMargin) OVER (ORDER BY type)) / NULLIF(LAG(avgMargin) OVER (ORDER BY type), 0)) * 100 AS avgMarginEvolution,
    ((avgMarginPercentage - LAG(avgMarginPercentage) OVER (ORDER BY type)) / NULLIF(LAG(avgMarginPercentage) OVER (ORDER BY type), 0)) * 100 AS avgMarginPercentageEvolution,
    ((avgStockValue - LAG(avgStockValue) OVER (ORDER BY type)) / NULLIF(LAG(avgStockValue) OVER (ORDER BY type), 0)) * 100 AS avgStockValueEvolution,
    ((numReferencesSold - LAG(numReferencesSold) OVER (ORDER BY type)) / NULLIF(LAG(numReferencesSold) OVER (ORDER BY type), 0)) * 100 AS numReferencesSoldEvolution,
    ((numPharmaciesSold - LAG(numPharmaciesSold) OVER (ORDER BY type)) / NULLIF(LAG(numPharmaciesSold) OVER (ORDER BY type), 0)) * 100 AS numPharmaciesSoldEvolution
FROM lab_metrics_data
ORDER BY type ASC;
    `;

    // 🔹 Exécution de la requête SQL
    const { rows } = await pool.query<LabMetrics>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
      filters.dateRange[0], filters.dateRange[1], // Période principale
      filters.pharmacies.length > 0 ? filters.pharmacies.map(id => id) : null, // Correction : ajout du bon paramètre
      filters.comparisonDateRange[0], filters.comparisonDateRange[1] // Période de comparaison
    ]);
    console.log('rows metrics :', rows)

    return res.status(200).json({ metrics: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des métriques :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}