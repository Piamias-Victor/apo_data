// /libs/productsCode13.ts
import { fetchData } from '@/libs/fetch';
import { ProductCode13 } from '@/types/Product';

/**
 * Récupère la liste (code_13_ref, name) depuis `/api/products_code13`.
 */
export const fetchProductsCode13 = async (): Promise<ProductCode13[]> => {
  const data = await fetchData<ProductCode13[]>('/api/products', (data: unknown) => {
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide (ProductsCode13)');
    }
    return data as ProductCode13[];
  });

  return data;
};
