// /hooks/useProductsCode13.ts
import { fetchProductsCode13 } from '@/libs/products';
import { ProductCode13 } from '@/types/Product';
import { useEffect, useState } from 'react';

export const useProductsCode13 = () => {
  const [productsCode13, setProductsCode13] = useState<ProductCode13[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getProductsCode13() {
      try {
        setLoading(true);
        const fetched = await fetchProductsCode13();
        setProductsCode13(fetched);
      } catch (err) {
        console.error('Erreur lors de la récupération des produits code 13:', err);
        setError('Échec de la récupération des produits');
      } finally {
        setLoading(false);
      }
    }

    getProductsCode13();
  }, []);

  return { productsCode13, loading, error };
};
