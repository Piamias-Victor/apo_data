import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées par marque
interface BrandSalesStockData {
  month: string;
  total_quantity_sold: number;
  total_stock_quantity: number;
  stock_break_quantity: number;
}

/**
 * API pour récupérer les ventes, stocks et ruptures mensuelles d'une marque spécifique (`brand_lab`)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ salesStockData: BrandSalesStockData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { brand_lab, filters } = req.body;

    if (!brand_lab) {
      return res.status(400).json({ error: "Nom de marque (`brand_lab`) requis" });
    }

    const query = `
    WITH filtered_products AS (
        -- 🔹 Filtre les produits de la marque selon les critères de segmentation
        SELECT DISTINCT dgp.code_13_ref
        FROM data_globalproduct dgp
        WHERE 
            dgp.brand_lab = $1
            AND ($2::text[] IS NULL OR dgp.lab_distributor = ANY($2))
            AND ($3::text[] IS NULL OR dgp.universe = ANY($3))
            AND ($4::text[] IS NULL OR dgp.category = ANY($4))
            AND ($5::text[] IS NULL OR dgp.family = ANY($5))
            AND ($6::text[] IS NULL OR dgp.specificity = ANY($6))
    )

    , brand_sales AS (
        -- 🔹 Récupère les quantités vendues de la marque par mois AVEC SEGMENTATION
        SELECT 
            TO_CHAR(ds.date, 'YYYY-MM') AS month,
            SUM(ds.quantity) AS total_quantity_sold
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        JOIN filtered_products fp ON dgp.code_13_ref = fp.code_13_ref
        WHERE ($7::text[] IS NULL OR dip.pharmacy_id::text = ANY($7))
        GROUP BY month
    )

    , product_stock_avg AS (
        -- 🔹 Calcule la moyenne du stock de chaque produit de la marque par mois
        SELECT 
            TO_CHAR(dis.date, 'YYYY-MM') AS month,
            dgp.code_13_ref, 
            AVG(dis.stock) AS avg_stock_per_product -- Moyenne du stock par produit
        FROM data_inventorysnapshot dis
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        JOIN filtered_products fp ON dgp.code_13_ref = fp.code_13_ref
        WHERE ($7::text[] IS NULL OR dip.pharmacy_id::text = ANY($7))
        GROUP BY month, dgp.code_13_ref
    )

    , product_stock AS (
        -- 🔹 Fait la somme des moyennes des stocks de chaque produit par mois
        SELECT 
            month,
            SUM(avg_stock_per_product) AS total_stock_quantity
        FROM product_stock_avg
        GROUP BY month
    )

    , brand_stock_break AS (
        -- 🔹 Calcule la quantité en rupture de stock de la marque par mois AVEC SEGMENTATION
        SELECT 
            TO_CHAR(dor.sent_date, 'YYYY-MM') AS month,
            SUM(CASE 
                    WHEN (dpo.qte + dpo.qte_ug) > dpo.qte_r 
                    THEN ((dpo.qte + dpo.qte_ug) - dpo.qte_r) 
                    ELSE 0 
                END) AS stock_break_quantity
        FROM data_productorder dpo
        JOIN data_order dor ON dpo.order_id = dor.id
        JOIN data_internalproduct dip ON dpo.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        JOIN filtered_products fp ON dgp.code_13_ref = fp.code_13_ref
        WHERE ($7::text[] IS NULL OR dor.pharmacy_id::text = ANY($7))
        GROUP BY month
    )

    , all_months AS (
        -- 🔹 Génère la liste des 12 derniers mois pour assurer la complétude des données
        SELECT DISTINCT TO_CHAR(generate_series, 'YYYY-MM') AS month
        FROM generate_series(
            (CURRENT_DATE - interval '12 months')::date, 
            CURRENT_DATE::date, 
            interval '1 month'
        )
    )

    -- 🔹 Jointure des données ventes, stock et ruptures
    SELECT 
        am.month,
        COALESCE(bs.total_quantity_sold, 0) AS total_quantity_sold,
        COALESCE(ps.total_stock_quantity, 0) AS total_stock_quantity,
        COALESCE(bsb.stock_break_quantity, 0) AS stock_break_quantity
    FROM all_months am
    LEFT JOIN brand_sales bs ON am.month = bs.month
    LEFT JOIN product_stock ps ON am.month = ps.month
    LEFT JOIN brand_stock_break bsb ON am.month = bsb.month
    ORDER BY am.month ASC;
    `;

    const params = [
      brand_lab,
      filters?.distributors?.length ? filters.distributors : null,
      filters?.universes?.length ? filters.universes : null,
      filters?.categories?.length ? filters.categories : null,
      filters?.families?.length ? filters.families : null,
      filters?.specificities?.length ? filters.specificities : null,
      filters?.pharmacies?.length ? filters.pharmacies.map((id) => id) : null,
    ];

    const { rows } = await pool.query<BrandSalesStockData>(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée pour cette marque" });
    }

    return res.status(200).json({ salesStockData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des ventes, stocks et ruptures de la marque :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}