import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/libs/db";
import { Pharmacy } from '@/types/Pharmacy';

/**
 * Handler pour l'API `/api/data_pharmacies`.
 * Récupère toutes les pharmacies depuis la table `data_pharmacy`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Pharmacy[] | { error: string }>
) {
  try {
    const query = `
      SELECT 
        id,
        created_at,
        updated_at,
        name,
        ca,
        area,
        employees_count,
        address,
        id_nat
      FROM data_pharmacy
      ORDER BY name ASC;
    `;

    const result = await pool.query<Pharmacy>(query);

    console.log(`Fetched ${result.rows.length} pharmacies`);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune pharmacie trouvée' });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies depuis la base de données:', error);
    return res.status(500).json({ error: 'Échec de la récupération des pharmacies depuis la base de données' });
  }
}
