import { SortConfig } from './types';
import { ReactNode } from 'react';

/**
 * Trie un tableau de données selon la configuration de tri spécifiée
 */
export const sortData = <T>(data: T[], sortConfig: SortConfig<T>): T[] => {
  if (!sortConfig.key) return [...data];

  return [...data].sort((a, b) => {
    const key = sortConfig.key as keyof T;
    let valueA = a[key];
    let valueB = b[key];

    // Gestion des valeurs nulles
    if (valueA === null || valueA === undefined) {
      valueA = typeof valueA === 'string' ? '' as any : -Infinity as any;
    }
    if (valueB === null || valueB === undefined) {
      valueB = typeof valueB === 'string' ? '' as any : -Infinity as any;
    }

    // Tri en fonction du type de données
    const isNumeric = typeof valueA === 'number';
    
    if (isNumeric) {
      return sortConfig.direction === 'asc' 
        ? Number(valueA) - Number(valueB) 
        : Number(valueB) - Number(valueA);
    } else {
      return sortConfig.direction === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    }
  });
};

/**
 * Filtre un tableau de données selon une requête de recherche et des clés spécifiées
 */
export const filterData = <T>(data: T[], searchQuery: string, searchKeys: (keyof T)[]): T[] => {
  if (!searchQuery) return data;
  
  const query = searchQuery.toLowerCase();
  
  return data.filter(item => 
    searchKeys.some(key => {
      const value = item[key];
      return value !== null && 
        value !== undefined && 
        String(value).toLowerCase().includes(query);
    })
  );
};

/**
 * Calcule et affiche l'évolution entre deux valeurs
 */
export const getEvolution = (current: number, previous?: number): ReactNode => {
  if (previous === undefined || previous === null) {
    return <span className="text-gray-500">N/A</span>;
  }
  
  if (previous === 0) {
    return current > 0 
      ? <span className="text-green-500">+100%</span> 
      : <span className="text-gray-500">0%</span>;
  }

  const percentage = ((current - previous) / previous) * 100;
  const isPositive = percentage >= 0;

  return (
    <span className={isPositive ? "text-green-500" : "text-red-500"}>
      {isNaN(percentage) || !isFinite(percentage) 
        ? "0%" 
        : (isPositive ? "+" : "") + percentage.toFixed(1) + "%"}
    </span>
  );
};

/**
 * Formatte un nombre selon les conventions de l'application
 * Note: Cette fonction devrait être remplacée par la vôtre (formatLargeNumber)
 */
export const formatNumber = (value: number, formatAsPrice = true): string => {
  if (formatAsPrice) {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  
  return new Intl.NumberFormat('fr-FR').format(value);
};