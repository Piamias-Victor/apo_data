// src/pages/api/data_segmentation.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/libs/db";
import { Segmentation } from '@/types/Segmentation';

/**
 * Handler pour l'API `/api/data_segmentation`.
 * Récupère les segmentations uniques avec leurs catégories et sous-catégories depuis la table `data_globalproduct`.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Segmentation[] | { error: string }>
) {
  try {
    // Requête SQL pour récupérer les univers, catégories et sous-catégories uniques
    const query = `
      WITH limited_universes AS (
        SELECT universe
        FROM data_globalproduct
        GROUP BY universe
        ORDER BY universe ASC
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
      GROUP BY
        lu.universe,
        dg.category
      ORDER BY
        lu.universe ASC,
        dg.category ASC;
    `;

    const result = await pool.query<{
      universe: string;
      category: string;
      sub_categories: string[];
    }>(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune segmentation avec catégories trouvée' });
    }

    // Transformer les données en type Segmentation
    const segmentationsMap: { [universe: string]: Segmentation } = {};

    result.rows.forEach(row => {
      const { universe, category, sub_categories } = row;

      if (!segmentationsMap[universe]) {
        segmentationsMap[universe] = {
          universe,
          categories: []
        };
      }

      const segmentation = segmentationsMap[universe];

      // Vérifie si la catégorie existe déjà
      const existingCategory = segmentation.categories.find(cat => cat.category === category);

      if (existingCategory) {
        // Ajoute les sous-catégories à la catégorie existante
        existingCategory.sub_categories.push(...sub_categories.map(sub => ({ sub_category: sub })));
      } else {
        // Ajoute une nouvelle catégorie avec ses sous-catégories
        segmentation.categories.push({
          category,
          sub_categories: sub_categories.map(sub => ({ sub_category: sub })),
        });
      }
    });

    // Convertir le map en tableau
    const segmentations: Segmentation[] = Object.values(segmentationsMap);

    return res.status(200).json(segmentations);
  } catch (error) {
    console.error('Erreur lors de la récupération des segmentations depuis la base de données:', error);
    return res.status(500).json({ error: 'Échec de la récupération des données depuis la base de données' });
  }
}
