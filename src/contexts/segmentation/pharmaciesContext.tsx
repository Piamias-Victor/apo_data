import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Définition du type pour une pharmacie
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

// Hook personnalisé pour accéder au contexte
export const usePharmacyContext = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacyContext doit être utilisé à l’intérieur de PharmacyProvider');
  }
  return context;
};

// Provider pour charger les données des pharmacies
export const PharmacyProvider = ({ children }: { children: React.ReactNode }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const { data } = await axios.get('/api/segmentation/getPharmacies'); // Ton API
        setPharmacies(data.pharmacies);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des pharmacies');
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