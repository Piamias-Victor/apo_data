import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/db";

interface StockDataResponse {
  stockValue: number;
  soldReferencesCount: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StockDataResponse | { error: string }>
) {
  try {
    const {
      pharmacy,
      universe,
      category,
      subCategory,
      labDistributor,
      brandLab,
      rangeName,
      product,
      startDate,
      endDate,
      selectedCategory, // Nouveau filtre
    } = req.query;

    // Clauses WHERE dynamiques
    const soldWhereClauses: string[] = ["s.quantity > 0", "ip.code_13_ref_id IS NOT NULL"];
    const inventoryWhereClauses: string[] = ["i.stock > 0"];
    const values: any[] = [];
    let paramIndex = 1;

    // Application des filtres dynamiques
    if (startDate) {
      soldWhereClauses.push(`s.date >= $${paramIndex}::date`);
      inventoryWhereClauses.push(`i.date >= $${paramIndex}::date`);
      values.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      soldWhereClauses.push(`s.date <= $${paramIndex}::date`);
      inventoryWhereClauses.push(`i.date <= $${paramIndex}::date`);
      values.push(endDate);
      paramIndex++;
    }
    if (pharmacy) {
      soldWhereClauses.push(`ip.pharmacy_id = $${paramIndex}::uuid`);
      inventoryWhereClauses.push(`ip.pharmacy_id = $${paramIndex}::uuid`);
      values.push(pharmacy);
      paramIndex++;
    }
    if (universe) {
      soldWhereClauses.push(`gp.universe ILIKE $${paramIndex}`);
      inventoryWhereClauses.push(`gp.universe ILIKE $${paramIndex}`);
      values.push(`%${universe}%`);
      paramIndex++;
    }
    if (category) {
      soldWhereClauses.push(`gp.category ILIKE $${paramIndex}`);
      inventoryWhereClauses.push(`gp.category ILIKE $${paramIndex}`);
      values.push(`%${category}%`);
      paramIndex++;
    }
    if (subCategory) {
      soldWhereClauses.push(`gp.sub_category ILIKE $${paramIndex}`);
      inventoryWhereClauses.push(`gp.sub_category ILIKE $${paramIndex}`);
      values.push(`%${subCategory}%`);
      paramIndex++;
    }
    if (labDistributor) {
      soldWhereClauses.push(`gp.lab_distributor ILIKE $${paramIndex}`);
      inventoryWhereClauses.push(`gp.lab_distributor ILIKE $${paramIndex}`);
      values.push(`%${labDistributor}%`);
      paramIndex++;
    }
    if (brandLab) {
      soldWhereClauses.push(`gp.brand_lab ILIKE $${paramIndex}`);
      inventoryWhereClauses.push(`gp.brand_lab ILIKE $${paramIndex}`);
      values.push(`%${brandLab}%`);
      paramIndex++;
    }
    if (rangeName) {
      soldWhereClauses.push(`gp.range_name ILIKE $${paramIndex}`);
      inventoryWhereClauses.push(`gp.range_name ILIKE $${paramIndex}`);
      values.push(`%${rangeName}%`);
      paramIndex++;
    }
    if (product) {
      soldWhereClauses.push(`gp.code_13_ref = $${paramIndex}`);
      inventoryWhereClauses.push(`gp.code_13_ref = $${paramIndex}`);
      values.push(product);
      paramIndex++;
    }

    // Gestion des catégories
    if (selectedCategory === "medicaments") {
      soldWhereClauses.push(`gp.code_13_ref LIKE '34009%'`);
      inventoryWhereClauses.push(`gp.code_13_ref LIKE '34009%'`);
    } else if (selectedCategory === "parapharmacie") {
      soldWhereClauses.push(`gp.code_13_ref NOT LIKE '34009%'`);
      inventoryWhereClauses.push(`gp.code_13_ref NOT LIKE '34009%'`);
    }

    // Combiner les clauses WHERE
    const soldWhereClause =
      soldWhereClauses.length > 0 ? `WHERE ${soldWhereClauses.join(" AND ")}` : "";
    const inventoryWhereClause =
      inventoryWhereClauses.length > 0 ? `WHERE ${inventoryWhereClauses.join(" AND ")}` : "";

    // Requête pour stockValue
    const queryStockValue = `
      SELECT 
        SUM(latest.stock * latest.weighted_average_price) AS stockValue
      FROM (
        SELECT DISTINCT ON (i.product_id)
          i.product_id,
          i.stock,
          i.weighted_average_price,
          i.date
        FROM data_inventorysnapshot i
        JOIN data_internalproduct ip ON i.product_id = ip.id
        JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
        ${inventoryWhereClause}
        ORDER BY i.product_id, i.date DESC
      ) AS latest
    `;

    // Requête pour soldReferencesCount
    const querySoldReferencesCount = `
      SELECT 
        COUNT(DISTINCT ip.code_13_ref_id) AS soldReferencesCount
      FROM data_sales s
      JOIN data_inventorysnapshot i ON s.product_id = i.id
      JOIN data_internalproduct ip ON i.product_id = ip.id
      JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      ${soldWhereClause}
    `;

    const client = await pool.connect();

    // Exécution des requêtes
    const [stockValueResult, soldReferencesResult] = await Promise.all([
      client.query<{ stockvalue: string }>(queryStockValue, values),
      client.query<{ soldreferencescount: string }>(querySoldReferencesCount, values),
    ]);

    client.release();

    const stockValue = parseFloat(stockValueResult.rows[0]?.stockvalue || "0");
    const soldReferencesCount = parseInt(soldReferencesResult.rows[0]?.soldreferencescount || "0", 10);

    res.status(200).json({
      stockValue,
      soldReferencesCount,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données de stock :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
