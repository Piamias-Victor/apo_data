// src/pages/api/sell-out/regression-labs-data.ts

import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

/** Interface pour la réponse JSON */
interface RegressionLabsResponse {
  regressionLabs: {
    lab: string;            // Nom du labo
    regressionRate: number; // Taux de régression
    currentQuantity: number;
    previousQuantity: number;
    totalRevenue: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegressionLabsResponse | { error: string }>
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

    // 1) Filtres dynamiques
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

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 2) Calcul dynamique des périodes
    const now = new Date();
    const startLast3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split("T")[0];
    const endLast3Months = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
    const startPrevious3Months = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split("T")[0];
    const endPrevious3Months = new Date(now.getFullYear(), now.getMonth() - 3, 0).toISOString().split("T")[0];

    // On ajoute les 4 dates au tableau 'values'
    values.push(startPrevious3Months, endPrevious3Months, startLast3Months, endLast3Months);

    // 3) Requête SQL, agrégation par lab_distributor
    const query = `
      WITH labs_regression AS (
        SELECT
          gp.lab_distributor AS lab,
          SUM(
            CASE
              WHEN s.date BETWEEN $${paramIndex} AND $${paramIndex + 1}
              THEN s.quantity ELSE 0
            END
          ) AS previous_quantity,
          SUM(
            CASE
              WHEN s.date BETWEEN $${paramIndex + 2} AND $${paramIndex + 3}
              THEN s.quantity ELSE 0
            END
          ) AS current_quantity,
          SUM(s.quantity * COALESCE(i.price_with_tax, 0)) AS total_revenue
        FROM data_sales s
        JOIN data_inventorysnapshot i ON s.product_id = i.id
        JOIN data_internalproduct ip ON i.product_id = ip.id
        JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
        ${whereClause}
        GROUP BY gp.lab_distributor
      )
      SELECT
        lab,
        previous_quantity,
        current_quantity,
        COALESCE(
          (
            (current_quantity * 1.0 - previous_quantity * 1.0)
            / NULLIF(previous_quantity * 1.0, 0)
          ) * 100,
          0
        ) AS regression_rate,
        total_revenue
      FROM labs_regression
      -- Filtrage : on veut par ex. des labos qui ont vendu quelque chose
      WHERE current_quantity > 0
      -- Pour réellement cibler la régression, on peut ajouter :
      -- AND COALESCE(((current_quantity - previous_quantity)/...) * 100,0) < 0
      ORDER BY regression_rate ASC
      LIMIT 10;
    `;

    // 4) Exécution
    const client = await pool.connect();
    const result = await client.query<{
      lab: string;
      regression_rate: string;
      current_quantity: string;
      previous_quantity: string;
      total_revenue: string;
    }>(query, values);
    client.release();

    // 5) Formatage final
    const regressionLabs = result.rows.map((row) => ({
      lab: row.lab ?? "Inconnu",
      regressionRate: parseFloat(row.regression_rate),
      currentQuantity: parseInt(row.current_quantity, 10),
      previousQuantity: parseInt(row.previous_quantity, 10),
      totalRevenue: parseFloat(row.total_revenue),
    }));

    // 6) Réponse JSON
    res.status(200).json({ regressionLabs });
  } catch (error) {
    console.error("Erreur lors de l'analyse de la régression des laboratoires :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}