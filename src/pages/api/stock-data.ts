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
      selectedCategory,
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
      const pharmacyArray = Array.isArray(pharmacy) ? pharmacy : pharmacy.split(",");
      soldWhereClauses.push(`ip.pharmacy_id = ANY($${paramIndex}::uuid[])`);
      inventoryWhereClauses.push(`ip.pharmacy_id = ANY($${paramIndex}::uuid[])`);
      values.push(pharmacyArray);
      paramIndex++;
    }
    if (universe) {
      const universeArray = Array.isArray(universe) ? universe : universe.split(",");
      soldWhereClauses.push(`gp.universe = ANY($${paramIndex}::text[])`);
      inventoryWhereClauses.push(`gp.universe = ANY($${paramIndex}::text[])`);
      values.push(universeArray);
      paramIndex++;
    }
    if (category) {
      const categoryArray = Array.isArray(category) ? category : category.split(",");
      soldWhereClauses.push(`gp.category = ANY($${paramIndex}::text[])`);
      inventoryWhereClauses.push(`gp.category = ANY($${paramIndex}::text[])`);
      values.push(categoryArray);
      paramIndex++;
    }
    if (subCategory) {
      const subCategoryArray = Array.isArray(subCategory) ? subCategory : subCategory.split(",");
      soldWhereClauses.push(`gp.sub_category = ANY($${paramIndex}::text[])`);
      inventoryWhereClauses.push(`gp.sub_category = ANY($${paramIndex}::text[])`);
      values.push(subCategoryArray);
      paramIndex++;
    }
    if (labDistributor) {
      const labDistributorArray = Array.isArray(labDistributor)
        ? labDistributor
        : labDistributor.split(",");
      soldWhereClauses.push(`gp.lab_distributor = ANY($${paramIndex}::text[])`);
      inventoryWhereClauses.push(`gp.lab_distributor = ANY($${paramIndex}::text[])`);
      values.push(labDistributorArray);
      paramIndex++;
    }
    if (brandLab) {
      const brandLabArray = Array.isArray(brandLab) ? brandLab : brandLab.split(",");
      soldWhereClauses.push(`gp.brand_lab = ANY($${paramIndex}::text[])`);
      inventoryWhereClauses.push(`gp.brand_lab = ANY($${paramIndex}::text[])`);
      values.push(brandLabArray);
      paramIndex++;
    }
    if (rangeName) {
      const rangeNameArray = Array.isArray(rangeName) ? rangeName : rangeName.split(",");
      soldWhereClauses.push(`gp.range_name = ANY($${paramIndex}::text[])`);
      inventoryWhereClauses.push(`gp.range_name = ANY($${paramIndex}::text[])`);
      values.push(rangeNameArray);
      paramIndex++;
    }
    if (product) {
      const productArray = Array.isArray(product) ? product : product.split(",");
      soldWhereClauses.push(`gp.code_13_ref = ANY($${paramIndex}::text[])`);
      inventoryWhereClauses.push(`gp.code_13_ref = ANY($${paramIndex}::text[])`);
      values.push(productArray);
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
