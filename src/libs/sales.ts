// /libs/sales.ts
import { fetchData } from "./fetch";
import { GroupedSale } from "@/types/Sale";

export const fetchGroupedSales = async (): Promise<{
  groupedSales: GroupedSale[];
  total: number;
}> => {
  const url = new URL("/api/sales", window.location.origin);

  // On n'ajoute pas de searchParams, car on ne gère pas de pagination
  // ni de filtre supplémentaire

  return await fetchData<{ groupedSales: GroupedSale[]; total: number }>(
    url.toString(),
    (data: unknown) => {
      if (
        typeof data !== "object" ||
        data === null ||
        !("groupedSales" in data) ||
        !("total" in data) ||
        !Array.isArray((data as { groupedSales: unknown }).groupedSales) ||
        typeof (data as { total: unknown }).total !== "number"
      ) {
        throw new Error("Invalid data format");
      }
      return data as { groupedSales: GroupedSale[]; total: number };
    }
  );
};
