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
 * API pour récupérer les ventes (Sell-Out) et achats (Sell-In) par mois
 * en évitant les doublons et en filtrant correctement les produits.
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

    if (!filters || !filters.distributors || !filters.ranges) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    // Requête SQL pour récupérer Sell-Out & Sell-In par mois
    const query = `
                    WITH filtered_products AS (
                        -- 🟢 Sélection des produits filtrés en fonction des critères
                        SELECT dgp.code_13_ref, dgp.tva_percentage
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
                    )

                    -- 🔄 RÉCUPÉRER TOUTES LES DONNÉES GROUPÉES PAR MOIS
                    SELECT 
                        month,
                        COALESCE(SUM(total_quantity), 0) AS total_quantity,
                        COALESCE(SUM(revenue), 0) AS revenue,
                        COALESCE(SUM(margin), 0) AS margin,
                        COALESCE(SUM(purchase_quantity), 0) AS purchase_quantity,
                        COALESCE(SUM(purchase_amount), 0) AS purchase_amount
                    FROM (
                        -- 🟢 1️⃣ RÉCUPÉRER LES VENTES (SELL-OUT)
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
                        GROUP BY month

                        UNION ALL

                        -- 🔵 2️⃣ RÉCUPÉRER LES ACHATS (SELL-IN) EN ÉVITANT LES DOUBLONS
                        SELECT 
                            subquery.month,
                            0 AS total_quantity,
                            0 AS revenue,
                            0 AS margin,
                            SUM(subquery.qte) AS purchase_quantity,
                            SUM(subquery.purchase_amount) AS purchase_amount
                        FROM (
                            -- 🛑 Éviter les doublons en prenant une seule ligne par order_id + produit
                            SELECT DISTINCT ON (dor.id, dip.name) 
                                TO_CHAR(dor.sent_date, 'YYYY-MM') AS month,
                                dpo.qte,
                                (dpo.qte * dis.weighted_average_price) AS purchase_amount
                            FROM data_productorder dpo
                            JOIN data_order dor ON dpo.order_id = dor.id
                            JOIN data_internalproduct dip ON dpo.product_id = dip.id
                            JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
                            JOIN data_inventorysnapshot dis ON dip.id = dis.product_id
                            ORDER BY dor.id, dip.name -- ✅ Évite les doublons en gardant une seule entrée
                        ) subquery
                        GROUP BY subquery.month
                    ) combined_data -- 🔄 Fusionne Sell-Out et Sell-In

                    GROUP BY month -- ✅ Groupement final par mois
                    ORDER BY month ASC;
    `;

    // Exécution de la requête SQL avec les filtres
    const { rows } = await pool.query<SalesData>(query, [
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
      return res.status(404).json({ error: "Aucune donnée trouvée" });
    }

    return res.status(200).json({ salesData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}