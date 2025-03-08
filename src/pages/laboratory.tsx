import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useFilterContext } from "@/contexts/FilterContext";
import SelectedLabsList from "@/components/laboratory/SelectedLabsList";
import LabDropdown from "@/components/laboratory/LabDropdown";
import { tabItems } from "@/components/tabItems";
import Tabs from "@/components/ui/Tabs";

const LaboratoryPage: React.FC = () => {
  const router = useRouter();
  const { brand } = router.query;
  const { filters, setFilters } = useFilterContext();

  // Applique automatiquement le filtre si un `brand` est présent dans l'URL
  useEffect(() => {
    if (typeof brand === "string" && !filters.brands.includes(brand)) {
      setFilters({ brands: [...filters.brands, brand] });
    }
  }, [brand, setFilters, filters.brands]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Sélectionner un Laboratoire
      </h1>
      <LabDropdown />
      <SelectedLabsList />
      <div className="mt-8">
        <Tabs tabs={tabItems} defaultIndex={0} />
      </div>
    </div>
  );
};

export default LaboratoryPage;