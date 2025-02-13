import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface pour structurer la réponse
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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ metrics: LabMetrics } | { error: string }>
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

sales_data AS (
    SELECT 
        dip.id AS product_id,
        AVG(dis.price_with_tax) AS avg_sell_price,
        AVG(dis.weighted_average_price * (1 + dip."TVA")) AS avg_weighted_buy_price_ttc,
        AVG(dis.price_with_tax - (dis.weighted_average_price * (1 + dip."TVA"))) AS avg_margin,
        AVG(
            CASE 
                WHEN dis.price_with_tax > 0 
                THEN (dis.price_with_tax - (dis.weighted_average_price * (1 + dip."TVA"))) / dis.price_with_tax * 100
                ELSE NULL 
            END
        ) AS avg_margin_percentage
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date BETWEEN NOW() - INTERVAL '12 months' AND NOW()
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY dip.id, dip."TVA"
),

previous_sales_data AS (
    SELECT 
        dip.id AS product_id,
        AVG(dis.price_with_tax) AS prev_avg_sell_price,
        AVG(dis.weighted_average_price * (1 + dip."TVA")) AS prev_avg_weighted_buy_price_ttc,
        AVG(dis.price_with_tax - (dis.weighted_average_price * (1 + dip."TVA"))) AS prev_avg_margin,
        AVG(
            CASE 
                WHEN dis.price_with_tax > 0 
                THEN (dis.price_with_tax - (dis.weighted_average_price * (1 + dip."TVA"))) / dis.price_with_tax * 100
                ELSE NULL 
            END
        ) AS prev_avg_margin_percentage
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date BETWEEN NOW() - INTERVAL '24 months' AND NOW() - INTERVAL '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY dip.id, dip."TVA"
),

stock_data AS (
    SELECT 
        dis.product_id,
        AVG(dis.stock * dis.weighted_average_price) AS avg_stock_value
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE dis.date BETWEEN NOW() - INTERVAL '12 months' AND NOW()
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY dis.product_id
),

previous_stock_data AS (
    SELECT 
        dis.product_id,
        AVG(dis.stock * dis.weighted_average_price) AS prev_avg_stock_value
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE dis.date BETWEEN NOW() - INTERVAL '24 months' AND NOW() - INTERVAL '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY dis.product_id
),

-- 🔹 Nombre total de références vendues
sold_references AS (
    SELECT COUNT(DISTINCT dip.id) AS num_references_sold
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date BETWEEN NOW() - INTERVAL '12 months' AND NOW()
),

-- 🔹 Nombre de pharmacies ayant vendu des références
sold_pharmacies AS (
    SELECT COUNT(DISTINCT dip.pharmacy_id) AS num_pharmacies_sold
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date BETWEEN NOW() - INTERVAL '12 months' AND NOW()
)

SELECT 
    -- Valeurs actuelles
    AVG(sd.avg_sell_price) AS avgSellPrice,
    AVG(sd.avg_weighted_buy_price_ttc) AS avgWeightedBuyPrice,
    AVG(sd.avg_margin) AS avgMargin,
    AVG(sd.avg_margin_percentage) AS avgMarginPercentage,
    AVG(st.avg_stock_value) AS avgStockValue,

    -- Valeurs précédentes
    AVG(psd.prev_avg_sell_price) AS prevAvgSellPrice,
    AVG(psd.prev_avg_weighted_buy_price_ttc) AS prevAvgWeightedBuyPrice,
    AVG(psd.prev_avg_margin) AS prevAvgMargin,
    AVG(psd.prev_avg_margin_percentage) AS prevAvgMarginPercentage,
    AVG(pst.prev_avg_stock_value) AS prevAvgStockValue,

    -- Nombre de références vendues
    (SELECT num_references_sold FROM sold_references) AS numReferencesSold,
    
    -- Nombre de pharmacies ayant vendu
    (SELECT num_pharmacies_sold FROM sold_pharmacies) AS numPharmaciesSold,

    -- Évolution en pourcentage
    ((AVG(sd.avg_sell_price) - AVG(psd.prev_avg_sell_price)) / NULLIF(AVG(psd.prev_avg_sell_price), 0)) * 100 AS avgSellPriceEvolution,
    ((AVG(sd.avg_weighted_buy_price_ttc) - AVG(psd.prev_avg_weighted_buy_price_ttc)) / NULLIF(AVG(psd.prev_avg_weighted_buy_price_ttc), 0)) * 100 AS avgWeightedBuyPriceEvolution,
    ((AVG(sd.avg_margin) - AVG(psd.prev_avg_margin)) / NULLIF(AVG(psd.prev_avg_margin), 0)) * 100 AS avgMarginEvolution,
    ((AVG(sd.avg_margin_percentage) - AVG(psd.prev_avg_margin_percentage)) / NULLIF(AVG(psd.prev_avg_margin_percentage), 0)) * 100 AS avgMarginPercentageEvolution,
    ((AVG(st.avg_stock_value) - AVG(pst.prev_avg_stock_value)) / NULLIF(AVG(pst.prev_avg_stock_value), 0)) * 100 AS avgStockValueEvolution
FROM sales_data sd
LEFT JOIN previous_sales_data psd ON sd.product_id = psd.product_id
LEFT JOIN stock_data st ON sd.product_id = st.product_id
LEFT JOIN previous_stock_data pst ON st.product_id = pst.product_id;
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

    return res.status(200).json({ metrics: rows[0] });
  } catch (error) {
    console.error("❌ Erreur :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}