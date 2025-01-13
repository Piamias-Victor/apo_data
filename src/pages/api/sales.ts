// /pages/api/sales.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/db';
import { GroupedSaleRaw } from '@/types/Sale';

export interface GroupedSalesResponse {
  groupedSales: GroupedSaleRaw[];
  total: number;
}

/**
 * Endpoint pour récupérer TOUTES les ventes du dernier mois,
 * groupées par code_13_ref, SANS pagination.
 * 
 * Filtres optionnels :
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
  res: NextApiResponse<GroupedSalesResponse | { error: string }>
) {
  try {
    const { 
      pharmacyId, 
      universe, 
      category, 
      subCategory, 
      labDistributor, 
      brandLab, 
      rangeName 
    } = req.query;

    // Connexion à la base de données
    const client = await pool.connect();

    // Conditions de base : ventes du dernier mois et produits de parapharmacie
    const conditions: string[] = [
      "s.date >= (current_date - INTERVAL '1 month')",
      "gp.name != 'Default Name'"  // Exclure les produits non parapharmaceutiques
    ];
    const values: any[] = [];
    let paramIndex = 1;

    // Filtrage par pharmacyId si fourni
    if (pharmacyId) {
      if (typeof pharmacyId !== 'string') {
        throw new Error('pharmacyId must be a string');
      }
      conditions.push(`ip.pharmacy_id = $${paramIndex}::uuid`);
      values.push(pharmacyId);
      paramIndex++;
    }

    // Filtrage par universe si fourni
    if (universe) {
      if (typeof universe !== 'string') {
        throw new Error('universe must be a string');
      }
      conditions.push(`gp.universe ILIKE $${paramIndex}`);
      values.push(universe);
      paramIndex++;
    }

    // Filtrage par category si fourni
    if (category) {
      if (typeof category !== 'string') {
        throw new Error('category must be a string');
      }
      conditions.push(`gp.category ILIKE $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    // Filtrage par subCategory si fourni
    if (subCategory) {
      if (typeof subCategory !== 'string') {
        throw new Error('subCategory must be a string');
      }
      conditions.push(`gp.sub_category ILIKE $${paramIndex}`);
      values.push(subCategory);
      paramIndex++;
    }

    // Filtrage par labDistributor si fourni
    if (labDistributor) {
      if (typeof labDistributor !== 'string') {
        throw new Error('labDistributor must be a string');
      }
      conditions.push(`gp.lab_distributor ILIKE $${paramIndex}`);
      values.push(labDistributor);
      paramIndex++;
    }

    // Filtrage par brandLab si fourni
    if (brandLab) {
      if (typeof brandLab !== 'string') {
        throw new Error('brandLab must be a string');
      }
      conditions.push(`gp.brand_lab ILIKE $${paramIndex}`);
      values.push(brandLab);
      paramIndex++;
    }

    // Filtrage par rangeName si fourni
    if (rangeName) {
      if (typeof rangeName !== 'string') {
        throw new Error('rangeName must be a string');
      }
      conditions.push(`gp.range_name ILIKE $${paramIndex}`);
      values.push(rangeName);
      paramIndex++;
    }

    // Construction de la clause WHERE
    const whereClause = "WHERE " + conditions.join(" AND ");

    // 1) Calcul du total distinct
    const totalQuery = `
      SELECT COUNT(DISTINCT gp.code_13_ref) AS count
      FROM data_sales s
      JOIN data_inventorysnapshot i
        ON s.product_id = i.id
      JOIN data_internalproduct ip
        ON i.product_id = ip.id
      JOIN data_globalproduct gp
        ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause}
    `;
    const totalResult = await client.query<{ count: string }>(totalQuery, values);
    const total = parseInt(totalResult.rows[0]?.count || '0', 10);

    // 2) Récupérer toutes les ventes groupées
    const groupedSalesQuery = `
      SELECT 
        gp.code_13_ref AS code_13_ref,
        COALESCE(gp.universe, 'N/A') AS universe,
        COALESCE(gp.category, 'N/A') AS category,
        COALESCE(gp.sub_category, 'N/A') AS sub_category,
        COALESCE(gp.brand_lab, 'N/A') AS brand_lab,
        COALESCE(gp.lab_distributor, 'N/A') AS lab_distributor,
        COALESCE(gp.range_name, 'N/A') AS range_name,
        COALESCE(gp.family, 'N/A') AS family,
        COALESCE(gp.sub_family, 'N/A') AS sub_family,
        COALESCE(gp.specificity, 'N/A') AS specificity,
        COALESCE(
          NULLIF(gp.name, 'Default Name'), 
          MIN(ip.name),
          'N/A'
        ) AS name,

        SUM(s.quantity) AS total_quantity,
        COALESCE(AVG(i.price_with_tax), 0) AS avg_price_with_tax,
        COALESCE(AVG(i.weighted_average_price), 0) AS avg_weighted_average_price,
        COALESCE(MIN(gp.tva_percentage), 0) AS tva  -- Ajout de la TVA

      FROM data_sales s
      JOIN data_inventorysnapshot i
        ON s.product_id = i.id
      JOIN data_internalproduct ip
        ON i.product_id = ip.id
      JOIN data_globalproduct gp
        ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause}
      GROUP BY gp.code_13_ref
      ORDER BY SUM(s.quantity) DESC
    `;
    const groupedSalesResult = await client.query<GroupedSaleRaw>(groupedSalesQuery, values);

    // Convertir les champs numériques de chaînes de caractères en nombres
    const groupedSales: any[] = groupedSalesResult.rows.map(row => ({
      ...row,
      total_quantity: parseFloat(row.total_quantity),
      avg_price_with_tax: parseFloat(row.avg_price_with_tax),
      avg_weighted_average_price: parseFloat(row.avg_weighted_average_price),
      tva: parseFloat(row.tva),
    }));

    client.release();

    // Réponse JSON
    res.status(200).json({
      groupedSales,
      total,
    });
  } catch (error) {
    console.error('❌ Erreur API sales:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
