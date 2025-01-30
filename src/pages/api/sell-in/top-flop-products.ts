import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface PurchasesProductsResponse {
  topProducts: {
    name: string;
    code: string;
    quantity: number;
    cost: number;
  }[];
  flopProducts: {
    name: string;
    code: string;
    quantity: number;
    cost: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PurchasesProductsResponse | { error: string }>
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

    if (selectedCategory === "medicaments") {
      whereClauses.push(`ip.code_13_ref_id LIKE '34009%'`);
    } else if (selectedCategory === "parapharmacie") {
      whereClauses.push(`ip.code_13_ref_id NOT LIKE '34009%'`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 🔹 Requête SQL pour récupérer les Top et Flop 10 produits
    const query = `
      WITH ranked_products AS (
        SELECT 
          -- Récupération du nom du produit
          COALESCE(NULLIF(gp.name, 'Default Name'), 
            (SELECT ip.name FROM data_internalproduct ip WHERE ip.code_13_ref_id = gp.code_13_ref LIMIT 1)
          ) AS name,
          gp.code_13_ref AS code,
          SUM(po.qte) AS quantity, -- Somme des quantités achetées
          SUM(po.qte * COALESCE(inv.weighted_average_price, last_known_price.price, 0)) AS cost -- Montant total d'achat
        FROM data_order o
        JOIN data_productorder po ON o.id = po.order_id
        JOIN data_internalproduct ip ON po.product_id = ip.id
        JOIN data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref

        -- Jointure pour récupérer le prix d'achat pondéré
        LEFT JOIN data_inventorysnapshot inv 
          ON ip.id = inv.product_id 
          AND inv.date = (
            SELECT MAX(date) 
            FROM data_inventorysnapshot 
            WHERE product_id = ip.id AND date <= o.delivery_date
          )

        -- Si aucun prix trouvé, récupérer le dernier prix connu
        LEFT JOIN LATERAL (
          SELECT weighted_average_price AS price
          FROM data_inventorysnapshot
          WHERE product_id = ip.id
          ORDER BY date DESC
          LIMIT 1
        ) last_known_price ON TRUE

        ${whereClause}
        GROUP BY gp.code_13_ref, gp.name
      ),
      top_products AS (
        SELECT 'top' AS type, name, code, quantity, cost
        FROM ranked_products
        ORDER BY quantity DESC
        LIMIT 10
      ),
      flop_products AS (
        SELECT 'flop' AS type, name, code, quantity, cost
        FROM ranked_products
        ORDER BY quantity ASC
        LIMIT 10
      )
      SELECT * FROM top_products
      UNION ALL
      SELECT * FROM flop_products;
    `;

    const client = await pool.connect();
    const result = await client.query<{
      type: string;
      name: string;
      code: string;
      quantity: string;
      cost: string;
    }>(query, values);
    client.release();

    // 🔹 Séparation des résultats pour le top et le flop
    const topProducts = result.rows
      .filter((row) => row.type === "top")
      .map((row) => ({
        name: row.name,
        code: row.code,
        quantity: parseInt(row.quantity, 10),
        cost: parseFloat(row.cost),
      }));

    const flopProducts = result.rows
      .filter((row) => row.type === "flop")
      .map((row) => ({
        name: row.name,
        code: row.code,
        quantity: parseInt(row.quantity, 10),
        cost: parseFloat(row.cost),
      }));

    res.status(200).json({ topProducts, flopProducts });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits achetés :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}