import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface SalesData {
  code_13_ref: string;
  name: string;
  tva_percentage: number;
  total_revenue: number;
  total_purchase_amount: number;
  total_margin: number;
  total_quantity_sold: number;
  range_name: string;
}

interface RangeSummary {
  range_name: string;
  total_revenue: number;
  total_purchase_amount: number;
  total_margin: number;
  total_quantity_sold: number;
  products: SalesData[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ranges: RangeSummary[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    // ✅ Sécurisation des filtres
    if (!filters || typeof filters !== "object") {
      return res.status(400).json({ error: "Filtres invalides ou manquants" });
    }

    const distributors = Array.isArray(filters.distributors) ? filters.distributors : [];
    const brands = Array.isArray(filters.brands) ? filters.brands : [];
    const universes = Array.isArray(filters.universes) ? filters.universes : [];
    const categories = Array.isArray(filters.categories) ? filters.categories : [];
    const subCategories = Array.isArray(filters.subCategories) ? filters.subCategories : [];
    const families = Array.isArray(filters.families) ? filters.families : [];
    const subFamilies = Array.isArray(filters.subFamilies) ? filters.subFamilies : [];
    const specificities = Array.isArray(filters.specificities) ? filters.specificities : [];
    const ranges = Array.isArray(filters.ranges) ? filters.ranges : [];

    if (distributors.length === 0 && brands.length === 0) {
      return res.status(400).json({ error: "Aucun laboratoire ou marque sélectionné" });
    }

    // 📌 Requête SQL pour récupérer les ventes agrégées par gamme et les produits
    const query = `
WITH filtered_products AS (
    -- 🟢 Sélection des produits en fonction des filtres
    SELECT 
        dgp.code_13_ref,
        dgp.name,
        COALESCE(dgp.range_name, 'Autres') AS range_name,
        COALESCE(dgp.tva_percentage, 0) AS tva_percentage,
        COALESCE(dgp.lab_distributor, dgp.brand_lab, 'Inconnu') AS lab_name
    FROM data_globalproduct dgp
    WHERE 
        ($1::text[] IS NULL OR dgp.lab_distributor = ANY($1))
        AND ($2::text[] IS NULL OR dgp.brand_lab = ANY($2))
        AND ($3::text[] IS NULL OR dgp.universe = ANY($3))
        AND ($4::text[] IS NULL OR dgp.category = ANY($4))
        AND ($5::text[] IS NULL OR dgp.sub_category = ANY($5))
        AND ($6::text[] IS NULL OR dgp.family = ANY($6))
        AND ($7::text[] IS NULL OR dgp.sub_family = ANY($7))
        AND ($8::text[] IS NULL OR dgp.specificity = ANY($8))
        AND ($9::text[] IS NULL OR dgp.range_name = ANY($9))
),

sales_data AS (
    -- 🟠 Données des ventes pour les 12 derniers mois
    SELECT 
        fp.range_name,
        fp.lab_name,
        fp.code_13_ref,
        fp.name,
        fp.tva_percentage,
        SUM(ds.quantity) AS total_quantity_sold,
        SUM(ds.quantity * dis.price_with_tax) AS total_revenue,
        SUM(ds.quantity * dis.weighted_average_price) AS total_purchase_amount,
        AVG(dis.price_with_tax) AS avg_selling_price,
        AVG(dis.weighted_average_price) AS avg_purchase_price,
        SUM(ds.quantity * (dis.price_with_tax - dis.weighted_average_price)) AS total_margin,
        AVG(dis.price_with_tax - dis.weighted_average_price) AS avg_margin,
        AVG(dis.stock) AS avg_stock
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date >= NOW() - INTERVAL '12 months'
    GROUP BY fp.range_name, fp.lab_name, fp.code_13_ref, fp.name, fp.tva_percentage
),

previous_sales_data AS (
    -- 🔄 Données des ventes pour les 12 mois précédents
    SELECT 
        fp.range_name,
        fp.lab_name,
        fp.code_13_ref,
        SUM(ds.quantity) AS prev_total_quantity_sold,
        SUM(ds.quantity * dis.price_with_tax) AS prev_total_revenue,
        SUM(ds.quantity * dis.weighted_average_price) AS prev_total_purchase_amount,
        AVG(dis.price_with_tax) AS prev_avg_selling_price,
        AVG(dis.weighted_average_price) AS prev_avg_purchase_price,
        SUM(ds.quantity * (dis.price_with_tax - dis.weighted_average_price)) AS prev_total_margin,
        AVG(dis.price_with_tax - dis.weighted_average_price) AS prev_avg_margin,
        AVG(dis.stock) AS prev_avg_stock
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ds.date BETWEEN NOW() - INTERVAL '24 months' AND NOW() - INTERVAL '12 months'
    GROUP BY fp.range_name, fp.lab_name, fp.code_13_ref
)

-- 🔹 Fusion des ventes actuelles et précédentes avec calcul des évolutions
SELECT 
    sd.range_name,
    sd.lab_name,
    sd.code_13_ref,
    sd.name,
    sd.tva_percentage,
    sd.total_quantity_sold,
    sd.total_revenue,
    sd.total_purchase_amount,
    sd.avg_selling_price,
    sd.avg_purchase_price,
    sd.total_margin,
    sd.avg_margin,
    sd.avg_stock,

    -- 📈 Évolution des valeurs en pourcentage
    ((sd.total_revenue - COALESCE(psd.prev_total_revenue, 0)) / NULLIF(psd.prev_total_revenue, 0)) * 100 AS evolution_total_revenue,
    ((sd.total_purchase_amount - COALESCE(psd.prev_total_purchase_amount, 0)) / NULLIF(psd.prev_total_purchase_amount, 0)) * 100 AS evolution_total_purchase_amount,
    ((sd.total_margin - COALESCE(psd.prev_total_margin, 0)) / NULLIF(psd.prev_total_margin, 0)) * 100 AS evolution_total_margin,
    ((sd.total_quantity_sold - COALESCE(psd.prev_total_quantity_sold, 0)) / NULLIF(psd.prev_total_quantity_sold, 0)) * 100 AS evolution_total_quantity_sold,
    ((sd.avg_selling_price - COALESCE(psd.prev_avg_selling_price, 0)) / NULLIF(psd.prev_avg_selling_price, 0)) * 100 AS evolution_avg_selling_price,
    ((sd.avg_purchase_price - COALESCE(psd.prev_avg_purchase_price, 0)) / NULLIF(psd.prev_avg_purchase_price, 0)) * 100 AS evolution_avg_purchase_price,
    ((sd.avg_margin - COALESCE(psd.prev_avg_margin, 0)) / NULLIF(psd.prev_avg_margin, 0)) * 100 AS evolution_avg_margin,
    ((sd.avg_stock - COALESCE(psd.prev_avg_stock, 0)) / NULLIF(psd.prev_avg_stock, 0)) * 100 AS evolution_avg_stock

FROM sales_data sd
LEFT JOIN previous_sales_data psd 
    ON sd.code_13_ref = psd.code_13_ref
ORDER BY sd.total_revenue DESC;
    `;

    const { rows } = await pool.query<RangeSummary>(query, [
      distributors.length > 0 ? distributors : null,
      brands.length > 0 ? brands : null,
      universes.length > 0 ? universes : null,
      categories.length > 0 ? categories : null,
      subCategories.length > 0 ? subCategories : null,
      families.length > 0 ? families : null,
      subFamilies.length > 0 ? subFamilies : null,
      specificities.length > 0 ? specificities : null,
      ranges.length > 0 ? ranges : null,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée" });
    }

    return res.status(200).json({ ranges: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}