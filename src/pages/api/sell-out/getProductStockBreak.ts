import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// 📌 Interface des données retournées
interface ProductStockBreakData {
  code_13_ref: string;
  product_name: string;
  total_products_ordered: number;  // 📦 Produits commandés
  stock_break_products: number;    // ❌ Produits en rupture
  stock_break_rate: number;        // 📊 Taux de rupture (%)
  stock_break_amount: number;      // 💰 Montant des ruptures (€)
  type: "current" | "comparison";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ stockBreakData: ProductStockBreakData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters || !filters.dateRange || !filters.comparisonDateRange) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const { dateRange, comparisonDateRange } = filters;

    const query = `
WITH filtered_products AS (
    -- 🟢 Sélectionner les produits filtrés
    SELECT dgp.code_13_ref, dgp.name AS product_name
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

stock_break_data AS (
    -- 📌 Ruptures sur la période principale
    SELECT 
        dip.code_13_ref_id AS code_13_ref,
        SUM(dpo.qte + dpo.qte_ug) AS total_products_ordered, -- 📦 Produits commandés
        SUM(
            CASE 
                WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r 
                THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) 
                ELSE 0 
            END
        ) AS stock_break_products, -- ❌ Produits en rupture
        SUM(
            (CASE 
                WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r 
                THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) 
                ELSE 0 
            END) * COALESCE(
                (SELECT dis.weighted_average_price 
                 FROM data_inventorysnapshot dis 
                 WHERE dis.product_id = dip.id
                 ORDER BY dis.date DESC
                 LIMIT 1), 
                0
            )
        ) AS stock_break_amount, -- 💰 Montant des ruptures (€)
        'current' AS type
    FROM data_productorder dpo
    JOIN data_order dor ON dpo.order_id = dor.id
    JOIN data_internalproduct dip ON dpo.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE 
        ($11::uuid[] IS NULL OR dor.pharmacy_id = ANY($11::uuid[]))
        AND dor.sent_date BETWEEN $12 AND $13
        AND dpo.qte_r > 0  -- ✅ NE GARDER QUE LES COMMANDES RÉCEPTIONNÉES
    GROUP BY dip.code_13_ref_id

    UNION ALL

    -- 📌 Ruptures sur la période de comparaison
    SELECT 
        dip.code_13_ref_id AS code_13_ref,
        SUM(dpo.qte + dpo.qte_ug) AS total_products_ordered, -- 📦 Produits commandés
        SUM(
            CASE 
                WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r 
                THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) 
                ELSE 0 
            END
        ) AS stock_break_products, -- ❌ Produits en rupture
        SUM(
            (CASE 
                WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r 
                THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) 
                ELSE 0 
            END) * COALESCE(
                (SELECT dis.weighted_average_price 
                 FROM data_inventorysnapshot dis 
                 WHERE dis.product_id = dip.id
                 ORDER BY dis.date DESC
                 LIMIT 1), 
                0
            )
        ) AS stock_break_amount, -- 💰 Montant des ruptures (€)
        'comparison' AS type
    FROM data_productorder dpo
    JOIN data_order dor ON dpo.order_id = dor.id
    JOIN data_internalproduct dip ON dpo.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE 
        ($11::uuid[] IS NULL OR dor.pharmacy_id = ANY($11::uuid[]))
        AND dor.sent_date BETWEEN $14 AND $15
        AND dpo.qte_r > 0  -- ✅ NE GARDER QUE LES COMMANDES RÉCEPTIONNÉES
    GROUP BY dip.code_13_ref_id
)

SELECT 
    fp.code_13_ref,
    fp.product_name,
    sb.total_products_ordered,
    sb.stock_break_products,
    ROUND(
        (sb.stock_break_products::DECIMAL / NULLIF(sb.total_products_ordered, 0)) * 100, 
        2
    ) AS stock_break_rate, -- 📊 Taux de rupture (%)
    sb.stock_break_amount,
    sb.type
FROM stock_break_data sb
JOIN filtered_products fp ON sb.code_13_ref = fp.code_13_ref
ORDER BY sb.type ASC;
    `;

    const { rows } = await pool.query<ProductStockBreakData>(query, [
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

    return res.status(200).json({ stockBreakData: rows });
  } catch (error) {
    console.error("❌ Erreur API Ruptures :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}