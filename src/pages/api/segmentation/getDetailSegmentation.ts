import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface SegmentationSalesStockData {
  month: string;
  total_quantity_sold: number;
  avg_stock_quantity: number;
  stock_break_quantity: number;
  total_stock_value: number;
  total_revenue: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ salesStockData: SegmentationSalesStockData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { segment, type } = req.body;

    if (!segment || !type) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    const query = `
WITH last_12_months AS (
    -- 🔹 Génère la liste des 12 derniers mois
    SELECT DISTINCT TO_CHAR(generate_series, 'YYYY-MM') AS month
    FROM generate_series(
        (CURRENT_DATE - interval '12 months')::date, 
        CURRENT_DATE::date, 
        interval '1 month'
    )
),

filtered_products AS (
    -- 🔹 Sélectionne les produits du segment donné
    SELECT dgp.code_13_ref
    FROM data_globalproduct dgp
    WHERE dgp.${type} = $1
),

latest_inventory_snapshot AS (
    -- 🔹 Récupère le dernier snapshot du stock pour chaque produit et pharmacie
    SELECT DISTINCT ON (dis.product_id, dip.pharmacy_id) 
        dis.product_id,
        dip.pharmacy_id,
        dis.weighted_average_price
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    ORDER BY dis.product_id, dip.pharmacy_id, dis.date DESC
),

sales_data AS (
    -- 🔹 Total des ventes par mois et CA total
    SELECT 
        TO_CHAR(ds.date, 'YYYY-MM') AS month,
        SUM(ds.quantity) AS total_quantity_sold,
        SUM(ds.quantity * dis.price_with_tax) AS total_revenue
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date >= (CURRENT_DATE - interval '12 months')
    GROUP BY month
),

stock_data AS (
    -- 🔹 Somme des moyennes des stocks et valeur totale du stock
    SELECT 
        TO_CHAR(dis.date, 'YYYY-MM') AS month,
        SUM(AVG(dis.stock)) OVER (PARTITION BY TO_CHAR(dis.date, 'YYYY-MM')) AS avg_stock_quantity,  -- ✅ Somme des moyennes par mois
        SUM(dis.stock * lis.weighted_average_price) AS total_stock_value
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    LEFT JOIN latest_inventory_snapshot lis ON lis.product_id = dis.product_id AND lis.pharmacy_id = dip.pharmacy_id
    WHERE dis.date >= (CURRENT_DATE - interval '12 months')
    GROUP BY month
),

stock_break_data AS (
    SELECT 
        TO_CHAR(dor.sent_date, 'YYYY-MM') AS month,
        SUM(CASE WHEN dpo.qte_r > 0 THEN dpo.qte_r ELSE 0 END) AS stock_break_quantity
    FROM data_productorder dpo
    JOIN data_order dor ON dpo.order_id = dor.id
    JOIN data_internalproduct dip ON dpo.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE dor.sent_date >= (CURRENT_DATE - interval '12 months')
      AND dpo.qte_r > 0  -- ✅ Ajouté ici
    GROUP BY month
)

-- 🔹 Jointure des données ventes, stock et ruptures avec les 12 derniers mois
SELECT 
    lm.month,
    COALESCE(sd.total_quantity_sold, 0) AS total_quantity_sold,
    COALESCE(sd.total_revenue, 0) AS total_revenue,  -- ✅ CA total ajouté
    COALESCE(st.avg_stock_quantity, 0) AS avg_stock_quantity,  -- ✅ Somme des moyennes des stocks
    COALESCE(st.total_stock_value, 0) AS total_stock_value,  -- ✅ Valeur totale du stock
    COALESCE(sb.stock_break_quantity, 0) AS stock_break_quantity
FROM last_12_months lm
LEFT JOIN sales_data sd ON lm.month = sd.month
LEFT JOIN stock_data st ON lm.month = st.month
LEFT JOIN stock_break_data sb ON lm.month = sb.month
ORDER BY lm.month ASC;
    `;

    const { rows } = await pool.query<SegmentationSalesStockData>(query, [segment]);

    console.log("📊 Données SQL retournées :", rows);

    return res.status(200).json({ salesStockData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des ventes, stocks et ruptures :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}