// /pages/api/products_code13.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/db';
import { ProductCode13 } from '@/types/Product';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProductCode13[] | { error: string }>
) {
  try {
    const query = `
      SELECT DISTINCT ON (name)
             code_13_ref,
             name
      FROM data_globalproduct
      WHERE name IS NOT NULL
      ORDER BY name, code_13_ref;
    `;

    const result = await pool.query<ProductCode13>(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucun produit trouvé' });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return res.status(500).json({ error: 'Échec de la récupération des données' });
  }
}
