import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des données retournées
interface StockSalesData {
  month: string;
  total_avg_stock: number;
  total_quantity: number;
  total_stock_value: number;
  total_revenue: number;
}

/**
 * API pour récupérer la somme des moyennes des stocks, les quantités vendues, la valeur du stock et le CA TTC
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ stockSalesData: StockSalesData[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters } = req.body;

    if (!filters || (!filters.pharmacies.length && !filters.distributors.length && !filters.brands.length)) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const query = `
WITH filtered_products AS (
    SELECT dgp.code_13_ref
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

, latest_inventory_snapshot AS (
    -- Récupère le dernier inventory snapshot disponible par produit et pharmacie
    SELECT DISTINCT ON (dis.product_id, dip.pharmacy_id) 
        dis.product_id,
        dip.pharmacy_id,
        dis.weighted_average_price
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    ORDER BY dis.product_id, dip.pharmacy_id, dis.date DESC
)

, product_monthly_avg AS (
    -- Calcule la moyenne du stock par produit et par mois et associe le prix moyen pondéré
    SELECT 
        TO_CHAR(dis.date, 'YYYY-MM') AS month,
        dip.code_13_ref_id,
        AVG(dis.stock) AS product_avg_stock,
        MAX(lis.weighted_average_price) AS weighted_average_price -- Récupère le dernier prix MP
    FROM data_inventorysnapshot dis
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    LEFT JOIN latest_inventory_snapshot lis ON lis.product_id = dis.product_id AND lis.pharmacy_id = dip.pharmacy_id
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY month, dip.code_13_ref_id
)

, monthly_total_stock AS (
    -- Somme des moyennes des stocks par mois et calcul de la valeur du stock
    SELECT 
        month,
        SUM(product_avg_stock) AS total_avg_stock,
        SUM(product_avg_stock * weighted_average_price) AS total_stock_value -- ✅ Multiplie le stock par le prix MP
    FROM product_monthly_avg
    GROUP BY month
)

, sales_data AS (
    SELECT 
        TO_CHAR(ds.date, 'YYYY-MM') AS month,
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS total_revenue -- ✅ Multiplie la quantité vendue par le prix de vente
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id -- ✅ Correspondance directe via product_id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    WHERE ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10::uuid[]))
    GROUP BY month
)

, all_months AS (
    SELECT DISTINCT month FROM monthly_total_stock
    UNION
    SELECT DISTINCT month FROM sales_data
)

SELECT 
    am.month,
    ROUND(COALESCE(mts.total_avg_stock, 0), 2) AS total_avg_stock,  
    ROUND(COALESCE(mts.total_stock_value, 0), 2) AS total_stock_value, -- ✅ Valeur totale du stock
    COALESCE(sd.total_quantity, 0) AS total_quantity,
    ROUND(COALESCE(sd.total_revenue, 0), 2) AS total_revenue -- ✅ Ajout du CA TTC
FROM all_months am
LEFT JOIN monthly_total_stock mts ON am.month = mts.month
LEFT JOIN sales_data sd ON am.month = sd.month
ORDER BY am.month ASC;
    `;

    const { rows } = await pool.query<StockSalesData>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
      filters.pharmacies.length > 0 ? filters.pharmacies.map(id => id) : null, // ✅ Correction: Assure un tableau d'UUID
    ]);

    console.log("🟢 Résultats API:", rows);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée" });
    }

    return res.status(200).json({ stockSalesData: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des stocks et des ventes :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}