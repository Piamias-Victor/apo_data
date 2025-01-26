// src/pages/api/pharmacies.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/libs/fetch/db';
import { Pharmacy } from '@/types/Pharmacy';

/**
 * Type représentant la réponse de l'API des pharmacies.
 */
export interface PharmaciesResponse {
  pharmacies: Pharmacy[];
}

/**
 * API route pour récupérer toutes les pharmacies.
 * 
 * @param {NextApiRequest} req - Requête HTTP entrante.
 * @param {NextApiResponse<PharmaciesResponse | { error: string }>} res - Réponse HTTP à envoyer.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PharmaciesResponse | { error: string }>
) {
  try {
    const client = await pool.connect();

    // Obtenir toutes les pharmacies
    const pharmaciesResult = await client.query<Pharmacy>(
      `
      SELECT 
        id,
        created_at,
        updated_at,
        id_nat,
        name,
        ca,
        area,
        employees_count,
        address
      FROM 
        data_pharmacy
      `
    );

    client.release();

    res.status(200).json({ pharmacies: pharmaciesResult.rows });
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
