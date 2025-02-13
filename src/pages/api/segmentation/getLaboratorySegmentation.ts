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
    const { filters } = req.body;

    // ✅ Vérifier si au moins un laboratoire OU une marque est sélectionné(e)
    if (!filters || (filters.distributors.length === 0 && filters.brands.length === 0)) {
      return res.status(400).json({ error: "Aucun laboratoire ou marque sélectionné" });
    }

    const query = `
      SELECT DISTINCT 
          universe, 
          category, 
          sub_category, 
          family, 
          sub_family, 
          specificity,
          range_name
      FROM data_globalproduct
      WHERE 
        (lab_distributor = ANY($1) OR brand_lab = ANY($2))  -- 🔹 Filtre UNIQUEMENT par laboratoire ou marque
      ORDER BY universe, category, sub_category, family, sub_family, specificity, range_name;
    `;

    const { rows } = await pool.query<Segmentation & { range_name: string }>(query, [
      filters.distributors.length > 0 ? filters.distributors : null,
      filters.brands.length > 0 ? filters.brands : null,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée pour ce laboratoire ou cette marque" });
    }

    // 🔹 Regrouper les gammes (`range_name`) par combinaison unique des autres critères
    const segmentationMap = new Map<string, Segmentation>();

    rows.forEach(({ universe, category, sub_category, family, sub_family, specificity, range_name }) => {
      const key = `${universe}-${category}-${sub_category}-${family}-${sub_family}-${specificity}`;

      if (!segmentationMap.has(key)) {
        segmentationMap.set(key, {
          universe,
          category,
          sub_category,
          family,
          sub_family,
          specificity,
          ranges: [],
        });
      }

      if (range_name && !segmentationMap.get(key)!.ranges.includes(range_name)) {
        segmentationMap.get(key)!.ranges.push(range_name);
      }
    });

    return res.status(200).json({ segmentation: Array.from(segmentationMap.values()) });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}