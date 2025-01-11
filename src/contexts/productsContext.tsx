// /contexts/productsCode13Context.tsx
import { useProductsCode13 } from '@/hooks/useProducts';
import { ProductCode13 } from '@/types/Product';
import React, { createContext, useContext, ReactNode } from 'react';

type ProductsCode13ContextType = {
  productsCode13: ProductCode13[];
  loading: boolean;
  error: string | null;
};

const ProductsCode13Context = createContext<ProductsCode13ContextType | undefined>(undefined);

export const ProductsCode13Provider = ({ children }: { children: ReactNode }) => {
  const { productsCode13, loading, error } = useProductsCode13();

  return (
    <ProductsCode13Context.Provider value={{ productsCode13, loading, error }}>
      {children}
    </ProductsCode13Context.Provider>
  );
};

export const useProductsCode13Context = () => {
  const context = useContext(ProductsCode13Context);
  if (!context) {
    throw new Error('useProductsCode13Context doit être utilisé dans un ProductsCode13Provider');
  }
  return context;
};
