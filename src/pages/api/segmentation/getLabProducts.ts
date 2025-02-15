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
  avg_margin: number;
  pharmacies_in_stock: number;
  total_quantity_sold: number;
}

/**
 * API pour récupérer les produits d'un laboratoire avec prix, marges moyennes et quantités vendues
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ products: LabProduct[] } | { error: string }>
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
        ORDER BY dis.product_id, dip.pharmacy_id, dis.date DESC
    )

    , sales_data AS (
        -- Calcul des ventes et marges sur les 12 derniers mois
        SELECT 
            dip.code_13_ref_id AS code_13_ref,
            SUM(ds.quantity) AS total_quantity_sold, -- ✅ Quantité totale vendue sur 12 mois
            AVG(dis.price_with_tax) AS avg_sale_price, -- ✅ Prix de vente moyen
            MIN(dis.price_with_tax) AS min_sale_price, -- ✅ Prix de vente minimum
            MAX(dis.price_with_tax) AS max_sale_price, -- ✅ Prix de vente maximum
            AVG(lis.weighted_average_price) AS avg_purchase_price, -- ✅ Prix d'achat moyen
            AVG(
                (dis.price_with_tax - (lis.weighted_average_price * (1 + (COALESCE(fp.tva_percentage, 0) / 100))))
            ) AS avg_margin -- ✅ Marge moyenne
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
        LEFT JOIN latest_inventory_snapshot lis ON lis.product_id = dis.product_id AND lis.pharmacy_id = dip.pharmacy_id
        WHERE ds.date >= CURRENT_DATE - interval '12 months'
        GROUP BY dip.code_13_ref_id
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
        GROUP BY dip.code_13_ref_id
    )

    SELECT 
        fp.*,
        ROUND(COALESCE(sd.avg_sale_price, 0), 2) AS avg_sale_price,
        ROUND(COALESCE(sd.min_sale_price, 0), 2) AS min_sale_price,
        ROUND(COALESCE(sd.max_sale_price, 0), 2) AS max_sale_price,
        ROUND(COALESCE(sd.avg_purchase_price, 0), 2) AS avg_purchase_price,
        ROUND(COALESCE(sd.avg_margin, 0), 2) AS avg_margin,
        COALESCE(st.pharmacies_in_stock, 0) AS pharmacies_in_stock,
        COALESCE(sd.total_quantity_sold, 0) AS total_quantity_sold
    FROM filtered_products fp
    LEFT JOIN sales_data sd ON fp.code_13_ref = sd.code_13_ref
    LEFT JOIN stock_data st ON fp.code_13_ref = st.code_13_ref
    ORDER BY fp.name ASC;
    `;

    // Exécution de la requête SQL
    const { rows } = await pool.query<LabProduct>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.ranges.length > 0 ? filters.ranges : null,
      filters.universes.length > 0 ? filters.universes : null,
      filters.categories.length > 0 ? filters.categories : null,
      filters.subCategories.length > 0 ? filters.subCategories : null,
      filters.brands.length > 0 ? filters.brands : null,
      filters.families.length > 0 ? filters.families : null,
      filters.subFamilies.length > 0 ? filters.subFamilies : null,
      filters.specificities.length > 0 ? filters.specificities : null
    ]);


    // 🏆 Trier les produits par quantité vendue et afficher les 10 premiers dans le log

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucun produit trouvé" });
    }

    return res.status(200).json({ products: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des produits :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}