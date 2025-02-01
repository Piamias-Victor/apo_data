import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

/** Interface de la réponse */
interface GrowthPurchasesProductsResponse {
  growthPurchasesProducts: {
    productName: string;
    growthRate: number;
    currentAvgPrice: number;
    previousAvgPrice: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GrowthPurchasesProductsResponse | { error: string }>
) {
  try {
    const { pharmacy, universe, category, subCategory, labDistributor, brandLab, rangeName, product } = req.query;

    const whereClauses: string[] = ["po.qte > 0"];
    const values: any[] = [];
    let paramIndex = 1;

    // 🔹 Ajout des filtres dynamiques
    if (universe) {
      const universeArray = Array.isArray(universe) ? universe : universe.split(",");
      whereClauses.push(`gp.universe = ANY($${paramIndex}::text[])`);
      values.push(universeArray);
      paramIndex++;
    }
    if (pharmacy) {
      const pharmacyArray = Array.isArray(pharmacy) ? pharmacy : pharmacy.split(",");
      whereClauses.push(`o.pharmacy_id = ANY($${paramIndex}::uuid[])`);
      values.push(pharmacyArray);
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

    // 🔹 Définition des périodes de comparaison
    const now = new Date();
    const startLast6Months = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split("T")[0];
    const endLast6Months = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
    const startPrevious6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split("T")[0];
    const endPrevious6Months = new Date(now.getFullYear(), now.getMonth() - 3, 0).toISOString().split("T")[0];

    values.push(startPrevious6Months, endPrevious6Months, startLast6Months, endLast6Months);

    const query = `
      WITH purchases_growth AS (
        SELECT
          -- Prendre le nom du produit sauf si c'est "Default Name", dans ce cas on prend celui de internalproduct
          CASE 
            WHEN gp.name = 'Default Name' THEN ip.name
            ELSE gp.name
          END AS productName,

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
        LEFT JOIN data_globalproduct gp ON TRIM(ip.code_13_ref_id) = TRIM(gp.code_13_ref)
        
        -- Liaison avec le dernier inventaire disponible
        LEFT JOIN data_inventorysnapshot inv 
          ON ip.id = inv.product_id 
          AND inv.date = (
            SELECT MAX(date) 
            FROM data_inventorysnapshot 
            WHERE product_id = ip.id AND date <= o.delivery_date
          )

        -- Si pas de prix en stock, prendre le dernier connu
        LEFT JOIN LATERAL (
          SELECT weighted_average_price AS price
          FROM data_inventorysnapshot
          WHERE product_id = ip.id
          ORDER BY date DESC
          LIMIT 1
        ) last_known_price ON TRUE

        ${whereClause}
        GROUP BY gp.code_13_ref, gp.name, ip.name
      )
      SELECT
        productName,
        previous_avg_price,
        current_avg_price,
        COALESCE(
          (
            (current_avg_price - previous_avg_price) / NULLIF(previous_avg_price, 0) * 100
          ),
          0
        ) AS growth_rate,
        ABS(
          COALESCE(
            (
              (current_avg_price - previous_avg_price) / NULLIF(previous_avg_price, 0) * 100
            ),
            0
          )
        ) AS absolute_growth_rate
      FROM purchases_growth
      WHERE current_avg_price IS NOT NULL
      ORDER BY absolute_growth_rate DESC
      LIMIT 10;
    `;

    const client = await pool.connect();
    const result = await client.query<{
      productname: string;
      previous_avg_price: string;
      current_avg_price: string;
      growth_rate: string;
    }>(query, values);
    client.release();

    const growthPurchasesProducts = result.rows.map((row) => ({
      productName: row.productname ?? "Inconnu",
      growthRate: parseFloat(row.growth_rate),
      previousAvgPrice: parseFloat(row.previous_avg_price),
      currentAvgPrice: parseFloat(row.current_avg_price),
    }));

    res.status(200).json({ growthPurchasesProducts });
  } catch (error) {
    console.error("Erreur lors du calcul du prix d'achat moyen par produit :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}