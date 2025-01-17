import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/db";

interface FinancialDataResponse {
  totalRevenue: number;
  totalPurchase: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FinancialDataResponse | { error: string }>
) {
  try {
    const client = await pool.connect();

    // Requête pour récupérer le chiffre d'affaires total et le montant des achats
    const query = `
      SELECT 
        SUM(s.quantity * COALESCE(i.price_with_tax, 0)) AS totalRevenue,
        SUM(s.quantity * COALESCE(i.weighted_average_price, 0)) AS totalPurchase
      FROM data_sales s
      JOIN data_inventorysnapshot i ON s.product_id = i.id
      WHERE s.quantity > 0;
    `;

    const result = await client.query<{
      totalrevenue: string;
      totalpurchase: string;
    }>(query);

    client.release();

    // Convertir correctement les résultats en nombres
    const totalRevenueRaw = result.rows[0]?.totalrevenue;
    const totalPurchaseRaw = result.rows[0]?.totalpurchase;

    const totalRevenue = totalRevenueRaw
      ? parseFloat(totalRevenueRaw.replace(",", ""))
      : 0;
    const totalPurchase = totalPurchaseRaw
      ? parseFloat(totalPurchaseRaw.replace(",", ""))
      : 0;

    res.status(200).json({ totalRevenue, totalPurchase });
  } catch (error) {
    console.error("Erreur lors de la récupération des données financières :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
