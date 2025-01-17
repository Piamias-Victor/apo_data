// /libs/financialData.ts
import { fetchData } from "@/libs/fetch";

interface FinancialData {
  totalRevenue: number;
  totalPurchase: number;
}

export const fetchFinancialData = async (): Promise<FinancialData> => {
  const data = await fetchData<FinancialData>("/api/financial-data", (data: unknown) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("totalRevenue" in data) ||
      !("totalPurchase" in data)
    ) {
      throw new Error("Format de données invalide pour les données financières");
    }
    return data as FinancialData;
  });

  return data;
};
