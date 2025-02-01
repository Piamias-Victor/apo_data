import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface LowSalesProductsResponse {
  lowSalesProducts: {
    name: string;
    code: string;
    stock: number;
    quantitySold: number;
    revenue: number;
    margin: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LowSalesProductsResponse | { error: string }>
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
      minSalesThreshold = 1, // Par défaut, affiche les produits vendus moins que cette valeur
    } = req.query;

    const whereClauses: string[] = ["i.stock > 0", "gp.name != 'Default Name'"]; // Exclure les stocks négatifs et les produits avec le nom "Default Name"
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
      const labDistributorArray = Array.isArray(labDistributor)
        ? labDistributor
        : labDistributor.split(",");
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

    // Requête SQL mise à jour pour exclure les produits avec quantity_sold < 0
    const query = `
      WITH product_data AS (
        SELECT
          ip.name,
          gp.code_13_ref AS code,
          i.stock,
          SUM(s.quantity) AS quantity_sold,
          SUM(s.quantity * COALESCE(i.price_with_tax, 0)) AS revenue,
          SUM(
            s.quantity * (
              COALESCE(i.price_with_tax, 0) / (1 + COALESCE(ip."TVA", 0) / 100)
              - COALESCE(i.weighted_average_price, 0)
            )
          ) AS margin
        FROM data_inventorysnapshot i
        LEFT JOIN data_sales s ON s.product_id = i.id
        JOIN data_internalproduct ip ON i.product_id = ip.id
        JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
        ${whereClause}
        GROUP BY ip.name, gp.code_13_ref, i.stock
      )
      SELECT
        name,
        code,
        stock,
        quantity_sold,
        revenue,
        margin
      FROM product_data
      WHERE quantity_sold < $${paramIndex} -- Filtre par seuil de ventes
      AND quantity_sold >= 0 -- Exclure les ventes négatives
      ORDER BY stock DESC -- Trier par stock décroissant
      LIMIT 20; -- Limiter à 100 produits
    `;

    values.push(minSalesThreshold);

    const client = await pool.connect();
    const result = await client.query<{
      name: string;
      code: string;
      stock: string;
      quantity_sold: string;
      revenue: string;
      margin: string;
    }>(query, values);
    client.release();

    // Formatage des données
    const lowSalesProducts = result.rows.map((row) => ({
      name: row.name,
      code: row.code,
      stock: parseInt(row.stock, 10),
      quantitySold: parseInt(row.quantity_sold, 10),
      revenue: parseFloat(row.revenue),
      margin: parseFloat(row.margin),
    }));

    res.status(200).json({ lowSalesProducts });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits à faibles ventes :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}