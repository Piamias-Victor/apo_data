import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface SalesByMonthResponse {
  months: string[]; // Liste des mois au format "YYYY-MM"
  quantities: number[]; // Quantité vendue par mois
  revenues: number[]; // Revenu total par mois
  margins: number[]; // Marge totale par mois
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SalesByMonthResponse | { error: string }>
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

    // Application des filtres dynamiques
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

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Requête SQL
    const query = `
      SELECT 
        TO_CHAR(s.date, 'YYYY-MM') AS month,
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
      GROUP BY TO_CHAR(s.date, 'YYYY-MM')
      ORDER BY TO_CHAR(s.date, 'YYYY-MM');
    `;

    const client = await pool.connect();
    const result = await client.query<{
      month: string;
      quantity: string;
      revenue: string;
      margin: string;
    }>(query, values);
    client.release();

    // Mise en forme des résultats
    const months = result.rows.map((row) => row.month);
    const quantities = result.rows.map((row) => parseInt(row.quantity, 10));
    const revenues = result.rows.map((row) => parseFloat(row.revenue));
    const margins = result.rows.map((row) => parseFloat(row.margin));

    res.status(200).json({ months, quantities, revenues, margins });
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes par mois avec marges :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
