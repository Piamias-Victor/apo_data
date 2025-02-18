import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface SegmentationRevenue {
  universe: string;
  category: string;
  sub_category: string;
  family: string;
  sub_family: string;
  specificity: string;
  revenue: number;
  global_revenue: number; // ✅ Ajout du CA global du segment
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ segmentationRevenue: SegmentationRevenue[] } | { error: string }>
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
    -- 🟢 Sélection des produits en fonction des filtres
    SELECT 
        dgp.code_13_ref,
        dgp.universe,
        dgp.category,
        dgp.sub_category,
        dgp.family,
        dgp.sub_family,
        dgp.specificity
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
),
sales_data AS (
    -- Calcul du CA des produits filtrés
    SELECT 
        fp.universe,
        fp.category,
        fp.sub_category,
        fp.family,
        fp.sub_family,
        fp.specificity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    GROUP BY fp.universe, fp.category, fp.sub_category, fp.family, fp.sub_family, fp.specificity
),
global_sales_data AS (
    -- Calcul du CA global de chaque segment
    SELECT 
        dgp.universe,
        dgp.category,
        dgp.sub_category,
        dgp.family,
        dgp.sub_family,
        dgp.specificity,
        SUM(ds.quantity * dis.price_with_tax) AS global_revenue
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
    GROUP BY dgp.universe, dgp.category, dgp.sub_category, dgp.family, dgp.sub_family, dgp.specificity
),
aggregation AS (
    -- Agrégation du CA filtré par niveaux
    SELECT 
        universe,
        category,
        sub_category,
        family,
        sub_family,
        specificity,
        SUM(revenue) AS revenue
    FROM sales_data
    GROUP BY ROLLUP (universe, category, sub_category, family, sub_family, specificity)
),
global_aggregation AS (
    -- Agrégation du CA global à chaque niveau
    SELECT 
        universe,
        category,
        sub_category,
        family,
        sub_family,
        specificity,
        SUM(global_revenue) AS global_revenue
    FROM global_sales_data
    GROUP BY ROLLUP (universe, category, sub_category, family, sub_family, specificity)
)

-- Résultat final avec CA global correctement agrégé
SELECT 
    ag.universe,
    ag.category,
    ag.sub_category,
    ag.family,
    ag.sub_family,
    ag.specificity,
    COALESCE(ag.revenue, 0) AS revenue,   
    COALESCE(ga.global_revenue, 0) AS global_revenue 
FROM aggregation ag
LEFT JOIN global_aggregation ga
ON COALESCE(ag.universe, '') = COALESCE(ga.universe, '')
AND COALESCE(ag.category, '') = COALESCE(ga.category, '')
AND COALESCE(ag.sub_category, '') = COALESCE(ga.sub_category, '')
AND COALESCE(ag.family, '') = COALESCE(ga.family, '')
AND COALESCE(ag.sub_family, '') = COALESCE(ga.sub_family, '')
AND COALESCE(ag.specificity, '') = COALESCE(ga.specificity, '')
ORDER BY global_revenue DESC, revenue DESC;
    `;

    const { rows } = await pool.query<SegmentationRevenue>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée pour ce laboratoire ou cette marque" });
    }

    return res.status(200).json({ segmentationRevenue: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des revenus :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}