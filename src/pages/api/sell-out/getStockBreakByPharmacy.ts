import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface pour structurer les données des ruptures de stock
interface StockBreakData {
  pharmacy_id: string;
  pharmacy_name: string;
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
  type: "current" | "comparison"; // Période (actuelle ou comparaison)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ stockBreakData: StockBreakData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (
      !filters ||
      (!filters.pharmacies.length &&
        !filters.distributors.length &&
        !filters.brands.length &&
        !filters.universes.length &&
        !filters.categories.length &&
        !filters.families.length &&
        !filters.specificities.length &&
        !filters.ean13Products.length)
    ) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const { dateRange, comparisonDateRange } = filters;

    if (!dateRange || !comparisonDateRange) {
      return res.status(400).json({ error: "Périodes de filtrage manquantes" });
    }

    const ean13Products = filters.ean13Products?.length ? filters.ean13Products.map(String) : null;

    console.log("📌 Filtrage avec codes EAN13 :", ean13Products);

    const query = `
WITH filtered_products AS (
    SELECT dgp.code_13_ref, dip.id AS internal_product_id
    FROM data_globalproduct dgp
    JOIN data_internalproduct dip ON dgp.code_13_ref = dip.code_13_ref_id
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
        AND ($10::text[] IS NULL OR dgp.code_13_ref = ANY($10))
        AND ($11::uuid[] IS NULL OR dip.pharmacy_id = ANY($11::uuid[]))
),

stock_break_data AS (
    SELECT 
        dor.pharmacy_id,
        p.name AS pharmacy_name,
        SUM(dpo.qte + dpo.qte_ug) AS total_products_ordered,
        SUM(CASE WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) ELSE 0 END) AS stock_break_products,
        SUM(
            CASE 
                WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r THEN 
                    ((dpo.qte + dpo.qte_ug) - dpo.qte_r) * COALESCE(
                        (SELECT dis.weighted_average_price 
                         FROM data_inventorysnapshot dis 
                         WHERE dis.product_id = dip.id
                         ORDER BY dis.date DESC
                         LIMIT 1), 
                        0
                    )
                ELSE 0 
            END
        ) AS stock_break_amount,
        'current' AS type
    FROM data_productorder dpo
    JOIN data_order dor ON dpo.order_id = dor.id
    JOIN data_internalproduct dip ON dpo.product_id = dip.id
    JOIN filtered_products fp ON dip.id = fp.internal_product_id
    JOIN data_pharmacy p ON dor.pharmacy_id = p.id
    WHERE 
        ($11::uuid[] IS NULL OR dor.pharmacy_id = ANY($11::uuid[]))
        AND dor.sent_date BETWEEN $12 AND $13
        AND dpo.qte_r > 0

    UNION ALL

    SELECT 
        dor.pharmacy_id,
        p.name AS pharmacy_name,
        SUM(dpo.qte + dpo.qte_ug) AS total_products_ordered,
        SUM(CASE WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) ELSE 0 END) AS stock_break_products,
        SUM(
            CASE 
                WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r THEN 
                    ((dpo.qte + dpo.qte_ug) - dpo.qte_r) * COALESCE(
                        (SELECT dis.weighted_average_price 
                         FROM data_inventorysnapshot dis 
                         WHERE dis.product_id = dip.id
                         ORDER BY dis.date DESC
                         LIMIT 1), 
                        0
                    )
                ELSE 0 
            END
        ) AS stock_break_amount,
        'comparison' AS type
    FROM data_productorder dpo
    JOIN data_order dor ON dpo.order_id = dor.id
    JOIN data_internalproduct dip ON dpo.product_id = dip.id
    JOIN filtered_products fp ON dip.id = fp.internal_product_id
    JOIN data_pharmacy p ON dor.pharmacy_id = p.id
    WHERE 
        ($11::uuid[] IS NULL OR dor.pharmacy_id = ANY($11::uuid[]))
        AND dor.sent_date BETWEEN $14 AND $15
        AND dpo.qte_r > 0
)

SELECT 
    pharmacy_id,
    pharmacy_name,
    COALESCE(SUM(total_products_ordered), 0) AS total_products_ordered,
    COALESCE(SUM(stock_break_products), 0) AS stock_break_products,
    ROUND((COALESCE(SUM(stock_break_products), 0)::DECIMAL / NULLIF(COALESCE(SUM(total_products_ordered), 0), 0)) * 100, 2) AS stock_break_rate,
    COALESCE(SUM(stock_break_amount), 0) AS stock_break_amount,
    type
FROM stock_break_data
GROUP BY pharmacy_id, pharmacy_name, type
ORDER BY pharmacy_name, type ASC;
    `;

    const queryParams = [
      filters.distributors?.length ? filters.distributors : null,
      filters.ranges?.length ? filters.ranges : null,
      filters.universes?.length ? filters.universes : null,
      filters.categories?.length ? filters.categories : null,
      filters.subCategories?.length ? filters.subCategories : null,
      filters.brands?.length ? filters.brands : null,
      filters.families?.length ? filters.families : null,
      filters.subFamilies?.length ? filters.subFamilies : null,
      filters.specificities?.length ? filters.specificities : null,
      ean13Products,
      filters.pharmacies?.length ? filters.pharmacies.map(String) : null,
      dateRange[0], dateRange[1],
      comparisonDateRange[0], comparisonDateRange[1]
    ];

    const { rows } = await pool.query<StockBreakData>(query, queryParams);
    return res.status(200).json({ stockBreakData: rows });

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des ruptures de stock :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}