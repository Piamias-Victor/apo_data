import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/libs/db";

/**
 * Type définissant les résultats de l'analyse.
 */
type ExplainAnalyzeResult = {
  plan: string;
};

/**
 * Handler pour l'API `/api/data_explain_analyze`.
 * Récupère les résultats d'analyse de la requête triée par `stock`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExplainAnalyzeResult[] | { error: string }>
) {
  try {
    const query = `
      EXPLAIN ANALYZE 
      SELECT 
        ds.id AS id,
        ds.created_at AS created_at,
        ds.updated_at AS updated_at,
        ds.quantity,
        ds.time,
        ds.operator_code,
        ds.product_id,
        dis.stock,
        dis.price_with_tax,
        dis.weighted_average_price,
        dip.code_13_ref_id AS code13_ref
      FROM 
        data_sales ds
      LEFT JOIN 
        data_inventorysnapshot dis
      ON 
        ds.product_id = dis.id
      LEFT JOIN 
        data_internalproduct dip
      ON 
        ds.product_id = dip.id
      ORDER BY dis.stock DESC
      LIMIT 100;
    `;

    const result = await pool.query<{ plan: string }>(query);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur lors de l\'analyse EXPLAIN ANALYZE :', error);
    return res.status(500).json({ error: 'Échec de l\'exécution du EXPLAIN ANALYZE.' });
  }
}
