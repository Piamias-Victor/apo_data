import pool from "@/libs/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ plan: string[] } | { error: string }>
) {
  try {
    // Requête avec EXPLAIN ANALYZE
    const query = `
EXPLAIN ANALYSE
SELECT 
    ds.id AS id,
    ds.created_at AS created_at,
    ds.updated_at AS updated_at,
    ds.quantity,
    ds.time,
    ds.operator_code,
    ds.product_id,
    dis.stock,
    dis.price_with_tax,
    dis.weighted_average_price,
    dip.code_13_ref_id AS code13_ref,
    dgp.name,
    dgp.universe,
    dgp.category,
    dgp.sub_category,
    dgp.brand_lab,
    dgp.lab_distributor,
    dgp.range_name,
    dgp.specificity,
    dgp.family,
    dgp.sub_family,
    dgp.tva_percentage
FROM 
    data_sales ds
INNER JOIN 
    data_inventorysnapshot dis
ON 
    ds.product_id = dis.id
INNER JOIN 
    data_internalproduct dip
ON 
    dis.product_id = dip.id
INNER JOIN 
    data_globalproduct dgp
ON 
    dip.code_13_ref_id = dgp.code_13_ref
WHERE 
    dgp.universe IS NOT NULL 
    AND TRIM(dgp.universe) != ''
LIMIT 100 OFFSET 0;
    `;

    const result = await pool.query(query);

    // PostgreSQL retourne un ensemble de lignes, on extrait le plan d'exécution
    return res.status(200).json({
      plan: result.rows.map((row) => Object.values(row)[0] as string),
    });
  } catch (error) {
    console.error("Erreur lors de l'exécution de la requête EXPLAIN ANALYZE:", error);
    return res.status(500).json({ error: "Échec de l'exécution de EXPLAIN ANALYZE." });
  }
}
