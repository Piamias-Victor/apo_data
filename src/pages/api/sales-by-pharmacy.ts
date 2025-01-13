// /pages/api/sales-by-pharmacy.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/db';
import { GroupedSaleByPharmacy, GroupedSaleByPharmacyRaw } from '@/types/Sale';

export interface GroupedSalesByPharmacyResponse {
  groupedSales: GroupedSaleByPharmacy[];
  total: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GroupedSalesByPharmacyResponse | { error: string }>
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

    // 1) Calcul du total distinct des pharmacies
    const totalQuery = `
      SELECT COUNT(DISTINCT ip.pharmacy_id) AS count
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

    // 2) Récupérer toutes les ventes groupées par pharmacy_id
    const groupedSalesQuery = `
      SELECT 
        ip.pharmacy_id AS pharmacy_id,
        p.name AS pharmacy_name, -- Ajouté pour récupérer le nom de la pharmacie
        SUM(s.quantity) AS total_quantity,
        COALESCE(AVG(i.price_with_tax), 0) AS avg_price_with_tax,
        COALESCE(AVG(i.weighted_average_price), 0) AS avg_weighted_average_price,
        COALESCE(MIN(gp.tva_percentage), 0) AS tva  -- Correction ici pour utiliser tva_percentage
      FROM data_sales s
      JOIN data_inventorysnapshot i
        ON s.product_id = i.id
      JOIN data_internalproduct ip
        ON i.product_id = ip.id
      JOIN data_globalproduct gp
        ON ip.code_13_ref_id = gp.code_13_ref
      LEFT JOIN data_pharmacy p
        ON ip.pharmacy_id = p.id
      ${whereClause}
      GROUP BY ip.pharmacy_id, p.name
      ORDER BY SUM(s.quantity) DESC
    `;
    const groupedSalesResult = await client.query<GroupedSaleByPharmacyRaw>(groupedSalesQuery, values);

    // Convertir les champs numériques de chaînes de caractères en nombres
    const groupedSales: GroupedSaleByPharmacy[] = groupedSalesResult.rows.map(row => ({
      pharmacy_id: row.pharmacy_id,
      pharmacy_name: row.pharmacy_name || `Pharmacy ${row.pharmacy_id}`,
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
    console.error('❌ Erreur API sales-by-pharmacy:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
