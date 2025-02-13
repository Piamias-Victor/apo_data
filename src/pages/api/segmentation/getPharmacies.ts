import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/fetch/db';

interface Pharmacy {
  id: string;
  id_nat: string | null;
  name: string;
  ca: number | null;
  area: string | null;
  employees_count: number | null;
  address: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ pharmacies: Pharmacy[] } | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    console.log("🟢 Récupération de toutes les pharmacies...");

    const query = `
      SELECT id, id_nat, name, ca, area, employees_count, address
      FROM data_pharmacy
      ORDER BY name ASC;
    `;

    const { rows } = await pool.query<Pharmacy>(query);

    console.log("✅ Nombre de pharmacies récupérées :", rows.length);

    return res.status(200).json({ pharmacies: rows });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des pharmacies :", error);
    return res.status(500).json({ error: "Échec de la récupération des données" });
  }
}