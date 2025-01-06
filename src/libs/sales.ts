import { Sale } from "@/types/Sale";
import { fetchData } from "./fetch";

export const fetchSales = async (
  page: number,
  limit: number
): Promise<{ sales: Sale[]; total: number }> => {
  return await fetchData<{ sales: Sale[]; total: number }>(
    `/api/data_sale?page=${page}&limit=${limit}`,
    (data: unknown) => {
      if (
        typeof data !== 'object' ||
        data === null ||
        !('sales' in data) ||
        !('total' in data) ||
        !Array.isArray((data as { sales: unknown }).sales) ||
        typeof (data as { total: unknown }).total !== 'number'
      ) {
        throw new Error('Invalid data format');
      }
      return data as { sales: Sale[]; total: number };
    }
  );
};



