import ActionButtons from "@/components/ui/buttons/ActionButtons";
import SearchInput from "@/components/ui/inputs/SearchInput";
import Loader from "@/components/ui/Loader";
import { useFilterContext, FilterState } from "@/contexts/FilterContext";
import { useState, useEffect } from "react";
import SegmentationFilter from "./SegmentationFilter";

interface Segmentation {
  lab_name: string; // Ajout du nom du labo
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
  const [segmentation, setSegmentation] = useState<Record<string, Segmentation[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const hasSelectedLabs = filters.distributors.length > 0 || filters.brands.length > 0;
  const dateRange: [Date | null, Date | null] = filters.dateRange ?? [null, null];

  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    ...filters,
    dateRange,
  });

  useEffect(() => {
    if (!hasSelectedLabs) return;

    setLoading(true);
    setError(null);

    const fetchAllSegmentations = async () => {
      try {
        const segmentationData: Record<string, Segmentation[]> = {};

        for (const lab of [...filters.distributors, ...filters.brands]) {
          const response = await fetch("/api/segmentation/getLaboratorySegmentation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lab }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Erreur de récupération des données");

          segmentationData[lab] = data.segmentation.filter((seg) => seg.lab_name === lab); // ✅ Filtrage précis
        }

        setSegmentation(segmentationData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchAllSegmentations();
  }, [filters]);

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

      {!loading && !error && Object.keys(segmentation).length > 0 && (
        <>
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un élément de segmentation..." />

          {Object.entries(segmentation).map(([lab, segmentationData], index) => (
            <div
              key={lab}
              className={`mb-6 p-4 border rounded-lg shadow ${
                index % 2 === 0 ? "bg-teal-100 border-teal-500" : "bg-blue-100 border-blue-500"
              }`}
            >
              <h3 className="text-lg font-bold text-teal-700">{lab}</h3>

              {segmentationFilters.map(({ key, dataKey, label }) => {
                const values = Array.from(
                  new Set(
                    segmentationData
                      .map((item) => item[dataKey as keyof Segmentation])
                      .flat()
                      .filter((val): val is string => typeof val === "string" && val.trim() !== "")
                  )
                );

                return (
                  values.length > 0 && (
                    <SegmentationFilter
                      key={`${lab}-${key}`}
                      label={label}
                      values={values}
                      filterKey={key as keyof FilterState}
                      selectedFilters={selectedFilters}
                      toggleFilter={toggleFilter}
                    />
                  )
                );
              })}
            </div>
          ))}

          <ActionButtons onApply={applyFilters} onReset={resetFilters} isApplied={isApplied} />
        </>
      )}
    </div>
  );
};

export default SegmentationDisplay;