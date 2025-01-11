import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/db';
import { GroupedSale } from '@/types/Sale';

/**
 * Type représentant la réponse de l'API des ventes groupées.
 */
export interface GroupedSalesResponse {
  groupedSales: GroupedSale[];
  total: number;
}

/**
 * API route pour récupérer les ventes groupées par code_13_ref avec pagination, tri et filtre par pharmacie.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GroupedSalesResponse | { error: string }>
) {
  const { page = '1', limit = '500', sortBy = 'code_13_ref', sortOrder = 'asc', pharmacyId } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const offset = (pageNumber - 1) * limitNumber;

  // Liste des colonnes autorisées pour le tri
  const sortableFields = [
    'code_13_ref',
    'universe',
    'category',
    'sub_category',
    'brand_lab',
    'lab_distributor',
    'range_name',
    'family',
    'sub_family',
    'specificity',
    'name',
    'total_quantity',
    'avg_price_with_tax',
    'avg_weighted_average_price'
  ];

  // Validation des paramètres de tri
  const sortField = sortableFields.includes(sortBy as string) ? sortBy : 'code_13_ref';
  const order = (sortOrder === 'desc') ? 'DESC' : 'ASC';

  try {
    const client = await pool.connect();

    console.log("📌 Requête API sales :");
    console.log("📌 Paramètres reçus :", { pageNumber, limitNumber, sortField, order, pharmacyId });

    // Construction dynamique du WHERE
    let whereClause = '';
    const params: any[] = [limitNumber, offset];

    if (pharmacyId) {
      whereClause = `WHERE i.pharmacy_id = $3::UUID`;
      params.push(pharmacyId);
    }

    // Obtenir le total des groupes en fonction du filtre pharmacie
    const totalQuery = `
      SELECT COUNT(DISTINCT gp.code_13_ref)
      FROM data_sales s
      JOIN data_inventorysnapshot i ON s.product_id = i.id
      LEFT JOIN data_internalproduct ip ON i.product_id = ip.id
      INNER JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause}
    `;

    const totalResult = await client.query<{ count: string }>(
      totalQuery, 
      params.length === 3 ? [pharmacyId] : []
    );

    const total = parseInt(totalResult.rows[0]?.count || '0', 10);
    console.log("📌 Total des ventes trouvées :", total);

    // Obtenir les ventes groupées avec les détails
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
          COALESCE(gp.name, 'N/A') AS name,
          SUM(s.quantity) AS total_quantity,
          COALESCE(AVG(i.price_with_tax), 0) AS avg_price_with_tax,
          COALESCE(AVG(i.weighted_average_price), 0) AS avg_weighted_average_price
      FROM 
          data_sales s
      JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
      LEFT JOIN 
          data_internalproduct ip ON i.product_id = ip.id
      INNER JOIN 
          data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause}
      GROUP BY gp.code_13_ref
      ORDER BY ${sortField} ${order}
      LIMIT $1 OFFSET $2
    `;

    const groupedSalesResult = await client.query<GroupedSale>(groupedSalesQuery, params);

    client.release();

    res.status(200).json({ groupedSales: groupedSalesResult.rows, total });
  } catch (error) {
    console.error('❌ Erreur API sales:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
