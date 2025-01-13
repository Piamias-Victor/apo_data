// /pages/api/sales-daily.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/db';
import { DailySale, DailySaleRaw } from '@/types/Sale';

export interface DailySalesResponse {
  dailySales: DailySale[];
  total: number;
}

/**
 * Endpoint pour récupérer les ventes quotidiennes globales.
 * 
 * Filtres optionnels :
 * - `startDate` (YYYY-MM-DD)
 * - `endDate` (YYYY-MM-DD)
 * - `pharmacyId` (UUID)
 * - `universe` (string)
 * - `category` (string)
 * - `subCategory` (string)
 * - `labDistributor` (string)
 * - `brandLab` (string)
 * - `rangeName` (string)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DailySalesResponse | { error: string }>
) {
  try {
    const { startDate, endDate, pharmacyId, universe, category, subCategory, labDistributor, brandLab, rangeName } = req.query;

    // Connexion à la base de données
    const client = await pool.connect();

    // Construction des conditions
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Filtrage par startDate si fourni, sinon le dernier mois
    if (startDate && typeof startDate === 'string') {
      conditions.push(`s.date >= $${paramIndex}::date`);
      values.push(startDate);
      paramIndex++;
    } else {
      conditions.push(`s.date >= (current_date - INTERVAL '1 month')`);
    }

    // Filtrage par endDate si fourni
    if (endDate && typeof endDate === 'string') {
      conditions.push(`s.date <= $${paramIndex}::date`);
      values.push(endDate);
      paramIndex++;
    }

    // Ajout des filtres supplémentaires similaires à /api/sales.ts
    const filterConditions: Record<string, string> = {
      pharmacyId: "ip.pharmacy_id = $${paramIndex}::uuid",
      universe: "gp.universe ILIKE $${paramIndex}",
      category: "gp.category ILIKE $${paramIndex}",
      subCategory: "gp.sub_category ILIKE $${paramIndex}",
      labDistributor: "gp.lab_distributor ILIKE $${paramIndex}",
      brandLab: "gp.brand_lab ILIKE $${paramIndex}",
      rangeName: "gp.range_name ILIKE $${paramIndex}",
    };

    const filterValues: Record<string, string | undefined> = {
      pharmacyId: pharmacyId && typeof pharmacyId === 'string' ? pharmacyId : undefined,
      universe: universe && typeof universe === 'string' ? universe : undefined,
      category: category && typeof category === 'string' ? category : undefined,
      subCategory: subCategory && typeof subCategory === 'string' ? subCategory : undefined,
      labDistributor: labDistributor && typeof labDistributor === 'string' ? labDistributor : undefined,
      brandLab: brandLab && typeof brandLab === 'string' ? brandLab : undefined,
      rangeName: rangeName && typeof rangeName === 'string' ? rangeName : undefined,
    };

    for (const [key, condition] of Object.entries(filterConditions)) {
      const value = filterValues[key as keyof typeof filterValues];
      if (value) {
        conditions.push(condition.replace('${paramIndex}', `${paramIndex}`));
        values.push(value);
        paramIndex++;
      }
    }

    // Construction de la clause WHERE
    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    // Requête SQL pour agrégations quotidiennes globales avec filtres supplémentaires
    const dailySalesQuery = `
      SELECT
        s.date AS date,
        SUM(s.quantity) AS total_quantity,
        SUM(s.quantity * i.price_with_tax) AS total_sales,
        SUM(s.quantity * i.weighted_average_price) AS total_cost
      FROM data_sales s
      JOIN data_inventorysnapshot i ON s.product_id = i.id
      JOIN data_internalproduct ip ON i.product_id = ip.id
      JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause}
      GROUP BY s.date
      ORDER BY s.date ASC
    `;

    const dailySalesResult = await client.query<DailySaleRaw>(dailySalesQuery, values);

    // Convertir les champs numériques de chaînes de caractères en nombres
    const dailySales: DailySale[] = dailySalesResult.rows.map(row => ({
      date: row.date,
      total_quantity: parseInt(row.total_quantity, 10),
      total_sales: parseFloat(row.total_sales),
      total_cost: parseFloat(row.total_cost),
    }));

    // Calcul du total des enregistrements
    const total = dailySales.length;

    client.release();

    // Réponse JSON
    res.status(200).json({
      dailySales,
      total,
    });
  } catch (error) {
    console.error('❌ Erreur API sales-daily:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
