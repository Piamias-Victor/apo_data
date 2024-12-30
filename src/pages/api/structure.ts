// src/pages/api/structure.ts

import pool from '@/libs/db';
import { TableStructure } from '@/types/Structure';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Handler pour l'API `/api/structure`.
 * 
 * Récupère la structure de la base de données en listant les tables et leurs colonnes.
 * 
 * @param req - Objet NextApiRequest contenant les détails de la requête HTTP.
 * @param res - Objet NextApiResponse utilisé pour renvoyer la réponse HTTP.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TableStructure | { error: string }>
) {
  try {
    const query = `
      SELECT
        t.table_name,
        c.column_name,
        c.data_type,
        c.character_maximum_length,
        c.is_nullable
      FROM information_schema.tables t
      JOIN information_schema.columns c
        ON t.table_name = c.table_name
      WHERE t.table_type = 'BASE TABLE'
        AND t.table_schema = 'public'
      ORDER BY t.table_name, c.ordinal_position
    `;

    const result = await pool.query(query);

    // Regroupement des colonnes par table_name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const structureByTable: TableStructure = result.rows.reduce((acc: TableStructure, row: any) => {
      const { table_name, column_name, data_type, character_maximum_length, is_nullable } = row;
      if (!acc[table_name]) {
        acc[table_name] = [];
      }

      acc[table_name].push({
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      });

      return acc;
    }, {});

    res.status(200).json(structureByTable);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch database structure' });
  }
}
