// src/pages/api/data_lab_distributors.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/libs/fetch/db";
import { LabDistributor } from '@/types/Brand';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LabDistributor[] | { error: string }>
) {
  try {
    const query = `
      WITH limited_lab_distributors AS (
        SELECT lab_distributor
        FROM data_globalproduct
        WHERE lab_distributor IS NOT NULL
        GROUP BY lab_distributor
        ORDER BY lab_distributor ASC
      )
      SELECT
        ld.lab_distributor,
        dg.brand_lab,
        COALESCE(array_agg(DISTINCT dg.range_name ORDER BY dg.range_name), ARRAY[]::text[]) AS range_names
      FROM
        limited_lab_distributors ld
      JOIN
        data_globalproduct dg
      ON
        ld.lab_distributor = dg.lab_distributor
      WHERE
        dg.brand_lab IS NOT NULL AND dg.range_name IS NOT NULL
      GROUP BY
        ld.lab_distributor,
        dg.brand_lab
      ORDER BY
        ld.lab_distributor ASC,
        dg.brand_lab ASC;
    `;

    const result = await pool.query<{
      lab_distributor: string;
      brand_lab: string;
      range_names: string[];
    }>(query);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Aucune information sur les distributeurs de laboratoires trouvée' });
    }

    const labDistributorsMap: { [labDistributor: string]: LabDistributor } = {};

    result.rows.forEach(row => {
      const { lab_distributor, brand_lab, range_names } = row;

      if (!labDistributorsMap[lab_distributor]) {
        labDistributorsMap[lab_distributor] = {
          lab_distributor,
          brand_labs: []
        };
      }

      const labDistributor = labDistributorsMap[lab_distributor];
      const existingBrandLab = labDistributor.brand_labs.find(
        bl => bl.brand_lab === brand_lab
      );

      if (existingBrandLab) {
        const validRangeNames = range_names.filter(rn => rn && rn.trim() !== '');
        existingBrandLab.range_names.push(
          ...validRangeNames.map(rn => ({ range_name: rn }))
        );
      } else {
        const validRangeNames = range_names.filter(rn => rn && rn.trim() !== '');
        labDistributor.brand_labs.push({
          brand_lab,
          range_names: validRangeNames.map(rn => ({ range_name: rn }))
        });
      }
    });

    const labDistributors: LabDistributor[] = Object.values(labDistributorsMap);

    return res.status(200).json(labDistributors);
  } catch (error) {
    console.error('Erreur lors de la récupération des distributeurs:', error);
    return res
      .status(500)
      .json({ error: 'Échec de la récupération des données depuis la base' });
  }
}
