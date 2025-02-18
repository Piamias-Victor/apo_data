import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface TopProduct {
  code_13_ref: string;
  product_name: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  ranking_type: "quantity" | "revenue" | "margin";
}

/**
 * API pour récupérer les 10 meilleurs produits par ventes, CA et marge.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ topProducts: TopProduct[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters || !filters.distributors || !filters.ranges) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    // Requête SQL pour récupérer les 10 meilleurs produits en ventes, CA et marge
    const query = `
WITH filtered_products AS (
    SELECT dgp.code_13_ref, dgp.tva_percentage, dgp.name
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
product_sales AS (
    SELECT 
        fp.code_13_ref,
        fp.name AS product_name,
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue,
        SUM((dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) * ds.quantity) AS margin
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY fp.code_13_ref, fp.name
),
ranked_products AS (
    SELECT 
        code_13_ref,
        product_name,
        total_quantity,
        revenue,
        margin,
        'quantity' AS ranking_type,
        ROW_NUMBER() OVER (ORDER BY total_quantity DESC) AS rank
    FROM product_sales
    UNION ALL
    SELECT 
        code_13_ref,
        product_name,
        total_quantity,
        revenue,
        margin,
        'revenue' AS ranking_type,
        ROW_NUMBER() OVER (ORDER BY revenue DESC) AS rank
    FROM product_sales
    UNION ALL
    SELECT 
        code_13_ref,
        product_name,
        total_quantity,
        revenue,
        margin,
        'margin' AS ranking_type,
        ROW_NUMBER() OVER (ORDER BY margin DESC) AS rank
    FROM product_sales
)
SELECT code_13_ref, product_name, total_quantity, revenue, margin, ranking_type
FROM ranked_products
WHERE rank <= 10
ORDER BY ranking_type, rank;
    `;

    // Exécution de la requête SQL avec les filtres
    const { rows } = await pool.query<TopProduct>(query, [
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

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée" });
    }

    return res.status(200).json({ topProducts: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}