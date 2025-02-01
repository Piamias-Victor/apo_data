import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/fetch/db';

interface Pharmacy {
  id: string;
  id_nat: string | null;
  name: string;
  ca: number | null;
  area: string | null;
  employees_count: number | null;
  address: string | null;
}

/**
 * API pour récupérer toutes les pharmacies depuis `data_pharmacy`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ pharmacies: Pharmacy[] } | { error: string }>
) {
  try {
    // Requête SQL pour récupérer toutes les pharmacies
    const query = `
      SELECT id, id_nat, name, ca, area, employees_count, address
      FROM data_pharmacy
      ORDER BY name ASC;
    `;

    const result = await pool.query<Pharmacy>(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune pharmacie trouvée' });
    }

    return res.status(200).json({ pharmacies: result.rows });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des pharmacies:', error);
    return res.status(500).json({ error: 'Échec de la récupération des données' });
  }
}