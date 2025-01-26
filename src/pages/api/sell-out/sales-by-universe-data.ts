import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface SalesByUniverseResponse {
  universes: { universe: string; quantity: number; revenue: number; margin: number }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SalesByUniverseResponse | { error: string }>
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

    // Application des filtres
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

    // Gestion du filtre par catégorie sélectionnée
    if (selectedCategory === "medicaments") {
      whereClauses.push(`ip.code_13_ref_id LIKE '34009%'`);
    } else if (selectedCategory === "parapharmacie") {
      whereClauses.push(`ip.code_13_ref_id NOT LIKE '34009%'`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Requête SQL pour récupérer les ventes par univers avec la marge
    const query = `
      SELECT 
        gp.universe,
        SUM(s.quantity) AS quantity,
        SUM(s.quantity * COALESCE(i.price_with_tax, 0)) AS revenue,
        SUM(
          s.quantity * (
            COALESCE(i.price_with_tax, 0) / (1 + COALESCE(ip."TVA", 0) / 100) 
            - COALESCE(i.weighted_average_price, 0)
          )
        ) AS margin
      FROM data_sales s
      JOIN data_inventorysnapshot i ON s.product_id = i.id
      JOIN data_internalproduct ip ON i.product_id = ip.id
      JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause}
      GROUP BY gp.universe
      ORDER BY revenue DESC; -- Tri par chiffre d'affaires décroissant
    `;

    const client = await pool.connect();
    const result = await client.query<{
      universe: string;
      quantity: string;
      revenue: string;
      margin: string;
    }>(query, values);
    client.release();

    // Mise en forme des résultats
    const universes = result.rows.map((row) => ({
      universe: row.universe || "Inconnu",
      quantity: parseInt(row.quantity, 10),
      revenue: parseFloat(row.revenue),
      margin: parseFloat(row.margin),
    }));

    res.status(200).json({ universes });
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes par univers :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
