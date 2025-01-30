import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface PurchasesByPharmacyResponse {
  pharmacies: {
    pharmacyId: string;
    quantity: number;
    cost: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PurchasesByPharmacyResponse | { error: string }>
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
      selectedCategory, // 🔹 Ajout de selectedCategory
    } = req.query;

    const whereClauses: string[] = ["po.qte > 0"];
    const values: any[] = [];
    let paramIndex = 1;

    // 🔹 Application des filtres dynamiques
    if (startDate) {
      whereClauses.push(`o.delivery_date >= $${paramIndex}::date`);
      values.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClauses.push(`o.delivery_date <= $${paramIndex}::date`);
      values.push(endDate);
      paramIndex++;
    }
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

    // 🔹 Gestion du filtre par catégorie sélectionnée (Médicaments ou Parapharmacie)
    if (selectedCategory === "medicaments") {
      whereClauses.push(`gp.code_13_ref LIKE '34009%'`);
    } else if (selectedCategory === "parapharmacie") {
      whereClauses.push(`gp.code_13_ref NOT LIKE '34009%'`);
    }

    // 🔹 Clause WHERE finale
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 🔹 Requête SQL
    const query = `
      SELECT 
        o.pharmacy_id AS pharmacy_id,
        SUM(po.qte) AS quantity,
        SUM(po.qte * COALESCE(inv.weighted_average_price, last_known_price.price)) AS cost
      FROM data_order o
      JOIN data_productorder po ON o.id = po.order_id
      JOIN data_internalproduct i ON po.product_id = i.id
      JOIN data_globalproduct gp ON i.code_13_ref_id = gp.code_13_ref
      LEFT JOIN data_inventorysnapshot inv 
        ON i.id = inv.product_id 
        AND inv.date = (
            SELECT MAX(date) 
            FROM data_inventorysnapshot 
            WHERE product_id = i.id AND date <= o.delivery_date
        )
      LEFT JOIN LATERAL (
        SELECT weighted_average_price AS price
        FROM data_inventorysnapshot
        WHERE product_id = i.id
        ORDER BY date DESC
        LIMIT 1
      ) last_known_price ON TRUE
      ${whereClause}
      GROUP BY o.pharmacy_id
      ORDER BY cost DESC;
    `;

    const client = await pool.connect();
    const result = await client.query<{ pharmacy_id: string; quantity: string; cost: string }>(
      query,
      values
    );
    client.release();

    // 🔹 Mise en forme des résultats
    const pharmacies = result.rows.map((row) => ({
      pharmacyId: row.pharmacy_id || "unknown",
      quantity: parseInt(row.quantity, 10),
      cost: parseFloat(row.cost),
    }));

    res.status(200).json({ pharmacies });
  } catch (error) {
    console.error("Erreur lors de la récupération des achats par pharmacie :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}