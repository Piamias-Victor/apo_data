import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface SalesData {
  pharmacy_id: string;
  pharmacy_name: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  type: "current" | "comparison";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ salesData: SalesData[] } | { error: string }>
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
        !filters.specificities.length)
    ) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const { dateRange, comparisonDateRange } = filters;

    if (!dateRange || !comparisonDateRange) {
      return res.status(400).json({ error: "Périodes de filtrage manquantes" });
    }

    const query = `
WITH filtered_products AS (
    SELECT dgp.code_13_ref, dgp.tva_percentage
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
        dip.pharmacy_id,
        p.name AS pharmacy_name, -- ✅ Correction ici
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue,
        SUM(
            (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
            * ds.quantity
        ) AS margin,
        0 AS purchase_quantity,
        0 AS purchase_amount,
        'current' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    JOIN data_pharmacy p ON dip.pharmacy_id = p.id
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
      AND ds.date BETWEEN $11 AND $12 
    GROUP BY dip.pharmacy_id, p.name

    UNION ALL

    SELECT 
        dip.pharmacy_id,
        p.name AS pharmacy_name, -- ✅ Correction ici
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue,
        SUM(
            (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
            * ds.quantity
        ) AS margin,
        0 AS purchase_quantity,
        0 AS purchase_amount,
        'comparison' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    JOIN data_pharmacy p ON dip.pharmacy_id = p.id
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
      AND ds.date BETWEEN $13 AND $14 
    GROUP BY dip.pharmacy_id, p.name
),

purchase_data AS (
    SELECT 
        dor.pharmacy_id,
        p.name AS pharmacy_name, -- ✅ Correction ici
        0 AS total_quantity,
        0 AS revenue,
        0 AS margin,
        SUM(dpo.qte + dpo.qte_ug) AS purchase_quantity,
        SUM((dpo.qte + dpo.qte_ug) * COALESCE(
            (SELECT AVG(dis.weighted_average_price) 
             FROM data_inventorysnapshot dis 
             WHERE dis.product_id = dip.id), 0
        )) AS purchase_amount,
        'current' AS type
    FROM data_productorder dpo
    JOIN data_order dor ON dpo.order_id = dor.id
    JOIN data_internalproduct dip ON dpo.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    JOIN data_pharmacy p ON dor.pharmacy_id = p.id
    WHERE ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10::uuid[]))
      AND dor.sent_date BETWEEN $11 AND $12 
    GROUP BY dor.pharmacy_id, p.name

    UNION ALL

    SELECT 
        dor.pharmacy_id,
        p.name AS pharmacy_name, -- ✅ Correction ici
        0 AS total_quantity,
        0 AS revenue,
        0 AS margin,
        SUM(dpo.qte + dpo.qte_ug) AS purchase_quantity,
        SUM((dpo.qte + dpo.qte_ug) * COALESCE(
            (SELECT AVG(dis.weighted_average_price) 
             FROM data_inventorysnapshot dis 
             WHERE dis.product_id = dip.id), 0
        )) AS purchase_amount,
        'comparison' AS type
    FROM data_productorder dpo
    JOIN data_order dor ON dpo.order_id = dor.id
    JOIN data_internalproduct dip ON dpo.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    JOIN data_pharmacy p ON dor.pharmacy_id = p.id
    WHERE ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10::uuid[]))
      AND dor.sent_date BETWEEN $13 AND $14 
    GROUP BY dor.pharmacy_id, p.name
)

SELECT 
    pharmacy_id,
    pharmacy_name,
    COALESCE(SUM(total_quantity), 0) AS total_quantity,
    COALESCE(SUM(revenue), 0) AS revenue,
    COALESCE(SUM(margin), 0) AS margin,
    COALESCE(SUM(purchase_quantity), 0) AS purchase_quantity,
    COALESCE(SUM(purchase_amount), 0) AS purchase_amount,
    type
FROM (
    SELECT * FROM sales_data
    UNION ALL
    SELECT * FROM purchase_data
) combined_data
GROUP BY pharmacy_id, pharmacy_name, type
ORDER BY pharmacy_name, type ASC;
    `;

    const { rows } = await pool.query<SalesData>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
      filters.pharmacies.length > 0 ? filters.pharmacies : null,
      filters.dateRange[0], filters.dateRange[1],
      filters.comparisonDateRange[0], filters.comparisonDateRange[1],
    ]);

    return res.status(200).json({ salesData: rows });
  } catch (error) {
    console.error("❌ Erreur :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}