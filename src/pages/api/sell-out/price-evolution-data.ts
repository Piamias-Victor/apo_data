// pages/api/products/prices/anomalies.ts

import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface PriceAnomaly {
  code: string; // Code de référence à 13 caractères
  productName: string;
  previousPrice: number;
  currentPrice: number;
  dateOfChange: string; // Format: YYYY-MM-DD
  percentageChange: number; // En pourcentage
}

interface PriceAnomaliesResponse {
  anomalies: PriceAnomaly[];
}

/**
 * Handler pour récupérer les anomalies de prix.
 * @param req - Requête HTTP
 * @param res - Réponse HTTP
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceAnomaliesResponse | { error: string }>
) {
  try {
    const client = await pool.connect();

    // Récupérer les filtres passés via req.query
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
      threshold,
      limit, // Nouveau paramètre pour limiter les résultats
    } = req.query;

    // Seuil par défaut de 10% si non spécifié
    const priceChangeThreshold = threshold ? parseFloat(threshold as string) : 10;

    // Limite par défaut de 100 si non spécifiée
    const resultLimit = limit ? parseInt(limit as string, 10) : 100;

    // Construire les clauses WHERE dynamiques en fonction des filtres
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

    // Ajouter des conditions spécifiques basées sur `selectedCategory`
    if (selectedCategory === "medicaments") {
      whereClauses.push(`ip.code_13_ref_id LIKE '34009%'`);
    } else if (selectedCategory === "parapharmacie") {
      whereClauses.push(`ip.code_13_ref_id NOT LIKE '34009%'`);
    }

    // Combiner les clauses WHERE
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Requête SQL optimisée pour identifier les anomalies de changement de prix
    const query = `
      WITH price_changes AS (
        SELECT 
          gp.code_13_ref AS code,
          CASE 
            WHEN gp.name = 'Default Name' THEN ip.name 
            ELSE gp.name 
          END AS product_name,
          s.date,
          i.price_with_tax AS current_price,
          LAG(i.price_with_tax) OVER (PARTITION BY gp.code_13_ref ORDER BY s.date) AS previous_price
        FROM data_sales s
        JOIN data_inventorysnapshot i ON s.product_id = i.id
        JOIN data_internalproduct ip ON i.product_id = ip.id
        JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
        ${whereClause}
      )
      SELECT
        pc.code,
        pc.product_name,
        pc.previous_price,
        pc.current_price,
        pc.date AS date_of_change,
        ROUND(((pc.current_price - pc.previous_price) / pc.previous_price) * 100, 2) AS percentage_change
      FROM price_changes pc
      WHERE pc.previous_price IS NOT NULL
        AND pc.previous_price != 0
        AND ABS(((pc.current_price - pc.previous_price) / pc.previous_price) * 100) >= $${paramIndex}
      ORDER BY percentage_change DESC, pc.product_name, date_of_change
      LIMIT $${paramIndex + 1};
    `;

    // Ajouter le seuil et la limite comme derniers paramètres
    values.push(priceChangeThreshold, resultLimit);
    paramIndex += 1;

    // Exécution de la requête SQL
    const result = await client.query<{
      code: string;
      product_name: string;
      previous_price: string;
      current_price: string;
      date_of_change: string;
      percentage_change: string;
    }>(query, values);

    client.release();

    // Transformer les résultats en format numérique
    const anomalies: PriceAnomaly[] = result.rows.map((row) => ({
      code: row.code, // string
      productName: row.product_name, // string
      previousPrice: parseFloat(row.previous_price),
      currentPrice: parseFloat(row.current_price),
      dateOfChange: row.date_of_change,
      percentageChange: parseFloat(row.percentage_change),
    }));

    // Retour de la réponse
    res.status(200).json({ anomalies });
  } catch (error) {
    console.error("Erreur lors de la récupération des anomalies de prix :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}