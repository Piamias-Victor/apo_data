import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées par marque
interface BrandBreakData {
  brand_lab: string;
  total_quantity_sold: number;
  total_orders: number;
  total_quantity_ordered: number;
  total_stock_break_quantity: number;
  total_stock_break_amount: number;
  monthly_breaks: {
    month: string;
    total_quantity_sold: number;
    total_quantity_ordered: number;
    total_stock_break_quantity: number;
    total_stock_break_amount: number;
  }[];
}

/**
 * API pour récupérer les ruptures groupées par marque et par mois
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ruptures: BrandBreakData[] } | { error: string }>
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
    WITH filtered_brands AS (
        -- 🟢 Filtre les marques selon les critères de segmentation
        SELECT DISTINCT dgp.brand_lab
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
        -- 🔹 Récupère les quantités vendues par marque sur les 12 derniers mois
        SELECT 
            dgp.brand_lab,
            SUM(ds.quantity) AS total_quantity_sold
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        JOIN filtered_brands fb ON dgp.brand_lab = fb.brand_lab
        WHERE ds.date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10)) 
        GROUP BY dgp.brand_lab
    ),

    order_data AS (
        -- 🔹 Nombre total de commandes passées et quantités commandées, groupées par marque
        SELECT 
            dgp.brand_lab,
            COUNT(DISTINCT dpo.order_id) AS total_orders,  
            SUM(dpo.qte + dpo.qte_ug) AS total_quantity_ordered
        FROM data_productorder dpo
        JOIN data_order dor ON dpo.order_id = dor.id
        JOIN data_internalproduct dip ON dpo.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        JOIN filtered_brands fb ON dgp.brand_lab = fb.brand_lab
        WHERE dor.sent_date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10))
        GROUP BY dgp.brand_lab
    ),

    stock_break_data AS (
        -- 🔹 Quantité en rupture de stock et montant des ruptures, groupées par marque
        SELECT 
            dgp.brand_lab,
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
        JOIN data_internalproduct dip ON dpo.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        JOIN filtered_brands fb ON dgp.brand_lab = fb.brand_lab
        WHERE dor.sent_date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10))
        GROUP BY dgp.brand_lab
    ),

    monthly_break_data AS (
        -- 🔹 Détail des ruptures par mois et par marque
        SELECT 
            dgp.brand_lab,
            TO_CHAR(dor.sent_date, 'YYYY-MM') AS month, 
            SUM(dpo.qte + dpo.qte_ug) AS total_quantity_ordered,
            SUM(ds.quantity) AS total_quantity_sold,
            SUM(
                CASE 
                    WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) 
                    ELSE 0 
                END
            ) AS total_stock_break_quantity,
            SUM(
                CASE 
                    WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) * COALESCE(
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
        JOIN data_internalproduct dip ON dpo.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        JOIN filtered_brands fb ON dgp.brand_lab = fb.brand_lab
        LEFT JOIN data_sales ds ON ds.product_id = dpo.product_id AND ds.date = dor.sent_date
        WHERE dor.sent_date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10))
        GROUP BY dgp.brand_lab, month
    )

    SELECT 
        fb.brand_lab,
        COALESCE(sd.total_quantity_sold, 0) AS total_quantity_sold, 
        COALESCE(od.total_orders, 0) AS total_orders, 
        COALESCE(od.total_quantity_ordered, 0) AS total_quantity_ordered, 
        COALESCE(sb.total_stock_break_quantity, 0) AS total_stock_break_quantity,
        COALESCE(sb.total_stock_break_amount, 0) AS total_stock_break_amount,
        json_agg(json_build_object(
            'month', month,
            'total_quantity_sold', total_quantity_sold,
            'total_quantity_ordered', total_quantity_ordered,
            'total_stock_break_quantity', total_stock_break_quantity,
            'total_stock_break_amount', total_stock_break_amount
        )) AS monthly_breaks
    FROM filtered_brands fb
    LEFT JOIN monthly_break_data mb ON fb.brand_lab = mb.brand_lab
    GROUP BY fb.brand_lab;
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
      filters.pharmacies.length > 0 ? filters.pharmacies.map((id) => id) : null,
    ]);

    return res.status(200).json({ ruptures: rows });

  } catch (error) {
    console.error("❌ Erreur SQL :", error.message);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}