import pool from "@/libs/db";
import { Family } from "@/types/Segmentation";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Handler pour l'API `/api/data_families`.
 * Récupère les `families` uniques avec leurs `sub_families` depuis la table `data_globalproduct`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Family[] | { error: string }>
) {
  try {
    const query = `
      SELECT
        family,
        array_agg(DISTINCT sub_family ORDER BY sub_family) AS sub_families
      FROM
        data_globalproduct
      WHERE
        family IS NOT NULL AND sub_family IS NOT NULL
      GROUP BY
        family
      ORDER BY
        family ASC
      LIMIT 100;
    `;

    const result = await pool.query<{ family: string; sub_families: string[] }>(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune information sur les familles trouvée' });
    }

    // Transformer les données en type Family
    const families: Family[] = result.rows.map(row => ({
      family: row.family,
      sub_families: row.sub_families.map(sub => ({ sub_family: sub }))
    }));

    return res.status(200).json(families);
  } catch (error) {
    console.error('Erreur lors de la récupération des familles depuis la base de données:', error);
    return res.status(500).json({ error: 'Échec de la récupération des familles depuis la base de données' });
  }
}
