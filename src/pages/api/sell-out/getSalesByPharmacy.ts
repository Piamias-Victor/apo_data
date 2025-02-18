import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface PharmacySales {
  pharmacy_id: string;
  pharmacy_name: string;
  id_nat: string;
  address: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
}

/**
 * API pour récupérer les ventes et achats d'un laboratoire ou marque par pharmacie avec segmentation.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ pharmacySales: PharmacySales[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters || (!filters.distributors.length && !filters.brands.length)) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const query = `
WITH filtered_products AS (
    SELECT dgp.code_13_ref, dgp.tva_percentage
    FROM data_globalproduct dgp
    WHERE 
        ($1::text[] IS NULL OR dgp.lab_distributor = ANY($1))  -- 🔹 Filtre par laboratoire
        AND ($2::text[] IS NULL OR dgp.brand_lab = ANY($2))  -- 🔹 Filtre par marque
        AND ($3::text[] IS NULL OR dgp.range_name = ANY($3))  -- 🔹 Filtre par gamme
        AND ($4::text[] IS NULL OR dgp.universe = ANY($4))  -- 🔹 Filtre par univers
        AND ($5::text[] IS NULL OR dgp.category = ANY($5))  -- 🔹 Filtre par catégorie
        AND ($6::text[] IS NULL OR dgp.sub_category = ANY($6))  -- 🔹 Filtre par sous-catégorie
        AND ($7::text[] IS NULL OR dgp.family = ANY($7))  -- 🔹 Filtre par famille
        AND ($8::text[] IS NULL OR dgp.sub_family = ANY($8))  -- 🔹 Filtre par sous-famille
        AND ($9::text[] IS NULL OR dgp.specificity = ANY($9))  -- 🔹 Filtre par spécificité
),
pharmacy_sell_out AS (
    -- 🟢 Ventes (Sell-Out) par pharmacie
    SELECT 
        dip.pharmacy_id,
        dp.name AS pharmacy_name,
        dp.id_nat,
        dp.address,
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue,
        SUM((dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) * ds.quantity) AS margin
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN data_pharmacy dp ON dip.pharmacy_id = dp.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    GROUP BY dip.pharmacy_id, dp.name, dp.id_nat, dp.address
),
pharmacy_sell_in AS (
    -- 🔵 Achats (Sell-In) par pharmacie
    SELECT 
        dip.pharmacy_id,
        dp.name AS pharmacy_name,
        dp.id_nat,
        dp.address,
        SUM(dpo.qte) AS purchase_quantity,
        SUM(dpo.qte * closest_snapshot.weighted_average_price) AS purchase_amount
    FROM data_productorder dpo
    JOIN data_order dor ON dpo.order_id = dor.id
    JOIN data_internalproduct dip ON dpo.product_id = dip.id
    JOIN data_pharmacy dp ON dip.pharmacy_id = dp.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    JOIN LATERAL (
        SELECT dis.weighted_average_price
        FROM data_inventorysnapshot dis
        WHERE dis.product_id = dip.id
        ORDER BY ABS(EXTRACT(EPOCH FROM (dis.date - dor.sent_date))) ASC
        LIMIT 1
    ) closest_snapshot ON TRUE
    GROUP BY dip.pharmacy_id, dp.name, dp.id_nat, dp.address
)
-- 🔄 Fusionner Sell-Out et Sell-In sur l'ID de la pharmacie
SELECT 
    COALESCE(so.pharmacy_id, si.pharmacy_id) AS pharmacy_id,
    COALESCE(so.pharmacy_name, si.pharmacy_name) AS pharmacy_name,
    COALESCE(so.id_nat, si.id_nat) AS id_nat,
    COALESCE(so.address, si.address) AS address,
    COALESCE(so.total_quantity, 0) AS total_quantity,
    COALESCE(so.revenue, 0) AS revenue,
    COALESCE(so.margin, 0) AS margin,
    COALESCE(si.purchase_quantity, 0) AS purchase_quantity,
    COALESCE(si.purchase_amount, 0) AS purchase_amount
FROM pharmacy_sell_out so
FULL OUTER JOIN pharmacy_sell_in si ON so.pharmacy_id = si.pharmacy_id
ORDER BY revenue DESC;
    `;

    // Exécution de la requête SQL avec les nouveaux filtres
    const { rows } = await pool.query<PharmacySales>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée" });
    }

    return res.status(200).json({ pharmacySales: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}