// src/libs/fetch.ts

/**
 * Fonction générique pour effectuer des requêtes fetch et transformer les données.
 * 
 * @template T - Le type des données transformées à retourner.
 * @param url - L'URL de l'API à appeler.
 * @param formatData - Fonction de transformation des données reçues.
 * @returns Une promesse résolvant en les données transformées de type T.
 * @throws Erreur si la requête échoue ou si la réponse n'est pas OK.
 */
export const fetchData = async <T>(
  url: string,
  formatData: (data: unknown) => T
): Promise<T> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Échec de la requête vers ${url}: ${response.statusText}`);
    }
    const data: unknown = await response.json();
    return formatData(data);
  } catch (error) {
    console.error(`Erreur lors de la récupération des données depuis ${url}:`, error);
    throw error;
  }
};
