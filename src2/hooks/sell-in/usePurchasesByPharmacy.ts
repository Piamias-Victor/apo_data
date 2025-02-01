import { useEffect, useState } from "react";
import { useFilterContext } from "@/contexts/global/filtersContext";
import { fetchPurchasesByPharmacy, PurchasesByPharmacyData } from "@/libs/fetch/sell-in/fetchPurchasesByPharmacy";

export const usePurchasesByPharmacy = (skip = false) => {
  const { filters } = useFilterContext();
  const [purchasesByPharmacyData, setPurchasesByPharmacyData] = useState<PurchasesByPharmacyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(true);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchPurchasesByPharmacy(filters);
        setPurchasesByPharmacyData(fetchedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des achats par pharmacie :", err);
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, skip]);

  return { purchasesByPharmacyData, loading, error };
};