import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useFilterContext } from "@/contexts/global/filtersContext";
import UniversDashboard from "../../components/UniversDashboard";

const UniverseDashboard = () => {
  const { query } = useRouter();
  const { slug } = query;
  const { handleClearAllFilters, setFilters } = useFilterContext();
  const initialized = useRef(false); // Flag pour éviter les boucles infinies

  useEffect(() => {
    console.log("Query object:", query); // Log de l'objet query
    console.log("Slug from query:", slug); // Log du slug récupéré

    if (slug && !initialized.current) {
      initialized.current = true; // Marque comme initialisé pour ne pas répéter

      const universeName = (slug as string).replace(/-/g, " ").toUpperCase();
      console.log("Universe Name:", universeName); // Log du nom de l'univers

      // Actions liées aux filtres
      console.log("Clearing all filters...");
      handleClearAllFilters();
      console.log(`Setting filter for universe: [${universeName}]`);
      setFilters({ universe: [universeName] });
    }
  }, [slug, query, handleClearAllFilters, setFilters]);

  return <UniversDashboard />;
};

export default UniverseDashboard;
