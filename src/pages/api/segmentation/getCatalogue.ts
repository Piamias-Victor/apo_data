import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des produits retournés
interface Product {
  code_13_ref: string;
  name: string;
  tva_percentage: number;
  avg_price_with_tax: number | null;
  avg_weighted_price: number | null;
  margin: number | null;
  margin_percentage: number | null;
  min_price_with_tax: number | null;
  max_price_with_tax: number | null;
  total_sales_quantity: number | null;
  total_revenue: number | null;  // CA total
  total_purchase_amount: number | null; // Montant d'achat total
  total_margin: number | null;  // Marge totale
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ products: Product[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (
      !filters ||
      (!filters.pharmacies.length &&
        !filters.distributors.length &&
        !filters.brands.length &&
        !filters.universes.length &&
        !filters.categories.length &&
        !filters.families.length &&
        !filters.specificities.length)
    ) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const query = `
WITH filtered_products AS (
    SELECT 
        dgp.code_13_ref::TEXT AS code_13_ref,  
        dgp.name, 
        COALESCE(dgp.tva_percentage, 0) AS tva_percentage
    FROM data_globalproduct dgp
    WHERE 
        ($1::text[] IS NULL OR dgp.lab_distributor = ANY($1))
        AND ($2::text[] IS NULL OR dgp.range_name = ANY($2))
        AND ($3::text[] IS NULL OR dgp.universe = ANY($3))
        AND ($4::text[] IS NULL OR dgp.category = ANY($4))
        AND ($5::text[] IS NULL OR dgp.sub_category = ANY($5))
        AND ($6::text[] IS NULL OR dgp.brand_lab = ANY($6))
        AND ($7::text[] IS NULL OR dgp.family = ANY($7))
        AND ($8::text[] IS NULL OR dgp.sub_family = ANY($8))
        AND ($9::text[] IS NULL OR dgp.specificity = ANY($9))
),

sales_data AS (
    SELECT 
        dip.code_13_ref_id AS code_13_ref,
        SUM(ds.quantity) AS total_sales_quantity
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id  
    JOIN data_internalproduct dip ON dis.product_id = dip.id  
    GROUP BY dip.code_13_ref_id
),

pricing_data AS (
    SELECT 
        dip.code_13_ref_id AS code_13_ref,
        ROUND(AVG(dis.price_with_tax), 2) AS avg_price_with_tax,
        ROUND(AVG(dis.weighted_average_price), 2) AS avg_weighted_price,
        MIN(dis.price_with_tax) AS min_price_with_tax,
        MAX(dis.price_with_tax) AS max_price_with_tax
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    GROUP BY dip.code_13_ref_id
),

financials AS (
    SELECT 
        dip.code_13_ref_id AS code_13_ref,  -- ✅ Correction ici
        SUM(dis.price_with_tax * ds.quantity) AS total_revenue, -- CA total
        SUM(dis.weighted_average_price * ds.quantity) AS total_purchase_amount -- Montant d'achat total
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id  
    JOIN data_internalproduct dip ON dis.product_id = dip.id  -- ✅ Correction ici
    GROUP BY dip.code_13_ref_id  -- ✅ Correction ici
)

SELECT 
    fp.code_13_ref, 
    fp.name, 
    fp.tva_percentage,

    -- 🔹 Prix moyens et min/max
    COALESCE(pd.avg_price_with_tax, 0) AS avg_price_with_tax,
    COALESCE(pd.avg_weighted_price, 0) AS avg_weighted_price,
    COALESCE(pd.min_price_with_tax, 0) AS min_price_with_tax,
    COALESCE(pd.max_price_with_tax, 0) AS max_price_with_tax,

    -- 🔹 Nombre total de ventes
    COALESCE(sd.total_sales_quantity, 0) AS total_sales_quantity,  

    -- 🔹 CA total
    COALESCE(fin.total_revenue, 0) AS total_revenue,

    -- 🔹 Montant d'achat total
    COALESCE(fin.total_purchase_amount, 0) AS total_purchase_amount,

    -- 🔹 Marge totale
    COALESCE(fin.total_revenue - fin.total_purchase_amount, 0) AS total_margin  

FROM filtered_products fp
LEFT JOIN pricing_data pd ON fp.code_13_ref = pd.code_13_ref
LEFT JOIN sales_data sd ON fp.code_13_ref = sd.code_13_ref
LEFT JOIN financials fin ON fp.code_13_ref = fin.code_13_ref
ORDER BY fp.name ASC;
    `;

    // 🔹 Exécution de la requête SQL
    const { rows } = await pool.query<Product>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucun produit trouvé" });
    }

    return res.status(200).json({ products: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des produits :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}