import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/db";

interface FinancialDataResponse {
  totalRevenue: number;
  totalPurchase: number;
  totalMargin: number;
  totalQuantity: number;
  averageSellingPrice: number;
  averagePurchasePrice: number;
  marginPercentage: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FinancialDataResponse | { error: string }>
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
    } = req.query;

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
      whereClauses.push(`ip.pharmacy_id = $${paramIndex}::uuid`);
      values.push(pharmacy);
      paramIndex++;
    }
    if (universe) {
      whereClauses.push(`gp.universe ILIKE $${paramIndex}`);
      values.push(`%${universe}%`);
      paramIndex++;
    }
    if (category) {
      whereClauses.push(`gp.category ILIKE $${paramIndex}`);
      values.push(`%${category}%`);
      paramIndex++;
    }
    if (subCategory) {
      whereClauses.push(`gp.sub_category ILIKE $${paramIndex}`);
      values.push(`%${subCategory}%`);
      paramIndex++;
    }
    if (labDistributor) {
      whereClauses.push(`gp.lab_distributor ILIKE $${paramIndex}`);
      values.push(`%${labDistributor}%`);
      paramIndex++;
    }
    if (brandLab) {
      whereClauses.push(`gp.brand_lab ILIKE $${paramIndex}`);
      values.push(`%${brandLab}%`);
      paramIndex++;
    }
    if (rangeName) {
      whereClauses.push(`gp.range_name ILIKE $${paramIndex}`);
      values.push(`%${rangeName}%`);
      paramIndex++;
    }
    if (product) {
      whereClauses.push(`gp.code_13_ref = $${paramIndex}`);
      values.push(product);
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

    const query = `
      SELECT 
        SUM(s.quantity * COALESCE(i.price_with_tax, 0)) AS totalRevenue,
        SUM(s.quantity * COALESCE(i.weighted_average_price, 0)) AS totalPurchase,
        SUM(
          s.quantity * (
            COALESCE(i.price_with_tax, 0) / (1 + COALESCE(ip."TVA", 0) / 100) 
            - COALESCE(i.weighted_average_price, 0)
          )
        ) AS totalMargin,
        SUM(s.quantity) AS totalQuantity
      FROM data_sales s
      JOIN data_inventorysnapshot i ON s.product_id = i.id
      JOIN data_internalproduct ip ON i.product_id = ip.id
      JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
      ${whereClause};
    `;

    const result = await client.query<{
      totalrevenue: string;
      totalpurchase: string;
      totalmargin: string;
      totalquantity: string;
    }>(query, values);

    client.release();

    // Convertir correctement les résultats en nombres
    const totalRevenue = parseFloat(result.rows[0]?.totalrevenue || "0");
    const totalPurchase = parseFloat(result.rows[0]?.totalpurchase || "0");
    const totalMargin = parseFloat(result.rows[0]?.totalmargin || "0");
    const totalQuantity = parseFloat(result.rows[0]?.totalquantity || "0");

    // Calcul des métriques
    const averageSellingPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;
    const averagePurchasePrice = totalQuantity > 0 ? totalPurchase / totalQuantity : 0;
    const marginPercentage = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

    res.status(200).json({
      totalRevenue,
      totalPurchase,
      totalMargin,
      totalQuantity,
      averageSellingPrice,
      averagePurchasePrice,
      marginPercentage,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données financières :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
