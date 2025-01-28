// src/pages/api/sell-out/sales-with-negative-margin-data.ts

import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface NegativeMarginResponse {
  products: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
    margin: number;
    averageSellingPrice: number;
    averagePurchasePrice: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NegativeMarginResponse | { error: string }>
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

    const whereClauses: string[] = ["s.quantity > 0"];
    const values: any[] = [];
    let paramIndex = 1;

    // Filtres dynamiques
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

    // Conditions spécifiques basées sur `selectedCategory`
    if (selectedCategory === "medicaments") {
      whereClauses.push(`ip.code_13_ref_id LIKE '34009%'`);
    } else if (selectedCategory === "parapharmacie") {
      whereClauses.push(`ip.code_13_ref_id NOT LIKE '34009%'`);
    }

    // Combiner les clauses WHERE
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Requête SQL pour les produits avec marges négatives
    const query = `
      SELECT 
        gp.code_13_ref AS product_id,
        CASE 
          WHEN gp.name <> 'Default Name' THEN gp.name 
          ELSE (
            SELECT ip.name 
            FROM data_internalproduct ip 
            WHERE ip.code_13_ref_id = gp.code_13_ref 
            LIMIT 1
          )
        END AS product_name,
        SUM(s.quantity) AS quantity,
        SUM(s.quantity * COALESCE(i.price_with_tax, 0)) AS revenue,
        SUM(
          s.quantity * (
            COALESCE(i.price_with_tax, 0) / (1 + COALESCE(ip."TVA", 0) / 100) 
            - COALESCE(i.weighted_average_price, 0)
          )
        ) AS margin,
        SUM(s.quantity * COALESCE(i.price_with_tax, 0)) / NULLIF(SUM(s.quantity), 0) AS average_selling_price,
        SUM(s.quantity * COALESCE(i.weighted_average_price, 0)) / NULLIF(SUM(s.quantity), 0) AS average_purchase_price
      FROM data_sales s
      JOIN data_inventorysnapshot i ON s.product_id = i.id
      JOIN data_internalproduct ip ON i.product_id = ip.id
      JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause}
      GROUP BY gp.code_13_ref, gp.name
      HAVING SUM(
        s.quantity * (
          COALESCE(i.price_with_tax, 0) / (1 + COALESCE(ip."TVA", 0) / 100) 
          - COALESCE(i.weighted_average_price, 0)
        )
      ) < 0
      ORDER BY margin ASC;
    `;

    const client = await pool.connect();
    const result = await client.query<{
      product_id: string;
      product_name: string;
      quantity: string;
      revenue: string;
      margin: string;
      average_selling_price: string;
      average_purchase_price: string;
    }>(query, values);
    client.release();

    const products = result.rows.map((row) => ({
      productId: row.product_id || "Inconnu",
      productName: row.product_name || "Inconnu",
      quantity: parseInt(row.quantity, 10),
      revenue: parseFloat(row.revenue),
      margin: parseFloat(row.margin),
      averageSellingPrice: parseFloat(row.average_selling_price),
      averagePurchasePrice: parseFloat(row.average_purchase_price),
    }));

    res.status(200).json({ products });
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes avec marges négatives :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}