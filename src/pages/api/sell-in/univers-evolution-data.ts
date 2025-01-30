import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

/** Interface pour la réponse */
interface GrowthPurchasesUniversesResponse {
  growthPurchasesUniverses: {
    universe: string;
    growthRate: number;
    currentPurchaseAmount: number;
    previousPurchaseAmount: number;
    currentQuantity: number;
    previousQuantity: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GrowthPurchasesUniversesResponse | { error: string }>
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
    } = req.query;

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

    // Définition des périodes de comparaison
    const now = new Date();
    const startLast6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split("T")[0];
    const endLast6Months = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
    const startPrevious6Months = new Date(now.getFullYear(), now.getMonth() - 12, 1).toISOString().split("T")[0];
    const endPrevious6Months = new Date(now.getFullYear(), now.getMonth() - 6, 0).toISOString().split("T")[0];

    values.push(startPrevious6Months, endPrevious6Months, startLast6Months, endLast6Months);

    // Requête SQL corrigée
    const query = `
      WITH purchases_growth AS (
        SELECT
          gp.universe AS universe,
          
          -- Quantité achetée dans la période précédente
          SUM(CASE WHEN o.delivery_date BETWEEN $${paramIndex} AND $${paramIndex + 1} THEN po.qte ELSE 0 END) AS previous_quantity,

          -- Quantité achetée dans la période actuelle
          SUM(CASE WHEN o.delivery_date BETWEEN $${paramIndex + 2} AND $${paramIndex + 3} THEN po.qte ELSE 0 END) AS current_quantity,

          -- Montant total des achats dans la période précédente
          SUM(
            CASE 
              WHEN o.delivery_date BETWEEN $${paramIndex} AND $${paramIndex + 1} 
              THEN po.qte * COALESCE(inv.weighted_average_price, last_known_price.price, 0) 
              ELSE 0 
            END
          ) AS previous_purchase_amount,

          -- Montant total des achats dans la période actuelle
          SUM(
            CASE 
              WHEN o.delivery_date BETWEEN $${paramIndex + 2} AND $${paramIndex + 3} 
              THEN po.qte * COALESCE(inv.weighted_average_price, last_known_price.price, 0) 
              ELSE 0 
            END
          ) AS current_purchase_amount

        FROM data_order o
        JOIN data_productorder po ON o.id = po.order_id
        JOIN data_internalproduct ip ON po.product_id = ip.id
        JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref

        -- Jointure correcte avec inv
        LEFT JOIN data_inventorysnapshot inv ON inv.product_id = ip.id 
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
        GROUP BY gp.universe
      )
      SELECT
        universe,
        previous_quantity,
        current_quantity,
        previous_purchase_amount,
        current_purchase_amount,
        COALESCE(
          ((current_purchase_amount - previous_purchase_amount) / NULLIF(previous_purchase_amount, 0)) * 100, 
          0
        ) AS growth_rate
      FROM purchases_growth
      WHERE current_purchase_amount IS NOT NULL
      ORDER BY ABS(growth_rate) DESC
      LIMIT 10;
    `;

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    res.status(200).json({ growthPurchasesUniverses: result.rows });
  } catch (error) {
    console.error("Erreur lors de l'analyse des achats par univers :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};