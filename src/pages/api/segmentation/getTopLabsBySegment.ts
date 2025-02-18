import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface pour structurer les données retournées
interface LabMarketShare {
  laboratoire: string;
  total_sales: number;
  chiffre_affaires: number;
  total_margin: number;
  part_de_marche: number;
  part_de_marge: number;
}

/**
 * API pour récupérer le top 5 des laboratoires dans un segment donné, avec option de filtrage par pharmacie.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ labs: LabMarketShare[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { segment, type, pharmacies } = req.body;

    if (!segment || !type) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    const query = `
    WITH filtered_products AS (
        -- 🟢 Sélectionne les produits appartenant au segment donné
        SELECT 
            dgp.code_13_ref,
            dgp.lab_distributor,
            dgp.tva_percentage
        FROM data_globalproduct dgp
        WHERE dgp.${type} = $1
    )

    , sales_data AS (
        -- 🔹 Calcul des ventes et de la marge par laboratoire
        SELECT 
            fp.lab_distributor AS laboratoire,
            SUM(ds.quantity * dis.price_with_tax) AS total_sales,
            SUM(ds.quantity * dis.price_with_tax) AS chiffre_affaires,
            SUM(
                (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
                * ds.quantity
            ) AS total_margin
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE ($2::uuid[] IS NULL OR dip.pharmacy_id = ANY($2)) -- ✅ Filtrage par pharmacies
        GROUP BY fp.lab_distributor
    )

    , market_totals AS (
        -- 🔹 Calcul des ventes et marges globales sur ce segment
        SELECT 
            SUM(total_sales) AS global_sales,
            SUM(total_margin) AS global_margin
        FROM sales_data
    )

    -- 🔹 Sélection du Top 5 laboratoires avec calcul des parts de marché
    SELECT 
        sd.laboratoire, 
        ROUND(sd.total_sales, 2) AS total_sales,
        ROUND(sd.chiffre_affaires, 2) AS chiffre_affaires,
        ROUND(sd.total_margin, 2) AS total_margin,
        ROUND((sd.total_sales * 100.0) / NULLIF(mt.global_sales, 0), 2) AS part_de_marche,
        ROUND((sd.total_margin * 100.0) / NULLIF(mt.global_margin, 0), 2) AS part_de_marge
    FROM sales_data sd
    CROSS JOIN market_totals mt
    WHERE sd.total_sales > 0
    ORDER BY total_sales DESC
    LIMIT 5;
    `;

    const { rows } = await pool.query<LabMarketShare>(query, [
      segment,
      pharmacies?.length > 0 ? pharmacies : null, // ✅ S'assurer que les pharmacies sont bien prises en compte
    ]);

    return res.status(200).json({ labs: rows });
  } catch (error) {
    console.error("❌ Erreur dans le handler:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}