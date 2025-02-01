// /libs/dateUtils.ts

/**
 * Formate une chaîne de date ISO en format français 'dd/mm'.
 * @param isoString - Date au format ISO (ex: '2024-12-12T23:00:00.000Z')
 * @returns Date formatée en 'dd/mm' (ex: '12/12')
 */
export const formatDateToFrench = (isoString: string): string => {
    const [month, day] = isoString.split('T')[0].split('-');
    return `${day}/${month}`;
  };
  