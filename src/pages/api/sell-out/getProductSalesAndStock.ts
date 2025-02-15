import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface ProductSalesStockData {
  month: string;
  total_quantity_sold: number;
  avg_stock_quantity: number;
  stock_break_quantity: number; // 🚀 Ajout de la quantité de rupture
}

/**
 * API pour récupérer les ventes, le stock moyen et les ruptures mensuelles d'un produit spécifique (par code EAN13)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ salesStockData: ProductSalesStockData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { code_13_ref } = req.body;

    if (!code_13_ref) {
      return res.status(400).json({ error: "Code EAN13 requis" });
    }

    const query = `
    WITH product_sales AS (
        -- 🔹 Récupère les quantités vendues du produit par mois
        SELECT 
            TO_CHAR(ds.date, 'YYYY-MM') AS month,
            SUM(ds.quantity) AS total_quantity_sold
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        WHERE dgp.code_13_ref = $1
        GROUP BY month
    )

    , product_stock AS (
        -- 🔹 Calcule la quantité moyenne en stock du produit par mois
        SELECT 
            TO_CHAR(dis.date, 'YYYY-MM') AS month,
            AVG(dis.stock) AS avg_stock_quantity
        FROM data_inventorysnapshot dis
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        WHERE dgp.code_13_ref = $1
        GROUP BY month
    )

    , product_stock_break AS (
        -- 🔹 Calcule la quantité en rupture de stock du produit par mois
        SELECT 
            TO_CHAR(dor.sent_date, 'YYYY-MM') AS month,
            SUM(CASE 
                    WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r 
                    THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) 
                    ELSE 0 
                END) AS stock_break_quantity
        FROM data_productorder dpo
        JOIN data_order dor ON dpo.order_id = dor.id
        JOIN data_internalproduct dip ON dpo.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        WHERE dgp.code_13_ref = $1
        GROUP BY month
    )

    , all_months AS (
        -- 🔹 Génère la liste des 12 derniers mois pour assurer la complétude des données
        SELECT DISTINCT TO_CHAR(generate_series, 'YYYY-MM') AS month
        FROM generate_series(
            (CURRENT_DATE - interval '12 months')::date, 
            CURRENT_DATE::date, 
            interval '1 month'
        )
    )

    -- 🔹 Jointure des données ventes, stock et ruptures
    SELECT 
        am.month,
        COALESCE(ps.total_quantity_sold, 0) AS total_quantity_sold,
        COALESCE(psk.avg_stock_quantity, 0) AS avg_stock_quantity,
        COALESCE(psb.stock_break_quantity, 0) AS stock_break_quantity
    FROM all_months am
    LEFT JOIN product_sales ps ON am.month = ps.month
    LEFT JOIN product_stock psk ON am.month = psk.month
    LEFT JOIN product_stock_break psb ON am.month = psb.month
    ORDER BY am.month ASC;
    `;

    const { rows } = await pool.query<ProductSalesStockData>(query, [code_13_ref]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée pour ce produit" });
    }

    return res.status(200).json({ salesStockData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des ventes, stocks et ruptures du produit :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}