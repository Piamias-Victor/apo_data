import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

/** Interface de la réponse */
interface GrowthPurchasesUniversesResponse {
  growthPurchasesUniverses: {
    universe: string;
    growthRate: number;        // Évolution du prix d'achat moyen
    currentAvgPrice: number;   // Prix d'achat moyen actuel
    previousAvgPrice: number;  // Prix d'achat moyen précédent
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GrowthPurchasesUniversesResponse | { error: string }>
) {
  try {
    const { pharmacy, universe, category, subCategory, labDistributor, brandLab, rangeName, product } = req.query;

    const whereClauses: string[] = ["po.qte > 0"];
    const values: any[] = [];
    let paramIndex = 1;

    if (pharmacy) {
      const pharmacyArray = Array.isArray(pharmacy) ? pharmacy : pharmacy.split(",");
      whereClauses.push(`o.pharmacy_id = ANY($${paramIndex}::uuid[])`);
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

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const now = new Date();
    const startLast6Months = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split("T")[0];
    const endLast6Months = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
    const startPrevious6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split("T")[0];
    const endPrevious6Months = new Date(now.getFullYear(), now.getMonth() - 3, 0).toISOString().split("T")[0];

    values.push(startPrevious6Months, endPrevious6Months, startLast6Months, endLast6Months);

    const query = `
      WITH purchases_growth AS (
        SELECT
          gp.universe AS universe,
          AVG(
            CASE
              WHEN o.delivery_date BETWEEN $${paramIndex} AND $${paramIndex + 1}
              THEN COALESCE(inv.weighted_average_price, last_known_price.price)
              ELSE NULL
            END
          ) AS previous_avg_price,
          AVG(
            CASE
              WHEN o.delivery_date BETWEEN $${paramIndex + 2} AND $${paramIndex + 3}
              THEN COALESCE(inv.weighted_average_price, last_known_price.price)
              ELSE NULL
            END
          ) AS current_avg_price
        FROM data_order o
        JOIN data_productorder po ON o.id = po.order_id
        JOIN data_internalproduct ip ON po.product_id = ip.id
        JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
        LEFT JOIN data_inventorysnapshot inv 
          ON ip.id = inv.product_id 
          AND inv.date = (
            SELECT MAX(date) 
            FROM data_inventorysnapshot 
            WHERE product_id = ip.id AND date <= o.delivery_date
          )
        LEFT JOIN LATERAL (
          SELECT weighted_average_price AS price
          FROM data_inventorysnapshot
          WHERE product_id = ip.id
          ORDER BY date DESC
          LIMIT 1
        ) last_known_price ON TRUE
        ${whereClause}
        GROUP BY gp.universe
      )
      SELECT
        universe,
        previous_avg_price,
        current_avg_price,
        COALESCE(
          (
            (current_avg_price - previous_avg_price) / NULLIF(previous_avg_price, 0) * 100
          ),
          0
        ) AS growth_rate
      FROM purchases_growth
      WHERE current_avg_price IS NOT NULL
      ORDER BY growth_rate DESC;
    `;

    const client = await pool.connect();
    const result = await client.query<{
      universe: string;
      previous_avg_price: string;
      current_avg_price: string;
      growth_rate: string;
    }>(query, values);
    client.release();

    const growthPurchasesUniverses = result.rows.map((row) => ({
      universe: row.universe ?? "Inconnu",
      growthRate: parseFloat(row.growth_rate),
      previousAvgPrice: parseFloat(row.previous_avg_price),
      currentAvgPrice: parseFloat(row.current_avg_price),
    }));

    res.status(200).json({ growthPurchasesUniverses });
  } catch (error) {
    console.error("Erreur lors du calcul du prix d'achat moyen par univers :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};