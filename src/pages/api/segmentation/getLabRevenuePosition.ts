import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface SegmentationComparisonData {
  segment: string;
  universe: string;
  category: string;
  sub_category: string;
  range_name: string;
  family: string;
  sub_family: string;
  specificity: string;
  revenue_current: number;
  margin_current: number;
  revenue_comparison: number;
  margin_comparison: number;
  revenue_evolution: number;
  margin_evolution: number;
  quantity_sold_current: number;
  quantity_sold_comparison: number;
  quantity_purchased_current: number;
  quantity_purchased_comparison: number;
  purchase_amount_current: number;
  purchase_amount_comparison: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ segmentationData: SegmentationComparisonData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters.dateRange || !filters.comparisonDateRange) {
      return res.status(400).json({ error: "Périodes de filtrage manquantes" });
    }

    const query = `
    WITH filtered_products AS (
        SELECT dgp.code_13_ref, dgp.universe, dgp.category, dgp.sub_category,
               dgp.range_name, dgp.family, dgp.sub_family, dgp.specificity,
               dgp.tva_percentage
        FROM data_globalproduct dgp
        WHERE 
            dgp.code_13_ref NOT LIKE '34009%'
            AND ($1::text[] IS NULL OR dgp.lab_distributor = ANY($1))
            AND ($2::text[] IS NULL OR dgp.range_name = ANY($2))
            AND ($3::text[] IS NULL OR dgp.universe = ANY($3))
            AND ($4::text[] IS NULL OR dgp.category = ANY($4))
            AND ($5::text[] IS NULL OR dgp.sub_category = ANY($5))
            AND ($6::text[] IS NULL OR dgp.family = ANY($6))
            AND ($7::text[] IS NULL OR dgp.sub_family = ANY($7))
            AND ($8::text[] IS NULL OR dgp.specificity = ANY($8))
    )
    
    , sales_data AS (
        SELECT 
            fp.universe, fp.category, fp.sub_category, fp.range_name, fp.family, fp.sub_family, fp.specificity,
            SUM(ds.quantity) AS quantity_sold,
            SUM(ds.quantity * dis.price_with_tax) AS revenue,
            SUM(
                (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
                * ds.quantity
            ) AS margin,
            'current' AS period
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE ($9::uuid[] IS NULL OR dip.pharmacy_id = ANY($9::uuid[]))
          AND ds.date BETWEEN $10 AND $11
        GROUP BY fp.universe, fp.category, fp.sub_category, fp.range_name, fp.family, fp.sub_family, fp.specificity
    
        UNION ALL
    
        SELECT 
            fp.universe, fp.category, fp.sub_category, fp.range_name, fp.family, fp.sub_family, fp.specificity,
            SUM(ds.quantity) AS quantity_sold,
            SUM(ds.quantity * dis.price_with_tax) AS revenue,
            SUM(
                (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
                * ds.quantity
            ) AS margin,
            'comparison' AS period
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE ($9::uuid[] IS NULL OR dip.pharmacy_id = ANY($9::uuid[]))
          AND ds.date BETWEEN $12 AND $13
        GROUP BY fp.universe, fp.category, fp.sub_category, fp.range_name, fp.family, fp.sub_family, fp.specificity
    )
    
    , purchase_data AS (
        SELECT 
            fp.universe, fp.category, fp.sub_category, fp.range_name, fp.family, fp.sub_family, fp.specificity,
            SUM(ds.quantity) AS quantity_purchased,
            SUM(ds.quantity * dis.weighted_average_price) AS purchase_amount,
            'current' AS period
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE ($9::uuid[] IS NULL OR dip.pharmacy_id = ANY($9::uuid[]))
          AND ds.date BETWEEN $10 AND $11
        GROUP BY fp.universe, fp.category, fp.sub_category, fp.range_name, fp.family, fp.sub_family, fp.specificity
    
        UNION ALL
    
        SELECT 
            fp.universe, fp.category, fp.sub_category, fp.range_name, fp.family, fp.sub_family, fp.specificity,
            SUM(ds.quantity) AS quantity_purchased,
            SUM(ds.quantity * dis.weighted_average_price) AS purchase_amount,
            'comparison' AS period
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE ($9::uuid[] IS NULL OR dip.pharmacy_id = ANY($9::uuid[]))
          AND ds.date BETWEEN $12 AND $13
        GROUP BY fp.universe, fp.category, fp.sub_category, fp.range_name, fp.family, fp.sub_family, fp.specificity
    )
    
    SELECT 
        sd.universe, sd.category, sd.sub_category, sd.range_name, sd.family, sd.sub_family, sd.specificity,
        COALESCE(SUM(CASE WHEN sd.period = 'current' THEN sd.revenue END), 0) AS revenue_current,
        COALESCE(SUM(CASE WHEN sd.period = 'current' THEN sd.margin END), 0) AS margin_current,
        COALESCE(SUM(CASE WHEN sd.period = 'current' THEN sd.quantity_sold END), 0) AS quantity_sold_current,
        COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.revenue END), 0) AS revenue_comparison,
        COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.margin END), 0) AS margin_comparison,
        COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.quantity_sold END), 0) AS quantity_sold_comparison,
        COALESCE(SUM(CASE WHEN pd.period = 'current' THEN pd.quantity_purchased END), 0) AS quantity_purchased_current,
        COALESCE(SUM(CASE WHEN pd.period = 'current' THEN pd.purchase_amount END), 0) AS purchase_amount_current,
        COALESCE(SUM(CASE WHEN pd.period = 'comparison' THEN pd.quantity_purchased END), 0) AS quantity_purchased_comparison,
        COALESCE(SUM(CASE WHEN pd.period = 'comparison' THEN pd.purchase_amount END), 0) AS purchase_amount_comparison
    FROM sales_data sd
    LEFT JOIN purchase_data pd 
        ON sd.universe = pd.universe 
        AND sd.category = pd.category
        AND sd.sub_category = pd.sub_category
        AND sd.range_name = pd.range_name
        AND sd.family = pd.family
        AND sd.sub_family = pd.sub_family
        AND sd.specificity = pd.specificity
    GROUP BY sd.universe, sd.category, sd.sub_category, sd.range_name, sd.family, sd.sub_family, sd.specificity
    ORDER BY revenue_current DESC;
        `;

    const { rows } = await pool.query<SegmentationComparisonData>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
      filters.pharmacies.length > 0 ? filters.pharmacies.map(id => id) : null,
      filters.dateRange[0], filters.dateRange[1], // Période principale
      filters.comparisonDateRange[0], filters.comparisonDateRange[1], // Période de comparaison
    ]);

    // ✅ Conversion des valeurs en nombres pour éviter les erreurs
    const formattedData = rows.map((item) => ({
      ...item,
      revenue_current: Number(item.revenue_current) || 0,
      margin_current: Number(item.margin_current) || 0,
      revenue_comparison: Number(item.revenue_comparison) || 0,
      margin_comparison: Number(item.margin_comparison) || 0,
      revenue_evolution: Number(item.revenue_evolution) || 0,
      margin_evolution: Number(item.margin_evolution) || 0,
      quantity_sold_current: Number(item.quantity_sold_current) || 0,
      quantity_sold_comparison: Number(item.quantity_sold_comparison) || 0,
      quantity_purchased_current: Number(item.quantity_purchased_current) || 0,
      quantity_purchased_comparison: Number(item.quantity_purchased_comparison) || 0,
      purchase_amount_current: Number(item.purchase_amount_current) || 0,
      purchase_amount_comparison: Number(item.purchase_amount_comparison) || 0,
    }));


    return res.status(200).json({ segmentationData: formattedData });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}