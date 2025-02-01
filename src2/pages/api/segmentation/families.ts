import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/libs/fetch/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ family: string; sub_families: string[] }[] | { error: string }>
) {
  try {
    const query = `
      SELECT DISTINCT family, sub_family
      FROM data_globalproduct
      WHERE family IS NOT NULL
      ORDER BY family ASC, sub_family ASC;
    `;

    const result = await pool.query<{ family: string; sub_family: string }>(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucune famille trouvée" });
    }

    // Transformation des résultats en structure organisée
    const familyMap: { [key: string]: string[] } = {};

    result.rows.forEach(({ family, sub_family }) => {
      if (!familyMap[family]) {
        familyMap[family] = [];
      }
      if (sub_family && !familyMap[family].includes(sub_family)) {
        familyMap[family].push(sub_family);
      }
    });

    const families = Object.keys(familyMap).map(fam => ({
      family: fam,
      sub_families: familyMap[fam]
    }));

    return res.status(200).json(families);
  } catch (error) {
    console.error("Erreur lors de la récupération des familles :", error);
    return res.status(500).json({ error: "Échec de la récupération des données depuis la base" });
  }
}