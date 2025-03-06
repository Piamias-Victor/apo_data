import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface SalesData {
  pharmacy_id: string;
  pharmacy_name: string;
  total_quantity: number;
  revenue: number;
  margin: number;
  purchase_quantity: number;
  purchase_amount: number;
  type: "current" | "comparison";
}

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
        !filters.specificities.length &&
        !filters.ean13Products.length) // ✅ Ajout du filtre EAN13
    ) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const { dateRange, comparisonDateRange } = filters;

    if (!dateRange || !comparisonDateRange) {
      return res.status(400).json({ error: "Périodes de filtrage manquantes" });
    }

    // ✅ Vérification et transformation des codes EAN13 en tableau de chaînes
    const ean13Products = filters.ean13Products?.length ? filters.ean13Products.map(String) : null;

    console.log("📌 Filtrage avec codes EAN13 :", ean13Products);

    const query = `
WITH filtered_products AS (
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
        AND ($10::text[] IS NULL OR dgp.code_13_ref = ANY($10)) -- ✅ Ajout du filtre par code 13
)

,sales_data AS (
    SELECT 
        dip.pharmacy_id,
        p.name AS pharmacy_name, 
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue,
        SUM(
            (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
            * ds.quantity
        ) AS margin,
        0 AS purchase_quantity,
        0 AS purchase_amount,
        'current' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    JOIN data_pharmacy p ON dip.pharmacy_id = p.id
    WHERE ($11::uuid[] IS NULL OR dip.pharmacy_id = ANY($11::uuid[]))
      AND ds.date BETWEEN $12 AND $13 
    GROUP BY dip.pharmacy_id, p.name

    UNION ALL

    SELECT 
        dip.pharmacy_id,
        p.name AS pharmacy_name, 
        SUM(ds.quantity) AS total_quantity,
        SUM(ds.quantity * dis.price_with_tax) AS revenue,
        SUM(
            (dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) 
            * ds.quantity
        ) AS margin,
        0 AS purchase_quantity,
        0 AS purchase_amount,
        'comparison' AS type
    FROM data_sales ds
    JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
    JOIN data_internalproduct dip ON dis.product_id = dip.id
    JOIN filtered_products fp ON dip.code_13_ref_id = fp.code_13_ref
    JOIN data_pharmacy p ON dip.pharmacy_id = p.id
    WHERE ($11::uuid[] IS NULL OR dip.pharmacy_id = ANY($11::uuid[]))
      AND ds.date BETWEEN $14 AND $15 
    GROUP BY dip.pharmacy_id, p.name
)

SELECT 
    pharmacy_id,
    pharmacy_name,
    COALESCE(SUM(total_quantity), 0) AS total_quantity,
    COALESCE(SUM(revenue), 0) AS revenue,
    COALESCE(SUM(margin), 0) AS margin,
    COALESCE(SUM(purchase_quantity), 0) AS purchase_quantity,
    COALESCE(SUM(purchase_amount), 0) AS purchase_amount,
    type
FROM sales_data
GROUP BY pharmacy_id, pharmacy_name, type
ORDER BY pharmacy_name, type ASC;
    `;

    // ✅ Vérification des paramètres SQL avant exécution
    const queryParams = [
      filters.distributors?.length ? filters.distributors : null,
      filters.ranges?.length ? filters.ranges : null,
      filters.universes?.length ? filters.universes : null,
      filters.categories?.length ? filters.categories : null,
      filters.subCategories?.length ? filters.subCategories : null,
      filters.brands?.length ? filters.brands : null,
      filters.families?.length ? filters.families : null,
      filters.subFamilies?.length ? filters.subFamilies : null,
      filters.specificities?.length ? filters.specificities : null,
      ean13Products, // ✅ Ajout du filtre par code 13
      filters.pharmacies?.length ? filters.pharmacies.map(String) : null,
      dateRange[0], dateRange[1], // Période principale
      comparisonDateRange[0], comparisonDateRange[1] // Période de comparaison
    ];

    console.log("📌 Paramètres SQL envoyés :", queryParams);

    // ✅ Exécution de la requête SQL avec gestion des erreurs
    try {
      const { rows } = await pool.query<SalesData>(query, queryParams);
      console.log("✅ Résultat retourné :", rows);
      return res.status(200).json({ salesData: rows });
    } catch (sqlError) {
      console.error("❌ Erreur SQL :", sqlError);
      return res.status(500).json({ error: "Erreur lors de l'exécution de la requête SQL" });
    }
  } catch (error) {
    console.error("❌ Erreur générale :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}