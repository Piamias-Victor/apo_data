import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/libs/db";

/**
 * Type définissant une spécificité unique.
 */
type Specificity = {
  specificity: string;
};

/**
 * Handler pour l'API `/api/data_specificities`.
 * Récupère les `specificities` uniques depuis la table `data_globalproduct`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Specificity[] | { error: string }>
) {
  try {
    const query = `
      SELECT DISTINCT specificity
      FROM data_globalproduct
      WHERE specificity IS NOT NULL
      ORDER BY specificity ASC;
    `;

    const result = await pool.query<{ specificity: string }>(query);

    console.log(`Fetched ${result.rows.length} specificities`);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune spécificité trouvée' });
    }

    const specificities: Specificity[] = result.rows.map(row => ({
      specificity: row.specificity,
    }));

    return res.status(200).json(specificities);
  } catch (error) {
    console.error('Erreur lors de la récupération des spécificités depuis la base de données:', error);
    return res.status(500).json({ error: 'Échec de la récupération des spécificités depuis la base de données' });
  }
}
