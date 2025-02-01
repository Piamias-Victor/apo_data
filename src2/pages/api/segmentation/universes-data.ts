import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/fetch/db';
import { Universe } from '@/types/Universe';

/**
 * API pour récupérer les univers, catégories et sous-catégories depuis `data_globalproduct`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Universe[] | { error: string }>
) {
  try {
    // Requête SQL pour récupérer univers, catégories et sous-catégories uniques
    const query = `
      WITH limited_universes AS (
        SELECT DISTINCT universe
        FROM data_globalproduct
        WHERE universe IS NOT NULL
      )
      SELECT
        lu.universe,
        dg.category,
        array_agg(DISTINCT dg.sub_category ORDER BY dg.sub_category) AS sub_categories
      FROM
        limited_universes lu
      JOIN
        data_globalproduct dg
      ON
        lu.universe = dg.universe
      GROUP BY lu.universe, dg.category
      ORDER BY lu.universe ASC, dg.category ASC;
    `;

    const result = await pool.query<{
      universe: string;
      category: string;
      sub_categories: string[];
    }>(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune segmentation trouvée' });
    }

    // Transformer les résultats en un format structuré
    const segmentations: Universe[] = [];

    result.rows.forEach(row => {
      const { universe, category, sub_categories } = row;

      // Trouver l'univers existant ou le créer
      let segmentation = segmentations.find(seg => seg.universe === universe);
      if (!segmentation) {
        segmentation = { universe, categories: [] };
        segmentations.push(segmentation);
      }

      // Ajouter la catégorie et ses sous-catégories
      segmentation.categories.push({
        category,
        sub_categories: sub_categories.map(sub => ({ sub_category: sub }))
      });
    });

    return res.status(200).json(segmentations);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des segmentations:', error);
    return res.status(500).json({ error: 'Échec de la récupération des données' });
  }
}
