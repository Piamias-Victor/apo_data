import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useFilterContext } from "@/contexts/FilterContext";
import SelectedSegmentationList from "@/components/segmentation/SelectedSegmentationList";
import SegmentationDropdown from "@/components/segmentation/SegmentationDropdown";
import { tabItemsSegmentation } from "../components/tabItemsSegmentation";
import Tabs from "@/components/ui/Tabs";

const SegmentationPage: React.FC = () => {
  const router = useRouter();
  const { query } = router; // 📌 Récupération des paramètres de l'URL
  const { filters, setFilters } = useFilterContext();

  // 📌 Mapping entre les paramètres d'URL et les clés de `FilterState`
  const segmentMapping: Record<string, keyof typeof filters> = {
    universe: "universes",
    category: "categories",
    subCategory: "subCategories",
    distributor: "distributors",
    brand: "brands",
    family: "families",
    subFamily: "subFamilies",
    specificity: "specificities",
    range: "ranges",
  };

  // 🚀 **Effet pour appliquer les filtres depuis l'URL**
  useEffect(() => {
    const newFilters: Partial<typeof filters> = { ...filters }; // Garde les filtres existants

    Object.keys(query).forEach((param) => {
      const filterKey = segmentMapping[param]; // Vérifie si le paramètre correspond à un filtre
      if (filterKey) {
        const paramValue = query[param];

        if (paramValue) {
          const values = Array.isArray(paramValue) ? paramValue : [paramValue];

          // 📌 Vérifie si le filtre est déjà appliqué avant de modifier `setFilters`
          if (JSON.stringify(filters[filterKey]) !== JSON.stringify(values)) {
            newFilters[filterKey] = values;
          }
        }
      }
    });

    // 📌 Applique uniquement si une mise à jour est nécessaire
    if (JSON.stringify(filters) !== JSON.stringify(newFilters)) {
      setFilters(newFilters);
    }
  }, [query]); // **Dépendance uniquement à `query` pour éviter une boucle infinie**

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Sélectionner un Segment</h1>
      <SegmentationDropdown />
      <SelectedSegmentationList />
      <div className="mt-8">
        <Tabs tabs={tabItemsSegmentation} defaultIndex={0} />
      </div>
    </div>
  );
};

export default SegmentationPage;