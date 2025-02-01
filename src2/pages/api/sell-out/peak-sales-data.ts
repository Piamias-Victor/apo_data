import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface PeakSalesResponse {
  peakSales: {
    date: string;
    product: string;
    code: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PeakSalesResponse | { error: string }>
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
    } = req.query;

    const whereClauses: string[] = ["s.quantity > 0"];
    const values: any[] = [];
    let paramIndex = 1;

    // Application des filtres
    if (pharmacy) {
      const pharmacyArray = Array.isArray(pharmacy) ? pharmacy : pharmacy.split(",");
      whereClauses.push(`ip.pharmacy_id = ANY($${paramIndex}::uuid[])`);
      values.push(pharmacyArray);
      paramIndex++;
    }
    if (universe) {
      const universeArray = Array.isArray(universe) ? universe : universe.split(",");
      whereClauses.push(`gp.universe = ANY($${paramIndex}::text[])`);
      values.push(universeArray);
      paramIndex++;
    }
    if (category) {
      const categoryArray = Array.isArray(category) ? category : category.split(",");
      whereClauses.push(`gp.category = ANY($${paramIndex}::text[])`);
      values.push(categoryArray);
      paramIndex++;
    }
    if (subCategory) {
      const subCategoryArray = Array.isArray(subCategory) ? subCategory : subCategory.split(",");
      whereClauses.push(`gp.sub_category = ANY($${paramIndex}::text[])`);
      values.push(subCategoryArray);
      paramIndex++;
    }
    if (labDistributor) {
      const labDistributorArray = Array.isArray(labDistributor) ? labDistributor : labDistributor.split(",");
      whereClauses.push(`gp.lab_distributor = ANY($${paramIndex}::text[])`);
      values.push(labDistributorArray);
      paramIndex++;
    }
    if (brandLab) {
      const brandLabArray = Array.isArray(brandLab) ? brandLab : brandLab.split(",");
      whereClauses.push(`gp.brand_lab = ANY($${paramIndex}::text[])`);
      values.push(brandLabArray);
      paramIndex++;
    }
    if (rangeName) {
      const rangeNameArray = Array.isArray(rangeName) ? rangeName : rangeName.split(",");
      whereClauses.push(`gp.range_name = ANY($${paramIndex}::text[])`);
      values.push(rangeNameArray);
      paramIndex++;
    }
    if (product) {
      const productArray = Array.isArray(product) ? product : product.split(",");
      whereClauses.push(`gp.code_13_ref = ANY($${paramIndex}::text[])`);
      values.push(productArray);
      paramIndex++;
    }
    if (startDate) {
      whereClauses.push(`s.date >= $${paramIndex}::date`);
      values.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClauses.push(`s.date <= $${paramIndex}::date`);
      values.push(endDate);
      paramIndex++;
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Requête SQL pour analyser les pics de vente par produit
    const query = `
      WITH sales_data AS (
        SELECT
          s.date,
          CASE 
            WHEN gp.name = 'Default Name' THEN 
              (SELECT ip.name FROM data_internalproduct ip WHERE ip.code_13_ref_id = gp.code_13_ref LIMIT 1)
            ELSE gp.name
          END AS product,
          gp.code_13_ref AS code,
          SUM(s.quantity) AS total_quantity,
          SUM(s.quantity * COALESCE(i.price_with_tax, 0)) AS total_revenue
        FROM data_sales s
        JOIN data_inventorysnapshot i ON s.product_id = i.id
        JOIN data_internalproduct ip ON i.product_id = ip.id
        JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
        ${whereClause}
        GROUP BY s.date, gp.code_13_ref, gp.name
      )
      SELECT
        date,
        product,
        code,
        total_quantity,
        total_revenue
      FROM sales_data
      ORDER BY total_quantity DESC, total_revenue DESC
      LIMIT 15;
    `;

    const client = await pool.connect();
    const result = await client.query<{
      date: string;
      product: string;
      code: string;
      total_quantity: string;
      total_revenue: string;
    }>(query, values);
    client.release();

    // Formatage des données
    const peakSales = result.rows.map((row) => ({
      date: row.date,
      product: row.product,
      code: row.code,
      totalQuantity: parseInt(row.total_quantity, 10),
      totalRevenue: parseFloat(row.total_revenue),
    }));

    res.status(200).json({ peakSales });
  } catch (error) {
    console.error("Erreur lors de l'analyse des périodes de pics de vente :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}