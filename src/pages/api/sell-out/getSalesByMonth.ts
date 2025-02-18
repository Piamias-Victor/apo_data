import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface SalesData {
  month: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
}

/**
 * API pour récupérer les ventes (Sell-Out) et achats (Sell-In) par mois,
 * fonctionnant à la fois pour les laboratoires et les éléments de segmentation.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ salesData: SalesData[] } | { error: string }>
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
    SELECT dgp.code_13_ref, dgp.tva_percentage
    FROM data_globalproduct dgp
    WHERE 
        ($1::text[] IS NULL OR dgp.lab_distributor = ANY($1))  -- 🔹 Laboratoires
        AND ($2::text[] IS NULL OR dgp.range_name = ANY($2))    -- 🔹 Gammes
        AND ($3::text[] IS NULL OR dgp.universe = ANY($3))      -- 🔹 Univers (Segmentation)
        AND ($4::text[] IS NULL OR dgp.category = ANY($4))      -- 🔹 Catégories (Segmentation)
        AND ($5::text[] IS NULL OR dgp.sub_category = ANY($5))  -- 🔹 Sous-catégories (Segmentation)
        AND ($6::text[] IS NULL OR dgp.brand_lab = ANY($6))     -- 🔹 Marques
        AND ($7::text[] IS NULL OR dgp.family = ANY($7))        -- 🔹 Familles (Segmentation)
        AND ($8::text[] IS NULL OR dgp.sub_family = ANY($8))    -- 🔹 Sous-familles (Segmentation)
        AND ($9::text[] IS NULL OR dgp.specificity = ANY($9))   -- 🔹 Spécificités (Segmentation)
),

purchase_data AS (
    SELECT 
        TO_CHAR(dor.sent_date, 'YYYY-MM') AS month,
        SUM(dpo.qte + dpo.qte_ug) AS purchase_quantity,  -- ✅ Ajout des urgences
        SUM((dpo.qte + dpo.qte_ug) * COALESCE(
            (SELECT AVG(dis.weighted_average_price) 
             FROM data_inventorysnapshot dis 
             WHERE dis.product_id = dip.id), 0
        )) AS purchase_amount  -- ✅ Ajustement du montant d'achat
    FROM data_productorder dpo
    JOIN data_order dor ON dpo.order_id = dor.id
    JOIN data_internalproduct dip ON dpo.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ($10::uuid[] IS NULL OR dor.pharmacy_id = ANY($10::uuid[]))
    GROUP BY month
)

SELECT 
    month,
    COALESCE(SUM(total_quantity), 0) AS total_quantity,
    COALESCE(SUM(revenue), 0) AS revenue,
    COALESCE(SUM(margin), 0) AS margin,
    COALESCE(SUM(purchase_quantity), 0) AS purchase_quantity,
    COALESCE(SUM(purchase_amount), 0) AS purchase_amount
FROM (
    -- 🔹 VENTES (SELL-OUT)
    SELECT 
        TO_CHAR(ds.date, 'YYYY-MM') AS month,
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue,
        SUM(
            (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
            * ds.quantity
        ) AS margin,
        0 AS purchase_quantity,
        0 AS purchase_amount
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY month

    UNION ALL

    -- 🔹 ACHATS (SELL-IN) - Utilisation de la sous-requête pour éviter les doublons
    SELECT 
        month,
        0 AS total_quantity,
        0 AS revenue,
        0 AS margin,
        purchase_quantity,
        purchase_amount
    FROM purchase_data
) combined_data

GROUP BY month
ORDER BY month ASC;
    `;

    const { rows } = await pool.query<SalesData>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null, // ✅ Univers ajouté
      filters.categories.length > 0 ? filters.categories : null, // ✅ Catégories ajoutées
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.families.length > 0 ? filters.families : null, // ✅ Familles ajoutées
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null, // ✅ Spécificités ajoutées
      filters.pharmacies.length > 0 ? filters.pharmacies.map(id => id) : null, // ✅ Correction: Assure un tableau d'UUID
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée" });
    }

    return res.status(200).json({ salesData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}