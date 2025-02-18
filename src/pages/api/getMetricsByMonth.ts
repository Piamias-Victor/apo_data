import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface PriceMarginData {
  month: string;
  avg_sale_price: number;
  avg_purchase_price: number;
  avg_margin: number;
  avg_margin_percentage: number;
  unique_products_sold: number;
  unique_selling_pharmacies: number;
}

/**
 * API pour récupérer les statistiques des prix, marges et ventes par mois
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ priceMarginData: PriceMarginData[] } | { error: string }>
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

, sales_data AS (
    -- Récupère les ventes par mois avec calcul des prix et marges
    SELECT 
        TO_CHAR(ds.date, 'YYYY-MM') AS month,
        AVG(dis.price_with_tax) AS avg_sale_price, -- ✅ Prix de vente moyen
        AVG(lis.weighted_average_price) AS avg_purchase_price, -- ✅ Prix d'achat moyen
        AVG(
            (dis.price_with_tax - (lis.weighted_average_price * (1 + (COALESCE(fp.tva_percentage, 0) / 100))))
        ) AS avg_margin, -- ✅ Marge moyenne
        AVG(
            (dis.price_with_tax - (lis.weighted_average_price * (1 + (COALESCE(fp.tva_percentage, 0) / 100)))) / 
            NULLIF(dis.price_with_tax, 0) -- ✅ Évite la division par zéro
        ) * 100 AS avg_margin_percentage, -- ✅ % de marge moyenne
        COUNT(DISTINCT ds.product_id) AS unique_products_sold, -- ✅ Nombre de références uniques vendues
        COUNT(DISTINCT dip.pharmacy_id) AS unique_selling_pharmacies -- ✅ Nombre de pharmacies ayant vendu un produit
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    LEFT JOIN latest_inventory_snapshot lis ON lis.product_id = dis.product_id AND lis.pharmacy_id = dip.pharmacy_id
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY month
)

, all_months AS (
    SELECT DISTINCT month FROM sales_data
)

SELECT 
    am.month,
    ROUND(COALESCE(sd.avg_sale_price, 0), 2) AS avg_sale_price,
    ROUND(COALESCE(sd.avg_purchase_price, 0), 2) AS avg_purchase_price,
    ROUND(COALESCE(sd.avg_margin, 0), 2) AS avg_margin,
    ROUND(COALESCE(sd.avg_margin_percentage, 0), 2) AS avg_margin_percentage,
    COALESCE(sd.unique_products_sold, 0) AS unique_products_sold,
    COALESCE(sd.unique_selling_pharmacies, 0) AS unique_selling_pharmacies
FROM all_months am
LEFT JOIN sales_data sd ON am.month = sd.month
ORDER BY am.month ASC;
    `;

    const { rows } = await pool.query<PriceMarginData>(query, [
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

    return res.status(200).json({ priceMarginData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des prix et marges :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}