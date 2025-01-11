// /pages/api/sales
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/db';
import { GroupedSale } from '@/types/Sale';

export interface GroupedSalesResponse {
  groupedSales: GroupedSale[];
  total: number;
}

/**
 * Endpoint pour récupérer TOUTES les ventes du dernier mois (colonne `data_sales.date`),
 * groupées par code_13_ref, sans pagination.
 * 
 * Si `gp.name` == 'Default Name', on prend le *premier* ip.name trouvé 
 * (en pratique, `MIN(ip.name)` en ordre alphabétique).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GroupedSalesResponse | { error: string }>
) {
  try {
    const client = await pool.connect();

    // On récupère les ventes du dernier mois
    const whereClause = `
      WHERE s.date >= (current_date - INTERVAL '1 month')
    `;

    // 1) Calcul du total de codes distincts
    const totalQuery = `
      SELECT COUNT(DISTINCT gp.code_13_ref) AS count
      FROM data_sales s
      JOIN data_inventorysnapshot i ON s.product_id = i.id
      LEFT JOIN data_internalproduct ip ON i.product_id = ip.id
      INNER JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause}
    `;
    const totalResult = await client.query<{ count: string }>(totalQuery);
    const total = parseInt(totalResult.rows[0]?.count || '0', 10);

    // 2) Requête pour récupérer toutes les ventes groupées
    //    On utilise MIN(ip.name) pour "agréger" ip.name 
    //    et éviter le GROUP BY ip.name.
    //    Ainsi, si gp.name == 'Default Name', on prend MIN(ip.name).
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

          /* Logique pour le "name":
             1) NULLIF(gp.name, 'Default Name') => NULL si gp.name == 'Default Name'
             2) Sinon MIN(ip.name) => la valeur agrégée, 
                                     ce qui évite la clause GROUP BY sur ip.name
             3) 'N/A' en fallback final */
          COALESCE(
            NULLIF(gp.name, 'Default Name'), 
            MIN(ip.name),          
            'N/A'
          ) AS name,

          SUM(s.quantity) AS total_quantity,
          COALESCE(AVG(i.price_with_tax), 0) AS avg_price_with_tax,
          COALESCE(AVG(i.weighted_average_price), 0) AS avg_weighted_average_price

      FROM data_sales s
      JOIN data_inventorysnapshot i ON s.product_id = i.id
      LEFT JOIN data_internalproduct ip ON i.product_id = ip.id
      INNER JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause}
      GROUP BY gp.code_13_ref
      ORDER BY SUM(s.quantity) DESC
    `;

    const groupedSalesResult = await client.query<GroupedSale>(groupedSalesQuery);

    client.release();

    // 3) On renvoie la réponse
    res.status(200).json({
      groupedSales: groupedSalesResult.rows,
      total,
    });
  } catch (error) {
    console.error('❌ Erreur API sales:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
