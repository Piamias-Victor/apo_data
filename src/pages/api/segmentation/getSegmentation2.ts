import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/libs/fetch/db";

interface SubCategory {
  sub_category: string;
}

interface Category {
  category: string;
  sub_categories: SubCategory[];
}

interface Universe {
  universe: string;
  categories: Category[];
}

interface Distributor {
  lab_distributor: string;
  brands: Brand[];
}

interface Brand {
  brand_lab: string;
  ranges: Range[];
}

interface Range {
  range_name: string;
}

interface Family {
  family: string;
  sub_families: SubFamily[];
}

interface SubFamily {
  sub_family: string;
}

interface Specificity {
  specificity: string;
}

interface Code13Ref {
  code_13_ref: string;
  name: string;
}

/**
 * API pour récupérer :
 * - Les univers avec catégories et sous-catégories
 * - Les distributeurs avec marques et gammes (SANS DOUBLONS)
 * - Les familles avec sous-familles
 * - Les spécificités
 * - Tous les codes 13 ref uniques avec le bon nom du produit
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    universes: Universe[];
    distributors: Distributor[];
    families: Family[];
    specificities: Specificity[];
    codes13: Code13Ref[];
  } | { error: string }>
) {
  try {
    // Requête SQL pour récupérer les univers, catégories et sous-catégories
    const queryUniverses = `
      SELECT DISTINCT universe, category, sub_category
      FROM data_globalproduct
      WHERE universe IS NOT NULL AND universe <> ''
      ORDER BY universe ASC, category ASC, sub_category ASC;
    `;

    // Requête SQL pour récupérer les distributeurs, marques et gammes
    const queryDistributors = `
      SELECT DISTINCT lab_distributor, brand_lab, range_name
      FROM data_globalproduct
      WHERE lab_distributor IS NOT NULL AND lab_distributor <> ''
      ORDER BY lab_distributor ASC, brand_lab ASC, range_name ASC;
    `;

    // Requête SQL pour récupérer les familles et sous-familles
    const queryFamilies = `
      SELECT DISTINCT family, sub_family
      FROM data_globalproduct
      WHERE family IS NOT NULL AND family <> ''
      ORDER BY family ASC, sub_family ASC;
    `;

    // Requête SQL pour récupérer les spécificités
    const querySpecificities = `
      SELECT DISTINCT specificity
      FROM data_globalproduct
      WHERE specificity IS NOT NULL AND specificity <> ''
      ORDER BY specificity ASC;
    `;

    // Requête SQL pour récupérer les codes 13 ref avec le bon nom du produit
    const queryCodes13 = `
      SELECT DISTINCT 
        g.code_13_ref,
        CASE 
          WHEN g.name = 'Default Name' THEN (
            SELECT i.name FROM data_internalproduct i 
            WHERE i.code_13_ref_id = g.code_13_ref 
            ORDER BY i.created_at ASC LIMIT 1
          )
          ELSE g.name
        END AS name
      FROM data_globalproduct g
      WHERE g.code_13_ref IS NOT NULL AND g.code_13_ref <> ''
      ORDER BY g.code_13_ref ASC
      LIMIT 10;
    `;

    // Exécution des requêtes en parallèle
    const [resultUniverses, resultDistributors, resultFamilies, resultSpecificities, resultCodes13] =
      await Promise.all([
        pool.query<{ universe: string; category: string; sub_category: string }>(queryUniverses),
        pool.query<{ lab_distributor: string; brand_lab: string; range_name: string }>(
          queryDistributors
        ),
        pool.query<{ family: string; sub_family: string }>(queryFamilies),
        pool.query<{ specificity: string }>(querySpecificities),
        pool.query<{ code_13_ref: string; name: string }>(queryCodes13),
      ]);

    if (
      resultUniverses.rows.length === 0 &&
      resultDistributors.rows.length === 0 &&
      resultFamilies.rows.length === 0 &&
      resultSpecificities.rows.length === 0 &&
      resultCodes13.rows.length === 0
    ) {
      return res.status(404).json({ error: "Aucune donnée trouvée" });
    }

    // 🟢 Transformation des données 🟢

    // 1️⃣ Regrouper Univers, Catégories et Sous-Catégories
    const universesMap = new Map<string, Universe>();
    resultUniverses.rows.forEach((row) => {
      if (!universesMap.has(row.universe)) {
        universesMap.set(row.universe, { universe: row.universe, categories: [] });
      }
      const universe = universesMap.get(row.universe)!;

      let category = universe.categories.find((c) => c.category === row.category);
      if (!category) {
        category = { category: row.category, sub_categories: [] };
        universe.categories.push(category);
      }

      if (!category.sub_categories.some((s) => s.sub_category === row.sub_category)) {
        category.sub_categories.push({ sub_category: row.sub_category });
      }
    });

    const universes = Array.from(universesMap.values());

    // 2️⃣ Regrouper Distributeurs, Marques et Gammes (ÉVITE LES DOUBLONS)
    const distributorsMap = new Map<string, Distributor>();

    resultDistributors.rows.forEach((row) => {
      if (!distributorsMap.has(row.lab_distributor)) {
        distributorsMap.set(row.lab_distributor, {
          lab_distributor: row.lab_distributor,
          brands: [],
        });
      }

      const distributor = distributorsMap.get(row.lab_distributor)!;

      let brand = distributor.brands.find((b) => b.brand_lab === row.brand_lab);
      if (!brand) {
        brand = { brand_lab: row.brand_lab, ranges: [] };
        distributor.brands.push(brand);
      }

      if (!brand.ranges.some((r) => r.range_name === row.range_name)) {
        brand.ranges.push({ range_name: row.range_name });
      }
    });

    const distributors = Array.from(distributorsMap.values());

    // 3️⃣ Regrouper Familles et Sous-Familles
    const familiesMap = new Map<string, Family>();
    resultFamilies.rows.forEach((row) => {
      if (!familiesMap.has(row.family)) {
        familiesMap.set(row.family, { family: row.family, sub_families: [] });
      }
      const family = familiesMap.get(row.family)!;
      if (!family.sub_families.some((s) => s.sub_family === row.sub_family)) {
        family.sub_families.push({ sub_family: row.sub_family });
      }
    });

    const families = Array.from(familiesMap.values());

    // 4️⃣ Récupération des spécificités
    const specificities = resultSpecificities.rows.map((row) => ({
      specificity: row.specificity,
    }));

    // 5️⃣ Récupération des codes 13 références
    const codes13 = resultCodes13.rows.map((row) => ({
      code_13_ref: row.code_13_ref,
      name: row.name,
    }));

    return res.status(200).json({ universes, distributors, families, specificities, codes13 });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données:", error);
    return res.status(500).json({ error: "Échec de la récupération des données" });
  }
}