import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/db";

interface StockoutUnivers {
  universe: string;
  stockoutRate: number;
}

interface StockoutUniversResponse {
  stockoutUnivers: StockoutUnivers[];
}

/**
 * Endpoint pour récupérer le taux de rupture par univers.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StockoutUniversResponse | { error: string }>
) {
  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        gp.universe AS universe,
        ROUND(100.0 * COUNT(CASE WHEN i.stock = 0 THEN 1 END) / COUNT(*), 2) AS stockoutRate
      FROM data_inventorysnapshot i
      JOIN data_internalproduct ip ON i.product_id = ip.id
      JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      WHERE i.date = (SELECT MAX(date) FROM data_inventorysnapshot)
      GROUP BY gp.universe
      ORDER BY stockoutRate DESC;
    `;

    const result = await client.query<StockoutUnivers>(query);
    client.release();

    res.status(200).json({ stockoutUnivers: result.rows });
  } catch (error) {
    console.error("❌ Erreur API stockout-univers:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
