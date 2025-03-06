import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface pour structurer les données retournées
interface SegmentData {
  brand_lab: string | null;
  revenue_current: number;
  margin_current: number;
  quantity_sold_current: number;
  revenue_comparison: number;
  margin_comparison: number;
  quantity_sold_comparison: number;
  revenue_evolution: number;
  margin_evolution: number;
  quantity_sold_evolution: number;
}

/**
 * API pour récupérer le CA, la marge et la quantité vendue d'un segment donné, avec comparaison et détails par marque.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ segmentData: SegmentData; brandDetails: SegmentData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { segment, type, pharmacies, dateRange, comparisonDateRange } = req.body;

    // 📌 Vérification des paramètres requis
    if (!segment || !type || !dateRange || dateRange.length !== 2 || !comparisonDateRange || comparisonDateRange.length !== 2) {
      return res.status(400).json({ error: "Paramètres manquants ou invalides" });
    }

    const query = `
    WITH filtered_products AS (
        -- 🟢 Sélectionne les produits appartenant au segment donné
        SELECT 
            dgp.code_13_ref,
            dgp.brand_lab,
            dgp.tva_percentage
        FROM data_globalproduct dgp
        WHERE dgp.${type} = $1
    )

    , sales_data AS (
        -- 🔹 Données globales actuelles
        SELECT 
            NULL AS brand_lab,  -- ✅ NULL pour les données globales
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
        WHERE ($2::uuid[] IS NULL OR dip.pharmacy_id = ANY($2))
          AND ds.date BETWEEN $3 AND $4
        GROUP BY period

        UNION ALL

        -- 🔹 Données globales de comparaison
        SELECT 
            NULL AS brand_lab,
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
        WHERE ($2::uuid[] IS NULL OR dip.pharmacy_id = ANY($2))
          AND ds.date BETWEEN $5 AND $6
        GROUP BY period
    )

    , brand_sales_data AS (
        -- 🔹 Données détaillées par marque
        SELECT 
            fp.brand_lab,
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
        WHERE fp.brand_lab IS NOT NULL
          AND ($2::uuid[] IS NULL OR dip.pharmacy_id = ANY($2))
          AND ds.date BETWEEN $3 AND $4
        GROUP BY fp.brand_lab, period

        UNION ALL

        -- 🔹 Données comparatives par marque
        SELECT 
            fp.brand_lab,
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
        WHERE fp.brand_lab IS NOT NULL
          AND ($2::uuid[] IS NULL OR dip.pharmacy_id = ANY($2))
          AND ds.date BETWEEN $5 AND $6
        GROUP BY fp.brand_lab, period
    )

    SELECT 
        sd.brand_lab,
        COALESCE(SUM(CASE WHEN sd.period = 'current' THEN sd.revenue END), 0) AS revenue_current,
        COALESCE(SUM(CASE WHEN sd.period = 'current' THEN sd.margin END), 0) AS margin_current,
        COALESCE(SUM(CASE WHEN sd.period = 'current' THEN sd.quantity_sold END), 0) AS quantity_sold_current,
        COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.revenue END), 0) AS revenue_comparison,
        COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.margin END), 0) AS margin_comparison,
        COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.quantity_sold END), 0) AS quantity_sold_comparison,
        ROUND(
          (COALESCE(SUM(CASE WHEN sd.period = 'current' THEN sd.revenue END), 0) - 
           COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.revenue END), 0)) 
          * 100 / NULLIF(COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.revenue END), 0), 0), 2) 
          AS revenue_evolution,
        ROUND(
          (COALESCE(SUM(CASE WHEN sd.period = 'current' THEN sd.margin END), 0) - 
           COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.margin END), 0)) 
          * 100 / NULLIF(COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.margin END), 0), 0), 2) 
          AS margin_evolution,
        ROUND(
          (COALESCE(SUM(CASE WHEN sd.period = 'current' THEN sd.quantity_sold END), 0) - 
           COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.quantity_sold END), 0)) 
          * 100 / NULLIF(COALESCE(SUM(CASE WHEN sd.period = 'comparison' THEN sd.quantity_sold END), 0), 0), 2) 
          AS quantity_sold_evolution
    FROM (
        SELECT * FROM sales_data
        UNION ALL
        SELECT * FROM brand_sales_data
    ) sd
    GROUP BY sd.brand_lab;
    `;

    const { rows } = await pool.query(query, [
      segment,
      pharmacies?.length > 0 ? pharmacies : null,
      dateRange[0], dateRange[1],
      comparisonDateRange[0], comparisonDateRange[1]
    ]);

    const segmentData = rows.find(row => row.brand_lab === null);
    const brandDetails = rows.filter(row => row.brand_lab !== null);

    console.log('brandDetails', brandDetails)
    return res.status(200).json({ segmentData, brandDetails });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}