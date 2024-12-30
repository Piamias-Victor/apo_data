import pool from "@/libs/db";
import { Sale } from "@/types/Sale";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ sales: Sale[]; total: number } | { error: string }>
) {
  try {
    // Récupère les paramètres de pagination et de tri
    const { page = '1', limit = '100', sort_by = 'stock', order = 'desc' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 100;
    const offset = (pageNum - 1) * limitNum;

    // Valider les paramètres de tri
    const validSortBy = [
      'stock',
      'price_with_tax',
      'weighted_average_price',
      'quantity',
      'time',
      'created_at',
      'code13_ref',
    ];
    
    const validOrder = ['asc', 'desc'];

    if (!validSortBy.includes(sort_by as string)) {
      return res.status(400).json({ error: `Invalid sort_by parameter: ${sort_by}` });
    }

    if (!validOrder.includes(order as string)) {
      return res.status(400).json({ error: `Invalid order parameter: ${order}` });
    }

    // Total des ventes
    const countQuery = `SELECT COUNT(*) FROM data_sales`;
    const countResult = await pool.query<{ count: string }>(countQuery);
    const total = parseInt(countResult.rows[0].count, 10);

    // Requête paginée et triée
    const query = `
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
      dis.product_id = dip.id
    ORDER BY ${sort_by} ${order}
    LIMIT $1 OFFSET $2;
  `;
  
  const result = await pool.query<Sale>(query, [limitNum, offset]);
  

    return res.status(200).json({ sales: result.rows, total });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to fetch data from database' });
  }
}
