import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface TreeMapDataItem {
  id: string;         // ID unique pour chaque nœud
  name: string;       // Nom à afficher
  parent: string;     // ID parent (vide pour le niveau racine)
  value: number;      // Valeur pour dimensionner (ex: revenue)
  secondaryValue?: number; // Valeur secondaire (ex: margin)
  color?: string;     // Couleur (optionnel - sera calculée côté client)
  level: "universe" | "category" | "subcategory" | "family" | "subfamily" | "product";
  metadata?: {        // Métadonnées additionnelles pour l'affichage
    evolution?: number;
    margin_rate?: number;
    quantity?: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ treeMapData: TreeMapDataItem[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters, valueType = "revenue" } = req.body;

    if (!filters.dateRange || !filters.comparisonDateRange) {
      return res.status(400).json({ error: "Périodes de filtrage manquantes" });
    }

    // Sélection de la colonne pour la valeur principale en fonction du type demandé
    const valueColumn = valueType === "margin" 
      ? "margin" 
      : valueType === "quantity" 
        ? "quantity_sold"
        : "revenue";
    
    // Requête SQL avec structure hiérarchique pour TreeMap
    const query = `
    WITH filtered_products AS (
  SELECT 
    dgp.code_13_ref, 
    dgp.tva_percentage, 
    dgp.universe, 
    dgp.name,
    dgp.category, 
    dgp.sub_category,
    dgp.range_name, 
    dgp.family, 
    dgp.sub_family, 
    dgp.specificity,
    dgp.brand_lab
  FROM 
    data_globalproduct dgp
  WHERE 
    ($1::text[] IS NULL OR dgp.lab_distributor = ANY($1))
    AND ($2::text[] IS NULL OR dgp.range_name = ANY($2))
    AND ($3::text[] IS NULL OR dgp.universe = ANY($3))
    AND ($4::text[] IS NULL OR dgp.category = ANY($4))
    AND ($5::text[] IS NULL OR dgp.sub_category = ANY($5))
    AND ($6::text[] IS NULL OR dgp.family = ANY($6))
    AND ($7::text[] IS NULL OR dgp.sub_family = ANY($7))
    AND ($8::text[] IS NULL OR dgp.specificity = ANY($8))
    AND ($9::text[] IS NULL OR dgp.brand_lab = ANY($9))
    AND ($10::text[] IS NULL OR dgp.code_13_ref = ANY($10))
),

sales_current AS (
  SELECT 
    fp.code_13_ref,
    fp.universe, 
    fp.category, 
    fp.sub_category, 
    fp.family, 
    fp.sub_family,
    SUM(ds.quantity) AS quantity_sold,
    SUM(ds.quantity * dis.price_with_tax) AS revenue,
    SUM(
      (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
      * ds.quantity
    ) AS margin
  FROM 
    data_sales ds
  JOIN 
    data_inventorysnapshot dis ON ds.product_id = dis.id
  JOIN 
    data_internalproduct dip ON dis.product_id = dip.id
  JOIN 
    filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
  WHERE 
    ($11::uuid[] IS NULL OR dip.pharmacy_id = ANY($11::uuid[]))
    AND ds.date BETWEEN $12 AND $13
  GROUP BY 
    fp.code_13_ref, fp.universe, fp.category, fp.sub_category, fp.family, fp.sub_family
),

sales_comparison AS (
  SELECT 
    fp.code_13_ref,
    fp.universe, 
    fp.category, 
    fp.sub_category, 
    fp.family, 
    fp.sub_family,
    SUM(ds.quantity) AS quantity_sold,
    SUM(ds.quantity * dis.price_with_tax) AS revenue,
    SUM(
      (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
      * ds.quantity
    ) AS margin
  FROM 
    data_sales ds
  JOIN 
    data_inventorysnapshot dis ON ds.product_id = dis.id
  JOIN 
    data_internalproduct dip ON dis.product_id = dip.id
  JOIN 
    filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
  WHERE 
    ($11::uuid[] IS NULL OR dip.pharmacy_id = ANY($11::uuid[]))
    AND ds.date BETWEEN $14 AND $15
  GROUP BY 
    fp.code_13_ref, fp.universe, fp.category, fp.sub_category, fp.family, fp.sub_family
),

-- Niveau 1: Univers
universe_level AS (
  SELECT
    sc.universe AS id,
    sc.universe AS name,
    '' AS parent,
    SUM(sc.${valueColumn}) AS value,
    SUM(sc.margin) AS secondary_value,
    'universe' AS level,
    CASE 
      WHEN SUM(sp.${valueColumn}) > 0 
      THEN ((SUM(sc.${valueColumn}) - SUM(sp.${valueColumn})) / SUM(sp.${valueColumn})) * 100
      ELSE 0
    END AS evolution,
    CASE 
      WHEN SUM(sc.revenue) > 0 
      THEN (SUM(sc.margin) / SUM(sc.revenue)) * 100
      ELSE 0
    END AS margin_rate,
    SUM(sc.quantity_sold) AS quantity
  FROM 
    sales_current sc
  LEFT JOIN 
    sales_comparison sp ON sc.universe = sp.universe
  WHERE
    sc.universe IS NOT NULL AND sc.universe != ''
  GROUP BY 
    sc.universe
),

-- Niveau 2: Catégories
category_level AS (
  SELECT
    CONCAT(sc.universe, '_', sc.category) AS id,
    sc.category AS name,
    sc.universe AS parent,
    SUM(sc.${valueColumn}) AS value,
    SUM(sc.margin) AS secondary_value,
    'category' AS level,
    CASE 
      WHEN SUM(sp.${valueColumn}) > 0 
      THEN ((SUM(sc.${valueColumn}) - SUM(sp.${valueColumn})) / SUM(sp.${valueColumn})) * 100
      ELSE 0
    END AS evolution,
    CASE 
      WHEN SUM(sc.revenue) > 0 
      THEN (SUM(sc.margin) / SUM(sc.revenue)) * 100
      ELSE 0
    END AS margin_rate,
    SUM(sc.quantity_sold) AS quantity
  FROM 
    sales_current sc
  LEFT JOIN 
    sales_comparison sp ON sc.universe = sp.universe AND sc.category = sp.category
  WHERE
    sc.universe IS NOT NULL AND sc.universe != '' AND
    sc.category IS NOT NULL AND sc.category != ''
  GROUP BY 
    sc.universe, sc.category
),

-- Niveau 3: Sous-catégories
subcategory_level AS (
  SELECT
    CONCAT(sc.universe, '_', sc.category, '_', sc.sub_category) AS id,
    sc.sub_category AS name,
    CONCAT(sc.universe, '_', sc.category) AS parent,
    SUM(sc.${valueColumn}) AS value,
    SUM(sc.margin) AS secondary_value,
    'subcategory' AS level,
    CASE 
      WHEN SUM(sp.${valueColumn}) > 0 
      THEN ((SUM(sc.${valueColumn}) - SUM(sp.${valueColumn})) / SUM(sp.${valueColumn})) * 100
      ELSE 0
    END AS evolution,
    CASE 
      WHEN SUM(sc.revenue) > 0 
      THEN (SUM(sc.margin) / SUM(sc.revenue)) * 100
      ELSE 0
    END AS margin_rate,
    SUM(sc.quantity_sold) AS quantity
  FROM 
    sales_current sc
  LEFT JOIN 
    sales_comparison sp ON sc.universe = sp.universe AND sc.category = sp.category AND sc.sub_category = sp.sub_category
  WHERE
    sc.universe IS NOT NULL AND sc.universe != '' AND
    sc.category IS NOT NULL AND sc.category != '' AND
    sc.sub_category IS NOT NULL AND sc.sub_category != ''
  GROUP BY 
    sc.universe, sc.category, sc.sub_category
),

-- Niveau 4: Familles
family_level AS (
  SELECT
    CONCAT(sc.universe, '_', sc.category, '_', sc.sub_category, '_', sc.family) AS id,
    sc.family AS name,
    CONCAT(sc.universe, '_', sc.category, '_', sc.sub_category) AS parent,
    SUM(sc.${valueColumn}) AS value,
    SUM(sc.margin) AS secondary_value,
    'family' AS level,
    CASE 
      WHEN SUM(sp.${valueColumn}) > 0 
      THEN ((SUM(sc.${valueColumn}) - SUM(sp.${valueColumn})) / SUM(sp.${valueColumn})) * 100
      ELSE 0
    END AS evolution,
    CASE 
      WHEN SUM(sc.revenue) > 0 
      THEN (SUM(sc.margin) / SUM(sc.revenue)) * 100
      ELSE 0
    END AS margin_rate,
    SUM(sc.quantity_sold) AS quantity
  FROM 
    sales_current sc
  LEFT JOIN 
    sales_comparison sp ON sc.universe = sp.universe AND sc.category = sp.category 
      AND sc.sub_category = sp.sub_category AND sc.family = sp.family
  WHERE
    sc.universe IS NOT NULL AND sc.universe != '' AND
    sc.category IS NOT NULL AND sc.category != '' AND
    sc.sub_category IS NOT NULL AND sc.sub_category != '' AND
    sc.family IS NOT NULL AND sc.family != ''
  GROUP BY 
    sc.universe, sc.category, sc.sub_category, sc.family
),

-- Combiner tous les niveaux
combined_data AS (
  SELECT * FROM universe_level
  UNION ALL
  SELECT * FROM category_level
  UNION ALL
  SELECT * FROM subcategory_level
  UNION ALL
  SELECT * FROM family_level
)

-- Résultat final
SELECT 
  id,
  name,
  parent,
  value,
  secondary_value,
  level,
  json_build_object(
    'evolution', ROUND(evolution::numeric, 2),
    'margin_rate', ROUND(margin_rate::numeric, 2),
    'quantity', quantity
  ) AS metadata
FROM 
  combined_data
WHERE 
  value > 0
ORDER BY 
  value DESC;
    `;

    const { rows } = await pool.query(query, [
      filters.distributors.length ? filters.distributors : null,
      filters.ranges.length ? filters.ranges : null,
      filters.universes.length ? filters.universes : null,
      filters.categories.length ? filters.categories : null,
      filters.subCategories.length ? filters.subCategories : null,
      filters.families.length ? filters.families : null,
      filters.subFamilies.length ? filters.subFamilies : null,
      filters.specificities.length ? filters.specificities : null,
      filters.brands.length ? filters.brands : null,
      filters.ean13Products.length ? filters.ean13Products.map(String) : null,
      filters.pharmacies.length ? filters.pharmacies.map(id => id) : null,
      filters.dateRange[0], filters.dateRange[1],
      filters.comparisonDateRange[0], filters.comparisonDateRange[1],
    ]);

    // Formater les données pour le TreeMap
    const treeMapData = rows.map(row => ({
      ...row,
      value: Number(row.value) || 0,
      secondaryValue: Number(row.secondary_value) || 0,
      metadata: typeof row.metadata === 'object' ? row.metadata : 
        { 
          evolution: 0, 
          margin_rate: 0, 
          quantity: 0 
        }
    }));

    return res.status(200).json({ treeMapData });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données TreeMap:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}