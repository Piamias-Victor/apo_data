import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées par marque (sans lab_distributor)
interface BrandData {
  brand_lab: string;
  total_quantity_sold: number;
  total_revenue: number;
  total_margin: number;
  total_purchase: number;  // ✅ Ajouté pour le montant d'achat total
  avg_sale_price: number;
  min_sale_price: number;
  max_sale_price: number;
  avg_purchase_price: number;
  pharmacies_in_stock: number;
  revenue_share: number;
  margin_share: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ brands: BrandData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    console.log("📥 Filtres reçus :", filters);

    if (
      !filters ||
      (!filters.pharmacies?.length &&
        !filters.distributors?.length &&
        !filters.universes?.length &&
        !filters.categories?.length &&
        !filters.families?.length &&
        !filters.specificities?.length)
    ) {
      console.error("❌ Erreur : Filtres invalides", filters);
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const query = `
    WITH filtered_products AS (
        SELECT DISTINCT dgp.brand_lab
        FROM data_globalproduct dgp
        WHERE 
            ($1::text[] IS NULL OR dgp.lab_distributor = ANY($1))
            AND ($2::text[] IS NULL OR dgp.universe = ANY($2))
            AND ($3::text[] IS NULL OR dgp.category = ANY($3))
            AND ($4::text[] IS NULL OR dgp.family = ANY($4))
            AND ($5::text[] IS NULL OR dgp.specificity = ANY($5))
    )

    , sales_data AS (
        SELECT 
            dgp.brand_lab,
            SUM(ds.quantity) AS total_quantity_sold,
            SUM(ds.quantity * dis.price_with_tax) AS total_revenue,
            SUM(ds.quantity * dis.weighted_average_price) AS total_purchase,  -- ✅ Ajouté pour le montant d'achat total
            SUM((dis.price_with_tax - dis.weighted_average_price) * ds.quantity) AS total_margin,
            AVG(dis.price_with_tax) AS avg_sale_price,
            MIN(dis.price_with_tax) AS min_sale_price,
            MAX(dis.price_with_tax) AS max_sale_price,
            AVG(dis.weighted_average_price) AS avg_purchase_price
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        JOIN filtered_products fp ON dgp.brand_lab = fp.brand_lab
        WHERE ds.date >= CURRENT_DATE - interval '12 months'
        AND ($6::uuid[] IS NULL OR dip.pharmacy_id = ANY($6))
        GROUP BY dgp.brand_lab
    )

    , stock_data AS (
        SELECT 
            dgp.brand_lab,
            COUNT(DISTINCT dip.pharmacy_id) AS pharmacies_in_stock
        FROM data_inventorysnapshot dis
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        JOIN filtered_products fp ON dgp.brand_lab = fp.brand_lab
        WHERE dis.date >= CURRENT_DATE - interval '12 months'
        AND ($6::uuid[] IS NULL OR dip.pharmacy_id = ANY($6))
        GROUP BY dgp.brand_lab
    )

    , brand_totals AS (
        SELECT 
            COALESCE(SUM(sd.total_revenue), 0) AS total_global_revenue,
            COALESCE(SUM(sd.total_margin), 0) AS total_global_margin
        FROM sales_data sd
    )

    SELECT 
    sd.brand_lab,
    COALESCE(sd.total_quantity_sold, 0) AS total_quantity_sold,
    COALESCE(sd.total_revenue, 0) AS total_revenue,
    COALESCE(sd.total_margin, 0) AS total_margin,
    COALESCE(sd.total_purchase, 0) AS total_purchase,  -- ✅ Ajouté pour récupérer le montant d'achat total
    ROUND(COALESCE(sd.avg_sale_price, 0), 2) AS avg_sale_price,
    ROUND(COALESCE(sd.min_sale_price, 0), 2) AS min_sale_price,
    ROUND(COALESCE(sd.max_sale_price, 0), 2) AS max_sale_price,
    ROUND(COALESCE(sd.avg_purchase_price, 0), 2) AS avg_purchase_price,
    COALESCE(st.pharmacies_in_stock, 0) AS pharmacies_in_stock,
    CASE 
        WHEN bt.total_global_revenue = 0 THEN 0
        ELSE ROUND((sd.total_revenue / bt.total_global_revenue) * 100, 2)
    END AS revenue_share,
    CASE 
        WHEN bt.total_global_margin = 0 THEN 0
        ELSE ROUND((sd.total_margin / bt.total_global_margin) * 100, 2)
    END AS margin_share
FROM sales_data sd
LEFT JOIN stock_data st ON sd.brand_lab = st.brand_lab
LEFT JOIN brand_totals bt ON true
ORDER BY revenue_share DESC;
    `;

    // 📌 Transformation des listes vides en `NULL`
    const params = [
      filters.distributors?.length ? filters.distributors : null,
      filters.universes?.length ? filters.universes : null,
      filters.categories?.length ? filters.categories : null,
      filters.families?.length ? filters.families : null,
      filters.specificities?.length ? filters.specificities : null,
      filters.pharmacies?.length ? filters.pharmacies.map((id) => id) : null,
    ];

    console.log("📝 Paramètres SQL envoyés :", params);

    const { rows } = await pool.query<BrandData>(query, params);

    console.log("🔎 Résultats récupérés :", rows);

    return res.status(200).json({ brands: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}