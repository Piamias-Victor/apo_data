import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface ProductSalesData {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ products: ProductSalesData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters || !filters.dateRange || !filters.comparisonDateRange) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const query = `
WITH filtered_products AS (
    SELECT dgp.code_13_ref, dgp.name AS product_name, dgp.tva_percentage, dgp.lab_distributor
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
        AND ($10::text[] IS NULL OR dgp.code_13_ref = ANY($10))
),

sales_data AS (
    SELECT 
        dip.code_13_ref_id AS code_13_ref,
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue,
        SUM(
            (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
            * ds.quantity
        ) AS margin,
        AVG(dis.price_with_tax) AS avg_selling_price,
        AVG(dis.weighted_average_price) AS avg_purchase_price,
        'current' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ($11::uuid[] IS NULL OR dip.pharmacy_id = ANY($11::uuid[]))
      AND ds.date BETWEEN $12 AND $13 
    GROUP BY dip.code_13_ref_id, fp.tva_percentage

    UNION ALL

    SELECT 
        dip.code_13_ref_id AS code_13_ref,
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue,
        SUM(
            (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
            * ds.quantity
        ) AS margin,
        AVG(dis.price_with_tax) AS avg_selling_price,
        AVG(dis.weighted_average_price) AS avg_purchase_price,
        'comparison' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ($11::uuid[] IS NULL OR dip.pharmacy_id = ANY($11::uuid[]))
      AND ds.date BETWEEN $14 AND $15 
    GROUP BY dip.code_13_ref_id, fp.tva_percentage
),

purchase_data AS (
    SELECT 
        dip.code_13_ref_id AS code_13_ref,
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
    WHERE ($11::uuid[] IS NULL OR dor.pharmacy_id = ANY($11::uuid[]))
      AND dor.sent_date BETWEEN $12 AND $13 
    GROUP BY dip.code_13_ref_id

    UNION ALL

    SELECT 
        dip.code_13_ref_id AS code_13_ref,
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
    WHERE ($11::uuid[] IS NULL OR dor.pharmacy_id = ANY($11::uuid[]))
      AND dor.sent_date BETWEEN $14 AND $15 
    GROUP BY dip.code_13_ref_id
)

SELECT 
    fp.code_13_ref,
    fp.product_name,
    COALESCE(SUM(sd.total_quantity), 0) AS total_quantity,
    COALESCE(SUM(sd.revenue), 0) AS revenue,
    COALESCE(SUM(sd.margin), 0) AS margin,
    COALESCE(SUM(pd.purchase_quantity), 0) AS purchase_quantity,
    COALESCE(SUM(pd.purchase_amount), 0) AS purchase_amount,
    COALESCE(AVG(sd.avg_selling_price), 0) AS avg_selling_price,
    COALESCE(AVG(sd.avg_purchase_price), 0) AS avg_purchase_price,
    CASE 
        WHEN SUM(sd.total_quantity) > 0 THEN SUM(sd.margin) / SUM(sd.total_quantity) 
        ELSE 0 
    END AS avg_margin,
    sd.type
FROM sales_data sd
FULL JOIN purchase_data pd ON sd.code_13_ref = pd.code_13_ref AND sd.type = pd.type
JOIN filtered_products fp ON sd.code_13_ref = fp.code_13_ref
GROUP BY fp.code_13_ref, fp.product_name, sd.type
ORDER BY sd.type ASC;
    `;

    const { rows } = await pool.query<ProductSalesData>(query, [
      filters.distributors.length ? filters.distributors : null,
      filters.ranges.length ? filters.ranges : null,
      filters.universes.length ? filters.universes : null,
      filters.categories.length ? filters.categories : null,
      filters.subCategories.length ? filters.subCategories : null,
      filters.brands.length ? filters.brands : null,
      filters.families.length ? filters.families : null,
      filters.subFamilies.length ? filters.subFamilies : null,
      filters.specificities.length ? filters.specificities : null,
      filters.ean13Products.length ? filters.ean13Products.map(String) : null, // ✅ Ajout du filtre `code_13_ref`
      filters.pharmacies.length ? filters.pharmacies.map(id => id) : null,
      filters.dateRange[0], filters.dateRange[1],
      filters.comparisonDateRange[0], filters.comparisonDateRange[1],
    ]);

    return res.status(200).json({ products: rows });
  } catch (error) {
    console.error("❌ Erreur API :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}