import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useFilterContext } from "@/contexts/global/filtersContext";
import CategoryDashboardData from "../../components/CategoryDasboard";

const CategoryDashboard = () => {
  const { query } = useRouter();
  const { slug } = query;
  const { handleClearAllFilters, setFilters } = useFilterContext();
  const initialized = useRef(false); // Flag pour éviter la boucle infinie

  useEffect(() => {
    if (slug && !initialized.current) {
      initialized.current = true; // Marque comme initialisé pour ne pas répéter
      const categoryName = (slug as string).replace(/-/g, " ");
      
      // Réinitialiser les filtres et définir le nouveau filtre
      handleClearAllFilters();
      setFilters({ category: [categoryName] });
    }
  }, [slug, handleClearAllFilters, setFilters]);

  return <CategoryDashboardData />;
};

export default CategoryDashboard;