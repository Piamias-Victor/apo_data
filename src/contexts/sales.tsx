// src/contexts/sales.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types/Sale';

/**
 * Type définissant la structure du contexte des ventes multiples.
 */
type SalesContextType = {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  total: number
};

/**
 * Création du contexte pour les ventes multiples.
 */
const SalesContext = createContext<SalesContextType | undefined>(undefined);

/**
 * Provider pour le contexte des ventes multiples.
 * 
 * Enveloppe les composants enfants et fournit les ventes récupérées via `useSales`.
 * 
 * @param children - Les composants enfants à envelopper.
 * @returns Un composant React fournissant le contexte des ventes multiples.
 */
export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const { sales, total, loading, error } = useSales();

  return (
    <SalesContext.Provider value={{ sales, total, loading, error }}>
      {children}
    </SalesContext.Provider>
  );
};


/**
 * Hook personnalisé pour consommer le contexte des ventes multiples.
 * 
 * @returns Le contexte des ventes multiples (`SalesContextType`).
 * @throws Erreur si utilisé en dehors du `SalesProvider`.
 */
export const useSalesContext = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSalesContext must be used within a SalesProvider');
  }
  return context;
};
