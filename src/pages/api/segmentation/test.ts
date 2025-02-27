import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface Segmentation {
  lab_name: string;
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
  res: NextApiResponse<{ segmentation: Record<string, Segmentation[]> } | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { labs } = req.body; // Liste des laboratoires sélectionnés

    if (!labs || !Array.isArray(labs) || labs.length === 0) {
      return res.status(400).json({ error: "Aucun laboratoire valide spécifié" });
    }

    const query = `
      SELECT DISTINCT 
          lab_distributor AS lab_name,
          universe, 
          category, 
          sub_category, 
          family, 
          sub_family, 
          specificity,
          range_name
      FROM data_globalproduct
      WHERE lab_distributor = ANY($1) OR brand_lab = ANY($1)
      ORDER BY lab_distributor, universe, category, sub_category, family, sub_family, specificity, range_name;
    `;

    const { rows } = await pool.query<Segmentation & { range_name: string }>(query, [labs]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée pour ces laboratoires" });
    }

    // 🔹 Regrouper les données de segmentation par laboratoire
    const segmentationByLab: Record<string, Segmentation[]> = {};

    rows.forEach(({ lab_name, universe, category, sub_category, family, sub_family, specificity, range_name }) => {
      if (!segmentationByLab[lab_name]) {
        segmentationByLab[lab_name] = [];
      }

      const key = `${universe}-${category}-${sub_category}-${family}-${sub_family}-${specificity}`;

      let segmentationItem = segmentationByLab[lab_name].find((seg) => 
        seg.universe === universe &&
        seg.category === category &&
        seg.sub_category === sub_category &&
        seg.family === family &&
        seg.sub_family === sub_family &&
        seg.specificity === specificity
      );

      if (!segmentationItem) {
        segmentationItem = {
          lab_name,
          universe,
          category,
          sub_category,
          family,
          sub_family,
          specificity,
          ranges: [],
        };
        segmentationByLab[lab_name].push(segmentationItem);
      }

      if (range_name && !segmentationItem.ranges.includes(range_name)) {
        segmentationItem.ranges.push(range_name);
      }
    });

    return res.status(200).json({ segmentation: segmentationByLab });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}