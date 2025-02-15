import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface LabMarketShare {
  laboratoire: string;
  total_sales: number;
  total_margin: number;
  part_de_marche: number;
  part_de_marge: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ labs: LabMarketShare[] } | { error: string }>
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
    WITH sales_data AS (
        SELECT 
            dgp.brand_lab AS laboratoire,
            SUM(ds.quantity * dis.price_with_tax) AS total_sales,
            SUM(
                (dis.price_with_tax - (dis.weighted_average_price * (1 + (dgp.tva_percentage / 100)))) 
                * ds.quantity
            ) AS total_margin
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        WHERE dgp.${type} = $1  -- 🔹 Filtrage dynamique sur l'univers, catégorie, famille
        GROUP BY dgp.brand_lab
    ),

    market_totals AS (
        -- ✅ Correction : On prend bien le total du segment et pas juste le TOP 3
        SELECT 
            SUM(total_sales) AS global_sales,
            SUM(total_margin) AS global_margin
        FROM sales_data
    )

    SELECT 
        sd.laboratoire, 
        sd.total_sales,
        sd.total_margin,
        ROUND((sd.total_sales * 100.0) / mt.global_sales, 2) AS part_de_marche,  -- ✅ Correction ici
        ROUND((sd.total_margin * 100.0) / mt.global_margin, 2) AS part_de_marge
    FROM sales_data sd
    CROSS JOIN market_totals mt
    ORDER BY total_sales DESC
    LIMIT 3;
    `;

    const { rows } = await pool.query<LabMarketShare>(query, [segment]);

    console.log("🟢 Top 3 laboratoires :", rows);

    return res.status(200).json({ labs: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des laboratoires :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}