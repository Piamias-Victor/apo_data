import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface ProductBreakData {
  code_13_ref: string;
  name: string;
  total_quantity_sold: number;
  total_orders: number;
  total_quantity_ordered: number;
  total_stock_break_quantity: number;
  total_stock_break_amount: number;
}

/**
 * API pour récupérer la liste des ruptures par produit d'un laboratoire,
 * avec quantités vendues, commandées et en rupture.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ruptures: ProductBreakData[] } | { error: string }>
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
        -- 🟢 Sélection des produits du laboratoire ciblé avec leur nom
        SELECT 
            dgp.code_13_ref,
            dgp.name,
            dip.id AS internal_product_id
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

    sales_data AS (
        -- 🔹 Récupère les quantités vendues par produit sur les 12 derniers mois
        SELECT 
            TO_CHAR(ds.date, 'YYYY-MM') AS month,
            dip.code_13_ref_id AS code_13_ref,
            SUM(ds.quantity) AS total_quantity_sold
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE ds.date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10)) 
        GROUP BY month, dip.code_13_ref_id
    ),

    order_data AS (
        -- 🔹 Nombre total de commandes passées et quantités commandées (toutes les commandes)
        SELECT 
            TO_CHAR(dor.sent_date, 'YYYY-MM') AS month,
            dpo.product_id,
            COUNT(DISTINCT dpo.order_id) AS total_orders,  
            SUM(dpo.qte + dpo.qte_ug) AS total_quantity_ordered
        FROM data_productorder dpo
        JOIN data_order dor ON dpo.order_id = dor.id
        JOIN filtered_products fp ON dpo.product_id = fp.internal_product_id
        WHERE dor.sent_date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10::uuid[]))
        GROUP BY month, dpo.product_id
    ),

    stock_break_data AS (
        -- 🔹 Quantité en rupture de stock et montant des ruptures (uniquement les commandes avec des produits réceptionnés)
        SELECT 
            TO_CHAR(dor.sent_date, 'YYYY-MM') AS month,
            dpo.product_id,
            SUM(
                CASE 
                    WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r 
                    AND EXISTS (
                        SELECT 1 
                        FROM data_productorder dpo2 
                        WHERE dpo2.order_id = dpo.order_id 
                        AND dpo2.qte_r > 0
                    )
                    THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) 
                    ELSE 0 
                END
            ) AS total_stock_break_quantity,
            SUM(
                CASE 
                    WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r 
                    AND EXISTS (
                        SELECT 1 
                        FROM data_productorder dpo2 
                        WHERE dpo2.order_id = dpo.order_id 
                        AND dpo2.qte_r > 0
                    )
                    THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) * COALESCE(
                        (SELECT dis.weighted_average_price 
                         FROM data_inventorysnapshot dis 
                         WHERE dis.product_id = dpo.product_id
                         ORDER BY dis.date DESC
                         LIMIT 1),
                        0
                    )
                    ELSE 0 
                END
            ) AS total_stock_break_amount
        FROM data_productorder dpo
        JOIN data_order dor ON dpo.order_id = dor.id
        JOIN filtered_products fp ON dpo.product_id = fp.internal_product_id
        WHERE dor.sent_date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10::uuid[]))
        GROUP BY month, dpo.product_id
    )

    -- 🔄 Sélection des résultats finaux
    SELECT 
        fp.code_13_ref,
        fp.name, -- ✅ Ajout du nom du produit
        COALESCE(sd.month, od.month, sb.month) AS month,
        COALESCE(sd.total_quantity_sold, 0) AS total_quantity_sold, 
        COALESCE(od.total_orders, 0) AS total_orders, 
        COALESCE(od.total_quantity_ordered, 0) AS total_quantity_ordered, 
        COALESCE(sb.total_stock_break_quantity, 0) AS total_stock_break_quantity,
        COALESCE(sb.total_stock_break_amount, 0) AS total_stock_break_amount
    FROM filtered_products fp
    LEFT JOIN sales_data sd ON fp.code_13_ref = sd.code_13_ref
    LEFT JOIN order_data od ON fp.internal_product_id = od.product_id AND sd.month = od.month
    LEFT JOIN stock_break_data sb ON fp.internal_product_id = sb.product_id AND sd.month = sb.month
    ORDER BY month DESC, total_stock_break_quantity DESC;`;

    const { rows } = await pool.query<ProductBreakData>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
      filters.pharmacies.length > 0 ? filters.pharmacies.map((id) => id) : null,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune rupture trouvée" });
    }

    return res.status(200).json({ ruptures: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des ruptures :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}