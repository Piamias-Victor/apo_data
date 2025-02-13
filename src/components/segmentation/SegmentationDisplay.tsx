import { useState, useEffect } from "react";
import { FilterState, useFilterContext } from "@/contexts/FilterContext";
import ActionButtons from "../ui/buttons/ActionButtons";
import Loader from "../ui/Loader";
import SegmentationFilter from "./SegmentationFilter";
import SearchInput from "../ui/inputs/SearchInput";

interface Segmentation {
  universe: string;
  category: string;
  sub_category: string;
  family: string;
  sub_family: string;
  specificity: string;
  ranges: string[];
}

const SegmentationDisplay: React.FC = () => {
  const { filters, setFilters } = useFilterContext();
  const [segmentation, setSegmentation] = useState<Segmentation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ État pour la recherche

  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0;
  const dateRange: [Date | null, Date | null] = filters.dateRange ?? [null, null];

  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    ...filters,
    dateRange,
  });

  useEffect(() => {
    if (!hasSelectedLabs) return;

    const fetchSegmentation = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/segmentation/getLaboratorySegmentation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur de récupération des données");

        setSegmentation(data.segmentation);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentation();
  }, [filters, hasSelectedLabs]);

  if (!hasSelectedLabs) return null;

  const segmentationFilters = [
    { key: "ranges", dataKey: "ranges", label: "📊 Gammes" },
    { key: "universes", dataKey: "universe", label: "🌍 Univers" },
    { key: "categories", dataKey: "category", label: "📂 Catégories" },
    { key: "subCategories", dataKey: "sub_category", label: "📑 Sous-Catégories" },
    { key: "families", dataKey: "family", label: "🏠 Familles" },
    { key: "subFamilies", dataKey: "sub_family", label: "🔹 Sous-Familles" },
    { key: "specificities", dataKey: "specificity", label: "🔬 Spécificités" },
  ];

  // ✅ Fonction pour récupérer et filtrer les valeurs uniques par recherche
  const getFilteredValues = (key: keyof Segmentation): string[] => {
    const values =
      key === "ranges"
        ? Array.from(new Set(segmentation.flatMap((item) => item.ranges).filter(Boolean)))
        : Array.from(new Set(segmentation.map((item) => item[key]).filter(Boolean)));

    return values
      .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" })) // ✅ Tri alphabétique
      .filter((value) => value.toLowerCase().includes(searchTerm.toLowerCase())); // ✅ Filtrage dynamique
  };

  const toggleFilter = (filterKey: keyof FilterState, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: prev[filterKey]?.includes(value)
        ? prev[filterKey]?.filter((item: string) => item !== value)
        : [...(prev[filterKey] || []), value],
    }));
  };

  const applyFilters = () => {
    setFilters({ ...selectedFilters, dateRange });
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 1000);
  };

  const resetFilters = () => {
    const clearedFilters: Partial<FilterState> = {
      universes: [],
      categories: [],
      subCategories: [],
      families: [],
      subFamilies: [],
      specificities: [],
      ranges: [],
      dateRange: [null, null],
    };
    setSelectedFilters({ ...filters, ...clearedFilters });
    setFilters(clearedFilters);
  };

  return (
    <div className="mt-4 w-full">
      {loading && <Loader />}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && segmentation.length > 0 && (
        <>
          {/* ✅ Utilisation du composant SearchInput */}
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un élément de segmentation..." />

          {/* ✅ Affichage des segments filtrés */}
          {segmentationFilters.map(({ key, dataKey, label }) => (
            <SegmentationFilter
              key={key}
              label={label}
              values={getFilteredValues(dataKey as keyof Segmentation)}
              filterKey={key as keyof FilterState}
              selectedFilters={selectedFilters}
              toggleFilter={toggleFilter}
            />
          ))}

          <ActionButtons onApply={applyFilters} onReset={resetFilters} isApplied={isApplied} />
        </>
      )}
    </div>
  );
};

export default SegmentationDisplay;