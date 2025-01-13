import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/db';

export interface StockEvolutionEntry {
  date: string;
  total_stock: number;
  avg_weighted_price: number;
  total_value: number;
}

export interface StockEvolutionResponse {
  stockEvolution: StockEvolutionEntry[];
}

/**
 * Endpoint pour récupérer l'évolution du stock global du groupement en prix moyen pondéré.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StockEvolutionResponse | { error: string }>
) {
  try {
    const client = await pool.connect();

    // Requête pour agréger le stock total et la valeur totale par jour
    const stockQuery = `
      SELECT 
        date, 
        SUM(stock) AS total_stock,
        SUM(stock * weighted_average_price) / NULLIF(SUM(stock), 0) AS avg_weighted_price,
        SUM(stock * weighted_average_price) AS total_value
      FROM data_inventorysnapshot
      WHERE date >= (current_date - INTERVAL '1 months') -- Derniers 1 mois
      GROUP BY date
      ORDER BY date ASC;
    `;

    const stockResult = await client.query<StockEvolutionEntry>(stockQuery);

    client.release();

    // Renvoyer les données sous format JSON
    res.status(200).json({ stockEvolution: stockResult.rows });
  } catch (error) {
    console.error('❌ Erreur API stockEvolution:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
