import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface pour structurer les données retournées
interface LabRevenuePosition {
  segment: string; // 🔹 Univers, Catégorie ou Famille
  type: "universe" | "category" | "family"; // 🔹 Indique le niveau de segmentation
  revenue: number; // 🔹 CA du labo/marque
  globalRevenue: number; // 🔹 CA total du marché
  margin: number; // 🔹 Marge calculée (en tenant compte de la TVA)
}

/**
 * API pour récupérer le CA et la marge d'un laboratoire/marque par segment (univers, catégorie et famille)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ labRevenuePosition: LabRevenuePosition[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters || (!filters.distributors && !filters.brands)) {
      return res.status(400).json({ error: "Un laboratoire ou une marque est requis" });
    }

    // ✅ Déterminer le critère principal (labo ou marque)
    const filterType = filters.distributors?.length ? "lab_distributor" : "brand_lab";
    const filterValue = filters.distributors?.length ? filters.distributors[0] : filters.brands[0];

    const query = `
    WITH filtered_products AS (
        -- 🟢 Sélectionne les produits du laboratoire ou de la marque cible
        SELECT 
            dgp.code_13_ref,
            dgp.universe,
            dgp.category,
            dgp.family,
            dgp.tva_percentage
        FROM data_globalproduct dgp
        WHERE dgp.${filterType} = $1
    )

    , sales_lab AS (
        -- 🔹 CA et Marge du laboratoire/marque par segment
        SELECT 
            COALESCE(fp.universe, 'Autre') AS segment,
            'universe' AS type,
            SUM(ds.quantity * dis.price_with_tax) AS revenue,
            SUM(
                (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
                * ds.quantity
            ) AS margin
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        GROUP BY fp.universe

        UNION ALL

        SELECT 
            COALESCE(fp.category, 'Autre') AS segment,
            'category' AS type,
            SUM(ds.quantity * dis.price_with_tax) AS revenue,
            SUM(
                (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
                * ds.quantity
            ) AS margin
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        GROUP BY fp.category

        UNION ALL

        SELECT 
            COALESCE(fp.family, 'Autre') AS segment,
            'family' AS type,
            SUM(ds.quantity * dis.price_with_tax) AS revenue,
            SUM(
                (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
                * ds.quantity
            ) AS margin
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        GROUP BY fp.family
    )

    , sales_global AS (
        -- 🔹 CA global du marché par segment
        SELECT 
            COALESCE(dgp.universe, 'Autre') AS segment,
            'universe' AS type,
            SUM(ds.quantity * dis.price_with_tax) AS global_revenue
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        GROUP BY dgp.universe

        UNION ALL

        SELECT 
            COALESCE(dgp.category, 'Autre') AS segment,
            'category' AS type,
            SUM(ds.quantity * dis.price_with_tax) AS global_revenue
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        GROUP BY dgp.category

        UNION ALL

        SELECT 
            COALESCE(dgp.family, 'Autre') AS segment,
            'family' AS type,
            SUM(ds.quantity * dis.price_with_tax) AS global_revenue
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        GROUP BY dgp.family
    )

    -- 🔹 Fusion des résultats pour univers, catégories et familles
    SELECT 
        sg.segment,
        sg.type,
        COALESCE(sl.revenue, 0) AS revenue,   
        COALESCE(sg.global_revenue, 0) AS globalRevenue,  
        COALESCE(sl.margin, 0) AS margin
    FROM sales_global sg
    LEFT JOIN sales_lab sl 
    ON COALESCE(sg.segment, '') = COALESCE(sl.segment, '') AND sg.type = sl.type
    WHERE COALESCE(sl.revenue, 0) > 0 -- 🔹 Exclure les segments où le labo/marque n'a pas de ventes
    ORDER BY sg.type, globalRevenue DESC, revenue DESC;
    `;

    const { rows } = await pool.query<LabRevenuePosition>(query, [filterValue]);

    return res.status(200).json({ labRevenuePosition: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du positionnement du laboratoire/marque :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}