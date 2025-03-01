import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface StockBreakRateData {
  total_products_ordered: number;
  stock_break_products: number;
  stock_break_rate: number;
  stock_break_amount: number;
  type: "current" | "comparison"; // 🔹 Identifie la période (actuelle ou comparaison)
}

/**
 * API pour récupérer le taux de rupture en fonction des périodes sélectionnées.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ stockBreakData: StockBreakRateData[] } | { error: string }>
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
    -- 🟢 Sélectionner les produits filtrés en fonction des critères
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
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
),

stock_break_data AS (
    SELECT 
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
    WHERE 
        ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10::uuid[]))
        AND dor.sent_date BETWEEN $11 AND $12
        AND dpo.qte_r > 0  -- ✅ Condition ajoutée pour inclure uniquement les commandes avec réception

    UNION ALL

    SELECT 
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
    WHERE 
        ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10::uuid[]))
        AND dor.sent_date BETWEEN $13 AND $14
        AND dpo.qte_r > 0  -- ✅ Condition ajoutée pour inclure uniquement les commandes avec réception
)

-- 🔄 Calcul du taux de rupture
SELECT 
    total_products_ordered,
    stock_break_products,
    ROUND((stock_break_products::DECIMAL / NULLIF(total_products_ordered, 0)) * 100, 2) AS stock_break_rate,
    COALESCE(stock_break_amount, 0) AS stock_break_amount,
    type
FROM stock_break_data
ORDER BY type ASC;
    `;

    // Exécution de la requête SQL avec les filtres
    const { rows } = await pool.query<StockBreakRateData>(query, [
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

    return res.status(200).json({ stockBreakData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}