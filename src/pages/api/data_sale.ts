import pool from "@/libs/db";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Type définissant la structure d'une vente.
 */
type Sale = {
  id: number;
  created_at: string;
  updated_at: string;
  quantity: number;
  date: string;
  product_id: number;
  // Ajoutez d'autres champs si nécessaire
};

/**
 * Handler API pour récupérer les 100 premières ventes.
 * 
 * @param req - Requête HTTP entrante.
 * @param res - Réponse HTTP sortante.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Sale[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const limit = 100;
    const query = `SELECT * FROM data_sales ORDER BY id LIMIT $1`;
    const result = await pool.query<Sale>(query, [limit]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur de la base de données :", error);
    return res.status(500).json({ error: "Échec de la récupération des données" });
  }
}
