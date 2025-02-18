import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

// Interface des produits retournés avec les nouvelles données financières
interface LabProduct {
  code_13_ref: string;
  name: string;
  lab_distributor: string;
  brand_lab: string;
  category: string;
  sub_category: string;
  universe: string;
  range_name: string;
  family: string;
  sub_family: string;
  specificity: string;
  tva_percentage: number;
  avg_sale_price: number;
  min_sale_price: number;
  max_sale_price: number;
  avg_purchase_price: number;
  avg_margin: number; // ✅ Marge moyenne en euros
  pharmacies_in_stock: number;
  total_quantity_sold: number;
  revenue_share: number; // ✅ Part du CA sur le CA total du labo
  margin_share: number; // ✅ Part de la marge sur la marge totale du labo
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ products: LabProduct[] } | { error: string }>
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
        SELECT 
            dgp.code_13_ref, 
            dgp.name,  
            dgp.lab_distributor, 
            dgp.brand_lab, 
            dgp.category, 
            dgp.sub_category, 
            dgp.universe, 
            dgp.range_name, 
            dgp.family, 
            dgp.sub_family, 
            dgp.specificity, 
            dgp.tva_percentage
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
        -- Récupère l'inventaire des 12 derniers mois pour chaque produit/pharmacie
        SELECT DISTINCT ON (dis.product_id, dip.pharmacy_id) 
            dis.product_id,
            dip.pharmacy_id,
            dis.weighted_average_price
        FROM data_inventorysnapshot dis
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        WHERE dis.date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10)) -- ✅ Filtre par pharmacies
        ORDER BY dis.product_id, dip.pharmacy_id, dis.date DESC
    )

    , sales_data AS (
        -- Calcul des ventes et marges sur les 12 derniers mois
        SELECT 
            dip.code_13_ref_id AS code_13_ref,
            SUM(ds.quantity) AS total_quantity_sold, -- ✅ Quantité totale vendue sur 12 mois
            SUM(ds.quantity * dis.price_with_tax) AS revenue, -- ✅ CA du produit
            AVG(dis.price_with_tax) AS avg_sale_price, -- ✅ Prix de vente moyen
            MIN(dis.price_with_tax) AS min_sale_price, -- ✅ Prix de vente minimum
            MAX(dis.price_with_tax) AS max_sale_price, -- ✅ Prix de vente maximum
            AVG(lis.weighted_average_price) AS avg_purchase_price, -- ✅ Prix d'achat moyen
            -- ✅ Correction : Calcul de la marge moyenne en euros
            ROUND(
                (AVG(dis.price_with_tax) / (1 + COALESCE(fp.tva_percentage, 0) / 100)) -- Prix de vente HT moyen
                - AVG(lis.weighted_average_price), 2 -- Prix d'achat moyen
            ) AS avg_margin
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        LEFT JOIN latest_inventory_snapshot lis ON lis.product_id = dis.product_id 
            AND lis.pharmacy_id = dip.pharmacy_id
        WHERE ds.date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10)) -- ✅ Filtre par pharmacies
        GROUP BY dip.code_13_ref_id, fp.tva_percentage
    )

    , stock_data AS (
        -- Nombre de pharmacies ayant eu le produit en stock sur les 12 derniers mois
        SELECT 
            dip.code_13_ref_id AS code_13_ref,
            COUNT(DISTINCT dip.pharmacy_id) AS pharmacies_in_stock
        FROM data_inventorysnapshot dis
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        WHERE dis.date >= CURRENT_DATE - interval '12 months'
        AND ($10::uuid[] IS NULL OR dip.pharmacy_id = ANY($10)) -- ✅ Filtre par pharmacies
        GROUP BY dip.code_13_ref_id
    )

    , lab_totals AS (
        -- ✅ Calcul du CA total et de la marge totale du laboratoire
        SELECT 
            SUM(sd.revenue) AS total_lab_revenue,
            SUM(sd.avg_margin * sd.total_quantity_sold) AS total_lab_margin
        FROM sales_data sd
    )

    SELECT 
        fp.*,
        ROUND(COALESCE(sd.avg_sale_price, 0), 2) AS avg_sale_price,
        ROUND(COALESCE(sd.min_sale_price, 0), 2) AS min_sale_price,
        ROUND(COALESCE(sd.max_sale_price, 0), 2) AS max_sale_price,
        ROUND(COALESCE(sd.avg_purchase_price, 0), 2) AS avg_purchase_price,
        ROUND(COALESCE(sd.avg_margin, 0), 2) AS avg_margin, -- ✅ Marge moyenne en € (non en %)
        COALESCE(st.pharmacies_in_stock, 0) AS pharmacies_in_stock,
        COALESCE(sd.total_quantity_sold, 0) AS total_quantity_sold,
        ROUND((sd.revenue / NULLIF(lt.total_lab_revenue, 0)) * 100, 2) AS revenue_share, -- ✅ Part du CA en %
        ROUND((sd.avg_margin * sd.total_quantity_sold / NULLIF(lt.total_lab_margin, 0)) * 100, 2) AS margin_share -- ✅ Part de la marge en %
    FROM filtered_products fp
    LEFT JOIN sales_data sd ON fp.code_13_ref = sd.code_13_ref
    LEFT JOIN stock_data st ON fp.code_13_ref = st.code_13_ref
    CROSS JOIN lab_totals lt -- ✅ Utilisation des totaux pour calculer les parts
    ORDER BY revenue_share DESC;
    `;

    const { rows } = await pool.query<LabProduct>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null,
      filters.pharmacies.length > 0 ? filters.pharmacies.map((id) => id) : null,
    ]);

    return res.status(200).json({ products: rows });
  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
}