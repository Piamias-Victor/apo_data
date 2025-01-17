import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/db';

export interface StockOutResponse {
  categories: { category: string; stockOutRate: number }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StockOutResponse | { error: string }>
) {
  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        gp.category,
        COUNT(CASE WHEN i.stock = 0 THEN 1 END) * 100.0 / COUNT(*) AS stock_out_rate
      FROM data_inventorysnapshot i
      JOIN data_internalproduct ip ON i.product_id = ip.id
      JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      WHERE i.date = (SELECT MAX(date) FROM data_inventorysnapshot)
      GROUP BY gp.category
      ORDER BY stock_out_rate DESC;
    `;

    const result = await client.query(query);

    const categories = result.rows.map(row => ({
      category: row.category || 'Inconnue',
      stockOutRate: parseFloat(row.stock_out_rate)
    }));

    client.release();

    res.status(200).json({ categories });
  } catch (error) {
    console.error('❌ Erreur API stock-out:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
