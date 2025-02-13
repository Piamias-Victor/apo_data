import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Pharmacy {
  id: string;
  id_nat: string | null;
  name: string;
  ca: number | null;
  area: string | null;
  employees_count: number | null;
  address: string | null;
}

interface PharmacyContextType {
  pharmacies: Pharmacy[];
  loading: boolean;
  error: string | null;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const usePharmacyContext = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacyContext doit être utilisé à l’intérieur de PharmacyProvider');
  }
  return context;
};

export const PharmacyProvider = ({ children }: { children: React.ReactNode }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        console.log("🔍 Récupération de toutes les pharmacies...");
        const { data } = await axios.get('/api/segmentation/getPharmacies');
        setPharmacies(data.pharmacies);
      } catch (err: any) {
        console.error("❌ Erreur API Pharmacies :", err.response?.data || err.message);
        setError(err.response?.data?.error || 'Erreur lors du chargement des pharmacies');
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  return (
    <PharmacyContext.Provider value={{ pharmacies, loading, error }}>
      {children}
    </PharmacyContext.Provider>
  );
};