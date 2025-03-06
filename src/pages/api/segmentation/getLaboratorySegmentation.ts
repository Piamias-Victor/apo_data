import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface Segmentation {
  universe: string;
  category: string;
  sub_category: string;
  family: string;
  sub_family: string;
  specificity: string;
  ranges: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ segmentation: Segmentation[] } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { filters, brand } = req.body; // Ajout du filtre "brand"

    // ✅ Vérifier si au moins un laboratoire OU une marque est sélectionné(e)
    if (
      !filters ||
      (!filters.pharmacies.length &&
        !filters.distributors.length &&
        !filters.brands.length &&
        !filters.universes.length &&
        !filters.categories.length &&
        !filters.families.length &&
        !filters.specificities.length &&
        !brand) // S'assurer qu'au moins un filtre ou une brand spécifique est fournie
    ) {
      return res.status(400).json({ error: "Filtres invalides" });
    }

    const query = `
    SELECT DISTINCT 
        universe, 
        category, 
        sub_category, 
        family, 
        sub_family, 
        specificity,
        range_name,
        lab_distributor,
        brand_lab
    FROM data_globalproduct
    WHERE 
      (lab_distributor = ANY($1) OR brand_lab = ANY($2))  
      ${brand ? "AND brand_lab = $3" : ""}  -- Filtrer par brand si elle est fournie
    ORDER BY lab_distributor, brand_lab, universe, category, sub_category, family, sub_family, specificity, range_name;
  `;

    const queryParams = [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.brands.length > 0 ? filters.brands : null,
    ];

    if (brand) {
      queryParams.push(brand); // Ajouter la brand comme paramètre si elle est définie
    }

    const { rows } = await pool.query<Segmentation & { range_name: string; lab_distributor: string; brand_lab: string }>(
      query,
      queryParams
    );

    // 🔹 Regrouper les gammes (`range_name`) par combinaison unique des autres critères, en ajoutant `lab_distributor` et `brand_lab`
    const segmentationMap = new Map<string, Segmentation & { lab_distributor: string; brand_lab: string }>();

    rows.forEach(({ universe, category, sub_category, family, sub_family, specificity, range_name, lab_distributor, brand_lab }) => {
      const key = `${lab_distributor}-${brand_lab}-${universe}-${category}-${sub_category}-${family}-${sub_family}-${specificity}`;

      if (!segmentationMap.has(key)) {
        segmentationMap.set(key, {
          universe,
          category,
          sub_category,
          family,
          sub_family,
          specificity,
          ranges: [],
          lab_distributor,
          brand_lab,
        });
      }

      if (range_name && !segmentationMap.get(key)!.ranges.includes(range_name)) {
        segmentationMap.get(key)!.ranges.push(range_name);
      }
    });

    console.log('Array.from(segmentationMap.values())', Array.from(segmentationMap.values()));

    return res.status(200).json({ segmentation: Array.from(segmentationMap.values()) });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}