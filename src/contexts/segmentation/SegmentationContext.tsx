import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Définition des types
interface SubCategory {
  sub_category: string;
}

interface Category {
  category: string;
  sub_categories: SubCategory[];
}

interface Universe {
  universe: string;
  categories: Category[];
}

interface Distributor {
  lab_distributor: string;
  brands: Brand[];
}

interface Brand {
  brand_lab: string;
  ranges: Range[];
}

interface Range {
  range_name: string;
}

interface Family {
  family: string;
  sub_families: SubFamily[];
}

interface SubFamily {
  sub_family: string;
}

interface Specificity {
  specificity: string;
}

interface Code13Ref {
  code_13_ref: string;
  name: string;
}

interface SegmentationContextType {
  universes: Universe[];
  distributors: Distributor[];
  families: Family[];
  specificities: Specificity[];
  codes13: Code13Ref[];
  loading: boolean;
  error: string | null;
}

const SegmentationContext = createContext<SegmentationContextType | undefined>(undefined);

// Hook personnalisé pour accéder au contexte
export const useSegmentationContext = () => {
  const context = useContext(SegmentationContext);
  if (!context) {
    throw new Error('useSegmentationContext doit être utilisé à l’intérieur de SegmentationProvider');
  }
  return context;
};

// Provider pour charger les données
export const SegmentationProvider = ({ children }: { children: React.ReactNode }) => {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [specificities, setSpecificities] = useState<Specificity[]>([]);
  const [codes13, setCodes13] = useState<Code13Ref[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/segmentation/getSegmentation'); // Ton API

        setUniverses(data.universes);
        setDistributors(data.distributors);
        setFamilies(data.families);
        setSpecificities(data.specificities);
        setCodes13(data.codes13);
      } catch (err) {
        console.error(err)
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SegmentationContext.Provider value={{ universes, distributors, families, specificities, codes13, loading, error }}>
      {children}
    </SegmentationContext.Provider>
  );
};